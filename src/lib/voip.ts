/**
 * VoIP integration placeholders.
 *
 * Replace these stubs with a Twilio / Exotel / Knowlarity / SIP provider
 * implementation when wiring up real telephony. The UI calls these and
 * reacts to the returned status transitions.
 */
import type { CallLog, CallStatus } from "./types";

export interface CallSession {
  id: string;
  phone: string;
  status: CallStatus;
  startedAt: number;
}

export type CallStatusListener = (status: CallStatus) => void;

let activeSession: CallSession | null = null;
const listeners = new Set<CallStatusListener>();

function emit(status: CallStatus) {
  listeners.forEach((l) => l(status));
}

export function onCallStatus(cb: CallStatusListener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export async function initiateCall(phone: string): Promise<CallSession> {
  const session: CallSession = {
    id: crypto.randomUUID(),
    phone,
    status: "dialing",
    startedAt: Date.now(),
  };
  activeSession = session;
  emit("dialing");
  // Simulated provider flow — replace with real SDK.
  setTimeout(() => {
    if (activeSession?.id === session.id) {
      activeSession.status = "ringing";
      emit("ringing");
    }
  }, 800);
  setTimeout(() => {
    if (activeSession?.id === session.id) {
      activeSession.status = "connected";
      emit("connected");
    }
  }, 2200);
  return session;
}

export function endCall(): void {
  if (!activeSession) return;
  activeSession.status = "ended";
  emit("ended");
  activeSession = null;
}

export function handleIncomingCall(_phone: string): void {
  // Hook for provider webhook / SDK event.
}

export function saveCallLog(_log: CallLog): void {
  // Hook so providers can mirror logs to their dashboards.
}

export function getActiveSession(): CallSession | null {
  return activeSession;
}
