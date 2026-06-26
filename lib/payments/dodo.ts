import { createHmac, timingSafeEqual } from "crypto";
import type { Analysis } from "@prisma/client";

type DodoCheckoutResponse = {
  session_id?: string;
  checkout_url?: string;
  payment_id?: string;
  error?: { message?: string; detail?: string; code?: string };
};

export type DodoWebhookEvent = {
  type?: string;
  event_type?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  custom_data?: Record<string, unknown>;
};

export class DodoCheckoutError extends Error {
  constructor(message = "Dodo checkout could not be created. Check Dodo API key and product configuration.") {
    super(message);
    this.name = "DodoCheckoutError";
  }
}

export function getDodoApiBase() {
  return process.env.DODO_ENVIRONMENT === "live" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function getDodoConfig() {
  return {
    apiKey: process.env.DODO_API_KEY,
    productId: process.env.DODO_PRODUCT_ID,
    webhookSecret: process.env.DODO_WEBHOOK_SECRET
  };
}

function assertDodoCheckoutConfig() {
  const config = getDodoConfig();
  if (!config.apiKey || !config.productId) {
    throw new DodoCheckoutError("Dodo checkout is not configured. Set DODO_API_KEY and DODO_PRODUCT_ID.");
  }
  return config as { apiKey: string; productId: string; webhookSecret?: string };
}

export async function createDodoCheckout({ token }: { token: string; analysis: Analysis }) {
  const config = assertDodoCheckoutConfig();
  const siteUrl = getSiteUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${getDodoApiBase()}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        product_cart: [{ product_id: config.productId, quantity: 1 }],
        return_url: `${siteUrl}/payment/success?provider=dodo&token=${encodeURIComponent(token)}`,
        cancel_url: `${siteUrl}/result/${encodeURIComponent(token)}`,
        metadata: {
          token,
          provider: "dodo",
          product: "resume_export_pass"
        }
      })
    });

    const payload = (await readDodoJson(response)) as DodoCheckoutResponse;
    if (!response.ok || !payload.checkout_url) {
      console.error("[dodo.checkout] checkout create failed", {
        status: response.status,
        statusText: response.statusText,
        errorCode: payload.error?.code ?? "unknown",
        errorMessage: payload.error?.message ?? payload.error?.detail ?? "No Dodo error message returned.",
        dodoEnvironment: process.env.DODO_ENVIRONMENT === "live" ? "live" : "test"
      });
      throw new DodoCheckoutError(payload.error?.detail || payload.error?.message);
    }

    return {
      checkoutUrl: payload.checkout_url,
      sessionId: payload.session_id,
      paymentId: payload.payment_id
    };
  } catch (error) {
    if (error instanceof DodoCheckoutError) throw error;
    console.error("[dodo.checkout] checkout create request failed", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : "Unknown Dodo request failure.",
      dodoEnvironment: process.env.DODO_ENVIRONMENT === "live" ? "live" : "test"
    });
    throw new DodoCheckoutError(error instanceof Error && error.name === "AbortError" ? "Dodo checkout timed out. Try again shortly." : undefined);
  } finally {
    clearTimeout(timeout);
  }
}

async function readDodoJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function verifyDodoWebhook({ rawBody, headers }: { rawBody: string; headers: Headers }) {
  const skipVerify = process.env.NODE_ENV === "development" && process.env.DODO_WEBHOOK_SKIP_VERIFY === "true";
  if (skipVerify) return true;

  const secret = getDodoConfig().webhookSecret;
  if (!secret) return false;

  const webhookId = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!webhookId || !timestamp || !signatureHeader) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Date.now() - timestampSeconds * 1000) > 5 * 60 * 1000) return false;

  const signedPayload = `${webhookId}.${timestamp}.${rawBody}`;
  const signingSecret = secret.startsWith("whsec_") ? Buffer.from(secret.slice("whsec_".length), "base64") : Buffer.from(secret);
  const expected = createHmac("sha256", signingSecret).update(signedPayload).digest("base64");
  return signatureHeader
    .split(" ")
    .some((signature) => {
      const [, value] = signature.split(",");
      return secureCompare(value || signature, expected);
    });
}

function secureCompare(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export function parseDodoWebhookEvent(event: DodoWebhookEvent) {
  const data = event.data;
  const payload = event.payload;
  return {
    eventType: event.type || event.event_type,
    token: findString(
      data?.metadata,
      data?.custom_data,
      event.metadata,
      event.custom_data,
      payload?.metadata,
      payload?.custom_data
    ),
    productId: findStringValue(data, ["product_id", "productId"]) || findStringValue(payload, ["product_id", "productId"]),
    paymentId: findStringValue(data, ["payment_id", "paymentId", "id"]) || findStringValue(payload, ["payment_id", "paymentId", "id"])
  };
}

function findString(...sources: Array<unknown>) {
  for (const source of sources) {
    if (source && typeof source === "object" && "token" in source) {
      const token = (source as { token?: unknown }).token;
      if (typeof token === "string") return token;
    }
  }
  return undefined;
}

function findStringValue(source: unknown, keys: string[]) {
  if (!source || typeof source !== "object") return undefined;
  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key];
    if (typeof value === "string") return value;
  }
  return undefined;
}

export function isExpectedDodoProduct(productId?: string) {
  const expected = process.env.DODO_PRODUCT_ID;
  return !productId || !expected || productId === expected;
}
