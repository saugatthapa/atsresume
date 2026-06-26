"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BadgeCheck, CheckCircle2, FileCheck2, FileDown, LifeBuoy, RefreshCw, ShieldCheck } from "lucide-react";

type StatusState = "confirmed" | "pending" | "error";

const benefits = [
  "Full optimized resume unlocked",
  "Clean resume PDF",
  "Editable DOCX file",
  "Full ATS match report",
  "Keyword gaps and bullet suggestions"
];

const nextSteps = [
  { title: "Download clean resume PDF", copy: "Open your result page and export a polished PDF.", Icon: FileDown },
  { title: "Download editable DOCX", copy: "Keep a Word copy ready for quick tailoring.", Icon: FileCheck2 },
  { title: "Review full ATS report", copy: "Use the complete keyword and bullet guidance.", Icon: ShieldCheck }
];

export function PaymentSuccessStatus({
  token,
  initialUnlocked,
  initialFound
}: {
  token?: string;
  initialUnlocked: boolean;
  initialFound: boolean;
}) {
  const hasValidToken = Boolean(token && token.length >= 20 && initialFound);
  const [state, setState] = useState<StatusState>(() => {
    if (!hasValidToken) return "error";
    return initialUnlocked ? "confirmed" : "pending";
  });
  const [checking, setChecking] = useState(hasValidToken && !initialUnlocked);
  const [timedOut, setTimedOut] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!token || !hasValidToken) return;
    setChecking(true);
    try {
      const response = await fetch(`/api/payment-status?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      const data = (await response.json()) as { paidStatus?: boolean };
      if (response.ok && data.paidStatus) {
        setState("confirmed");
        setTimedOut(false);
      }
    } catch {
      // Keep the pending state. Manual refresh and support remain available.
    } finally {
      setChecking(false);
    }
  }, [hasValidToken, token]);

  useEffect(() => {
    if (state !== "pending" || !token || !hasValidToken) return;

    let attempts = 0;
    let stopped = false;
    const interval = window.setInterval(() => {
      attempts += 1;
      void refreshStatus();
      if (attempts >= 10) {
        stopped = true;
        setTimedOut(true);
        window.clearInterval(interval);
      }
    }, 3000);

    return () => {
      if (!stopped) window.clearInterval(interval);
    };
  }, [hasValidToken, refreshStatus, state, token]);

  if (state === "error") {
    return (
      <SuccessShell tone="error" badge="Result not found" heading="We could not find this result">
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#64748b]">
          This success link is missing a valid result token. Please open your original result page or contact support.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="primary-button focus-ring inline-flex min-h-[50px] w-full items-center justify-center rounded-xl px-5 text-center font-extrabold sm:w-auto" href="/#checker">
            Go to Resume Checker
          </Link>
          <Link className="focus-ring inline-flex min-h-[50px] w-full items-center justify-center rounded-xl border border-[#d8e3f1] bg-white px-5 text-center font-extrabold text-[#0b1220] hover:bg-slate-50 sm:w-auto" href="/contact">
            Contact Support
          </Link>
        </div>
      </SuccessShell>
    );
  }

  const confirmed = state === "confirmed";
  const resultHref = token ? `/result/${token}` : "/#checker";

  return (
    <SuccessShell
      tone={confirmed ? "success" : "pending"}
      badge={confirmed ? "Payment successful" : "Payment processing"}
      heading={confirmed ? "Your Resume Export Pass is unlocked" : "We are confirming your payment"}
    >
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#64748b] md:text-lg">
        {confirmed
          ? "Your optimized resume files are ready. Open your result page to download the clean PDF, editable DOCX, and full ATS match report."
          : "Your payment was received by checkout, but the unlock may take a few seconds while confirmation reaches JobResumeMatch."}
      </p>

      {!confirmed && (
        <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-extrabold text-[#2563eb]">
          <span className="size-4 animate-spin rounded-full border-2 border-[#bfdbfe] border-t-[#2563eb]" aria-hidden="true" />
          {checking ? "Checking unlock status..." : timedOut ? "Still waiting for confirmation" : "Checking unlock status..."}
        </div>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {confirmed ? (
          <Link className="primary-button focus-ring inline-flex min-h-[52px] w-full items-center justify-center rounded-xl px-6 text-center font-extrabold sm:w-auto" href={resultHref}>
            Open My Unlocked Result
          </Link>
        ) : (
          <button className="primary-button focus-ring inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 text-center font-extrabold disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto" onClick={refreshStatus} disabled={checking}>
            <RefreshCw aria-hidden="true" size={18} className={checking ? "animate-spin" : ""} />
            Refresh Status
          </button>
        )}
        <Link className="focus-ring inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[#d8e3f1] bg-white px-6 text-center font-extrabold text-[#0b1220] hover:bg-slate-50 sm:w-auto" href={confirmed ? "/#checker" : resultHref}>
          {confirmed ? "Check Another Resume" : "Open Result Page"}
        </Link>
      </div>

      <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
        {nextSteps.map(({ title, copy, Icon }) => (
          <Link key={title} href={resultHref} className="focus-ring rounded-[18px] border border-[#d8e3f1] bg-[#fbfdff] p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
              <Icon aria-hidden="true" size={20} />
            </span>
            <h2 className="mt-4 text-sm font-black text-[#0b1220]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">{copy}</p>
          </Link>
        ))}
      </div>

      {confirmed && (
        <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
          {benefits.map((item) => (
            <p key={item} className="flex items-center gap-2 text-sm font-bold text-[#53657d]">
              <CheckCircle2 aria-hidden="true" size={17} className="shrink-0 text-[#16a34a]" />
              {item}
            </p>
          ))}
        </div>
      )}

      <p className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-2 text-sm leading-6 text-[#64748b]">
        <LifeBuoy aria-hidden="true" size={16} className="text-[#2563eb]" />
        {confirmed
          ? "A receipt is handled by Dodo Payments. If you need help,"
          : timedOut
            ? "If your result does not unlock within a minute, contact support with your payment email and result link."
            : "If confirmation takes longer than expected,"}
        <Link className="font-extrabold text-[#2563eb] hover:text-[#1d4ed8]" href="/contact">
          Contact Support
        </Link>
      </p>
    </SuccessShell>
  );
}

function SuccessShell({
  tone,
  badge,
  heading,
  children
}: {
  tone: "success" | "pending" | "error";
  badge: string;
  heading: string;
  children: ReactNode;
}) {
  const success = tone === "success";
  const error = tone === "error";

  return (
    <section className="mx-auto w-full max-w-[760px] rounded-[28px] border border-[#d8e3f1] bg-white px-6 py-8 text-center shadow-[0_28px_80px_-48px_rgba(8,20,51,0.38)] sm:px-10 sm:py-12 lg:px-14">
      <div className={`mx-auto flex size-16 items-center justify-center rounded-full ${success ? "bg-emerald-50 text-[#16a34a]" : error ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-[#2563eb]"}`}>
        {success ? <BadgeCheck aria-hidden="true" size={34} /> : error ? <LifeBuoy aria-hidden="true" size={32} /> : <ShieldCheck aria-hidden="true" size={32} />}
      </div>
      <p className={`mx-auto mt-5 inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ${success ? "bg-emerald-50 text-[#16a34a]" : error ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-[#2563eb]"}`}>
        {badge}
      </p>
      <h1 className="mx-auto mt-4 max-w-3xl text-balance break-words text-3xl font-black leading-tight tracking-tight text-[#0b1220] sm:text-4xl">
        {heading}
      </h1>
      {children}
    </section>
  );
}
