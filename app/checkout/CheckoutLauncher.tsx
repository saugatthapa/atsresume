"use client";

import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type PaddleEvent = {
  name?: string;
  data?: {
    id?: string;
  };
};

type PaddleGlobal = {
  Environment?: {
    set: (environment: "sandbox" | "production") => void;
  };
  Initialize: (options: {
    token: string;
    checkout?: {
      settings?: {
        displayMode?: "overlay";
        theme?: "light";
        locale?: "en";
        successUrl?: string;
      };
    };
    eventCallback?: (event: PaddleEvent) => void;
  }) => void;
};

declare global {
  interface Window {
    Paddle?: PaddleGlobal;
  }
}

const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const paddleEnvironment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox" ? "sandbox" : "production";

export function CheckoutLauncher() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("_ptxn");
  const resultToken = searchParams.get("token");
  const [scriptReady, setScriptReady] = useState(false);

  const status = useMemo(() => {
    if (!scriptReady) return "Preparing secure checkout...";
    if (!paddleClientToken) return "Paddle client-side token is missing. Set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and redeploy.";
    if (!transactionId) return "Missing Paddle transaction. Start checkout again from your result page.";
    if (typeof window !== "undefined" && !window.Paddle) return "Paddle checkout script did not load. Refresh this page or try again.";
    return "Opening Paddle checkout...";
  }, [scriptReady, transactionId]);

  const successUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL("/payment/success", window.location.origin);
    if (resultToken) url.searchParams.set("token", resultToken);
    if (transactionId) url.searchParams.set("transaction_id", transactionId);
    return url.toString();
  }, [resultToken, transactionId]);

  useEffect(() => {
    if (!scriptReady) return;
    if (!paddleClientToken) {
      return;
    }
    if (!transactionId) {
      return;
    }
    if (!window.Paddle) {
      return;
    }

    if (paddleEnvironment === "sandbox") {
      window.Paddle.Environment?.set("sandbox");
    }

    window.Paddle.Initialize({
      token: paddleClientToken,
      checkout: {
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
          successUrl
        }
      },
      eventCallback: (event) => {
        if (event.name === "checkout.completed") {
          trackEvent("checkout_completed");
          window.location.href = successUrl;
        }
        if (event.name === "checkout.closed" && resultToken) {
          window.location.href = `/result/${encodeURIComponent(resultToken)}`;
        }
      }
    });

  }, [scriptReady, resultToken, successUrl, transactionId]);

  return (
    <>
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} />
      <div className="rounded-[28px] border border-[#dde7f5] bg-white p-8 text-center shadow-[0_18px_44px_-28px_rgba(8,20,51,0.18)]">
        <p className="text-sm font-black uppercase tracking-wide text-[#2563eb]">Secure checkout</p>
        <h1 className="mt-3 text-4xl font-black text-[#0b1220]">Opening payment</h1>
        <p className="mt-4 leading-7 text-[#64748b]">{status}</p>
      </div>
    </>
  );
}
