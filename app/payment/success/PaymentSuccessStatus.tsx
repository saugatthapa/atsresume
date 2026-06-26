"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function PaymentSuccessStatus({ token, initialUnlocked }: { token: string; initialUnlocked: boolean }) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (initialUnlocked) {
      router.replace(`/result/${token}`);
      return;
    }

    let attempts = 0;
    let stopped = false;

    async function checkStatus() {
      attempts += 1;
      try {
        const response = await fetch(`/api/payment-status?token=${encodeURIComponent(token)}`, { cache: "no-store" });
        const data = (await response.json()) as { paidStatus?: boolean };
        if (data.paidStatus) {
          setUnlocked(true);
          router.replace(`/result/${token}`);
          stopped = true;
          return;
        }
      } catch {
        // Keep polling briefly. The result page remains the manual fallback.
      }

      if (attempts >= 15) {
        setTimedOut(true);
        stopped = true;
      }
    }

    void checkStatus();
    const interval = window.setInterval(() => {
      if (stopped) {
        window.clearInterval(interval);
        return;
      }
      void checkStatus();
    }, 2000);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [initialUnlocked, router, token]);

  return (
    <>
      <p className="mt-4 leading-7 text-[#64748b]">
        {unlocked
          ? "Your Resume Export Pass is unlocked. Opening your result..."
          : "Payment received. Your Resume Export Pass will unlock as soon as payment confirmation is received."}
      </p>
      {!unlocked && (
        <p className="mt-3 leading-7 text-[#64748b]">
          {timedOut
            ? "Payment confirmation is taking longer than usual. Open your result page and it will show as unlocked once the webhook arrives."
            : "Checking payment confirmation automatically..."}
        </p>
      )}
      <Link className="primary-button focus-ring mt-6 inline-flex rounded-xl px-5 py-3 font-extrabold" href={`/result/${token}`}>
        Open Result
      </Link>
    </>
  );
}
