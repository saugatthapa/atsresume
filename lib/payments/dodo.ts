import { createHmac, timingSafeEqual } from "crypto";
import type { Analysis } from "@prisma/client";

type DodoCheckoutResponse = {
  session_id?: string;
  checkout_url?: string;
  checkout_session_id?: string;
  payment_link?: string;
  url?: string;
  payment_id?: string;
  error?: { message?: string; detail?: string; code?: string };
  message?: string;
  detail?: string;
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

function getDodoEnvironment() {
  return process.env.DODO_ENVIRONMENT === "live" ? "live" : "test";
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
  const environment = getDodoEnvironment();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    console.info("[dodo.checkout] creating checkout", {
      provider: "dodo",
      environment,
      hasApiKey: Boolean(config.apiKey),
      hasProductId: Boolean(config.productId)
    });

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
          product: "resume_export_pass",
          environment
        },
        custom_data: {
          token,
          provider: "dodo",
          product: "resume_export_pass",
          environment
        }
      })
    });

    const payload = (await readDodoJson(response)) as DodoCheckoutResponse;
    const checkoutUrl = payload.checkout_url || payload.payment_link || payload.url;
    if (!response.ok || !checkoutUrl) {
      console.error("[dodo.checkout] checkout create failed", {
        provider: "dodo",
        environment,
        hasApiKey: Boolean(config.apiKey),
        hasProductId: Boolean(config.productId),
        status: response.status,
        statusText: response.statusText,
        errorCode: payload.error?.code ?? "unknown",
        errorMessage: summarizeDodoError(payload)
      });
      throw new DodoCheckoutError("Checkout could not be started. Please try again in a moment or contact support.");
    }

    return {
      checkoutUrl,
      sessionId: payload.session_id || payload.checkout_session_id,
      paymentId: payload.payment_id
    };
  } catch (error) {
    if (error instanceof DodoCheckoutError) throw error;
    console.error("[dodo.checkout] checkout create request failed", {
      provider: "dodo",
      environment,
      hasApiKey: Boolean(config.apiKey),
      hasProductId: Boolean(config.productId),
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : "Unknown Dodo request failure."
    });
    throw new DodoCheckoutError(error instanceof Error && error.name === "AbortError" ? "Checkout could not be started. Please try again in a moment or contact support." : undefined);
  } finally {
    clearTimeout(timeout);
  }
}

function summarizeDodoError(payload: DodoCheckoutResponse) {
  return payload.error?.message || payload.error?.detail || payload.message || payload.detail || "No Dodo error message returned.";
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
  const object = findObject(data, "object") || findObject(payload, "object");
  return {
    eventType: event.type || event.event_type,
    token: findString(
      data?.metadata,
      data?.custom_data,
      object?.metadata,
      object?.custom_data,
      event.metadata,
      event.custom_data,
      payload?.metadata,
      payload?.custom_data
    ),
    productId: findDeepStringValue(event, ["product_id", "productId"]),
    paymentId: findDeepStringValue(event, ["payment_id", "paymentId", "order_id", "orderId", "checkout_session_id", "checkoutSessionId", "id"])
  };
}

function findObject(source: unknown, key: string) {
  if (!source || typeof source !== "object") return undefined;
  const value = (source as Record<string, unknown>)[key];
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
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

function findDeepStringValue(source: unknown, keys: string[]): string | undefined {
  const direct = findStringValue(source, keys);
  if (direct) return direct;
  if (!source || typeof source !== "object") return undefined;

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findDeepStringValue(item, keys);
      if (found) return found;
    }
    return undefined;
  }

  for (const value of Object.values(source)) {
    if (!value || typeof value !== "object") continue;
    const found = findDeepStringValue(value, keys);
    if (found) return found;
  }

  return undefined;
}

export function isExpectedDodoProduct(productId?: string) {
  const expected = process.env.DODO_PRODUCT_ID;
  return !productId || !expected || productId === expected;
}
