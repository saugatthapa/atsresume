import { NextRequest, NextResponse } from "next/server";

type ActiveSession = {
  lastSeen: number;
};

const globalForActiveUsers = globalThis as unknown as {
  activeUserSessions?: Map<string, ActiveSession>;
};

const sessions = globalForActiveUsers.activeUserSessions ?? new Map<string, ActiveSession>();
globalForActiveUsers.activeUserSessions = sessions;

const activeWindowMs = 1000 * 60 * 2;

export async function GET() {
  pruneSessions();
  return NextResponse.json({ activeUsers: sessions.size });
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (typeof sessionId !== "string" || sessionId.length < 12 || sessionId.length > 80) {
      return NextResponse.json({ error: "Invalid session." }, { status: 400 });
    }

    pruneSessions();
    sessions.set(sessionId, { lastSeen: Date.now() });
    return NextResponse.json({ activeUsers: sessions.size });
  } catch {
    return NextResponse.json({ error: "Unable to update active users." }, { status: 500 });
  }
}

function pruneSessions() {
  const cutoff = Date.now() - activeWindowMs;
  for (const [sessionId, session] of sessions.entries()) {
    if (session.lastSeen < cutoff) sessions.delete(sessionId);
  }
}
