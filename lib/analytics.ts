export type AnalyticsEventName =
  | "resume_check_started"
  | "resume_check_completed"
  | "result_viewed"
  | "unlock_clicked"
  | "checkout_started"
  | "checkout_completed"
  | "download_resume_pdf"
  | "download_resume_docx"
  | "download_report_pdf";

type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("jobresumematch:event", { detail: { name, ...payload } }));
  window.dataLayer?.push({ event: name, ...payload });
}
