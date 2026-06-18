"use client";

import { LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function PaymentUnlockModal({ open, token, onClose }: { open: boolean; token?: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  async function startCheckout() {
    trackEvent("unlock_clicked");
    if (!token) {
      setError("Missing result token.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      trackEvent("checkout_started");
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await response.json();
      if (data.paidStatus && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      if (!response.ok || !data.checkoutUrl) throw new Error(data.error || "Unable to start checkout.");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment.");
    } finally {
      setLoading(false);
    }
  }

  async function devTestUnlock() {
    if (!token) {
      setError("Missing result token.");
      return;
    }

    setDevLoading(true);
    setError("");
    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Unable to run local test unlock.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to run local test unlock.");
    } finally {
      setDevLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="unlock-title">
      <div className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl">
        <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
          <LockKeyhole aria-hidden="true" size={24} />
        </span>
        <h2 id="unlock-title" className="text-2xl font-black text-[#0b1220]">
          JobResumeMatch Resume Export Pass
        </h2>
        <p className="mt-3 leading-7 text-[#64748b]">
          {process.env.NODE_ENV === "development"
            ? "Continue to Paddle checkout. Local test unlock is available separately below."
            : "Continue to secure checkout. Full report access is unlocked only after payment is verified."}
        </p>
        <div className="mt-5 rounded-[20px] border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm font-extrabold text-[#0b1220]">One-time unlock for this resume and job description</p>
          <p className="mt-1 text-4xl font-black text-[#2563eb]">€4.99</p>
        </div>
        {error && <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button className="primary-button focus-ring flex-1 rounded-xl px-4 py-3 font-extrabold disabled:cursor-not-allowed disabled:opacity-70" onClick={startCheckout} disabled={loading || devLoading}>
            {loading ? "Opening checkout..." : "Unlock Resume Export Pass - €4.99"}
          </button>
          <button className="focus-ring rounded-xl border border-[#dde7f5] px-4 py-3 font-extrabold text-[#0b1220] hover:bg-slate-50" onClick={onClose}>
            Cancel
          </button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Development tools</p>
            <button
              className="focus-ring mt-3 inline-flex w-full justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={devTestUnlock}
              disabled={loading || devLoading}
            >
              {devLoading ? "Running test unlock..." : "Local Test Unlock"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
