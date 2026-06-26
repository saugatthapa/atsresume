import { createHmac, timingSafeEqual } from "crypto";

// Deprecated Paddle helpers. Paddle is retained for reference only and is not
// used when PAYMENT_PROVIDER="dodo".
export type PaddleTransaction = {
  id: string;
  status?: string;
  custom_data?: { token?: string } | null;
  checkout?: { url?: string | null } | null;
  items?: Array<{ price?: { id?: string } | null; price_id?: string }>;
  payments?: Array<{ payment_attempt_id?: string; status?: string }>;
};

export type PaddleEvent = {
  event_type?: string;
  data?: PaddleTransaction;
};

type PaddleErrorPayload = {
  error?: {
    code?: string;
    detail?: string;
    message?: string;
    type?: string;
  };
};

export const paddleCheckoutFailureMessage =
  "Paddle checkout failed. Check that your Paddle API key has transaction.write permission and that your price ID matches the sandbox/live environment.";
const paddleCheckoutTimeoutMessage =
  "Paddle checkout timed out. Check that the server can reach Paddle and that the Paddle environment variables are set correctly.";

export class PaddleCheckoutError extends Error {
  constructor(message = paddleCheckoutFailureMessage) {
    super(message);
    this.name = "PaddleCheckoutError";
  }
}

export function getPaddleApiBase() {
  return process.env.PADDLE_ENVIRONMENT === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";
}

export function getPaddleConfig() {
  return {
    apiKey: process.env.PADDLE_API_KEY,
    webhookSecret: process.env.PADDLE_WEBHOOK_SECRET,
    priceId: process.env.PADDLE_PRICE_ID
  };
}

export function assertPaddleCheckoutConfig() {
  const config = getPaddleConfig();
  if (!config.apiKey || !config.priceId) {
    throw new Error("Paddle checkout is not configured. Set PADDLE_API_KEY and PADDLE_PRICE_ID.");
  }
  return config as { apiKey: string; webhookSecret?: string; priceId: string };
}

export async function createPaddleTransaction({ token }: { token: string }) {
  const config = assertPaddleCheckoutConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let response: Response;

  try {
    response = await fetch(`${getPaddleApiBase()}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        items: [{ price_id: config.priceId, quantity: 1 }],
        custom_data: {
          token
        }
      })
    });
  } catch (error) {
    console.error("[paddle.checkout] transaction create request failed", {
      errorName: error instanceof Error ? error.name : "unknown",
      errorMessage: error instanceof Error ? error.message : "Unknown Paddle request failure.",
      paddleEnvironment: process.env.PADDLE_ENVIRONMENT === "sandbox" ? "sandbox" : "live"
    });
    throw new PaddleCheckoutError(error instanceof Error && error.name === "AbortError" ? paddleCheckoutTimeoutMessage : paddleCheckoutFailureMessage);
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await readPaddleJson(response)) as { data?: PaddleTransaction } & PaddleErrorPayload;
  const transaction = payload.data;
  if (!response.ok || !transaction?.id || !transaction.checkout?.url) {
    console.error("[paddle.checkout] transaction create failed", {
      status: response.status,
      statusText: response.statusText,
      errorCode: payload.error?.code ?? "unknown",
      errorType: payload.error?.type ?? "unknown",
      errorMessage: payload.error?.message ?? payload.error?.detail ?? "No Paddle error message returned.",
      paddleEnvironment: process.env.PADDLE_ENVIRONMENT === "sandbox" ? "sandbox" : "live",
      priceIdPrefix: config.priceId.slice(0, 8)
    });
    throw new PaddleCheckoutError(payload.error?.detail || payload.error?.message || paddleCheckoutFailureMessage);
  }
  return transaction;
}

export async function retrievePaddleTransaction(transactionId: string) {
  const config = assertPaddleCheckoutConfig();
  const response = await fetch(`${getPaddleApiBase()}/transactions/${encodeURIComponent(transactionId)}`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
    cache: "no-store"
  });
  const payload = (await response.json()) as { data?: PaddleTransaction; error?: { detail?: string; message?: string } };
  if (!response.ok || !payload.data?.id) {
    throw new Error(payload.error?.detail || payload.error?.message || "Unable to retrieve Paddle transaction.");
  }
  return payload.data;
}

async function readPaddleJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function verifyPaddleWebhookSignature({
  payload,
  signatureHeader,
  secret,
  toleranceSeconds = 5
}: {
  payload: string;
  signatureHeader: string | null;
  secret: string;
  toleranceSeconds?: number;
}) {
  if (!signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(";").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const timestamp = parts.ts;
  const signature = parts.h1;
  if (!timestamp || !signature) return false;

  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs)) return false;
  if (Math.abs(Date.now() - timestampMs) > toleranceSeconds * 1000) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}:${payload}`).digest("hex");
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export function isPaidPaddleTransaction(transaction: PaddleTransaction) {
  return transaction.status === "paid" || transaction.status === "completed";
}

export function isExpectedPaddlePrice(transaction: PaddleTransaction) {
  const expectedPriceId = process.env.PADDLE_PRICE_ID;
  if (!expectedPriceId || !transaction.items?.length) return true;
  return transaction.items.some((item) => item.price?.id === expectedPriceId || item.price_id === expectedPriceId);
}
