"use client";

import { Activity } from "lucide-react";
import { useEffect, useState } from "react";

function getSessionId() {
  const key = "jobresumematch-active-session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const generated = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, generated);
  return generated;
}

export function ActiveUsersBadge() {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sessionId = getSessionId();

    async function heartbeat() {
      try {
        const response = await fetch("/api/active-users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        });
        const data = await response.json();
        if (!cancelled && typeof data.activeUsers === "number") setActiveUsers(data.activeUsers);
      } catch {
        if (!cancelled) setActiveUsers(null);
      }
    }

    heartbeat();
    const interval = window.setInterval(heartbeat, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (activeUsers === null) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-extrabold text-[#16a34a]">
      <Activity aria-hidden="true" size={16} />
      {activeUsers === 1 ? "1 active user now" : `${activeUsers} active users now`}
    </span>
  );
}
