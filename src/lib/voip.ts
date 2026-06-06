/**
 * VoIP integration with Telnyx.
 *
 * When the user has configured Telnyx as their provider, calls are placed
 * via the Telnyx API using server functions. For other providers or when
 * disconnected, the call flow simulates status transitions locally.
 */
import type { CallLog, CallStatus } from "./types";
import { auth } from "./auth";
import {
  makeTelnyxCall,
  getTelnyxCallDetails,
  requestTelnyxRecording,
  requestTelnyxTranscription,
} from "./api/telnyx.functions";

export interface CallSession {
  id: string;
  phone: string;
  status: CallStatus;
  startedAt: number;
  telnyxCallControlId?: string;
  telnyxCallId?: string;
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

  const user = auth.state.user;
  const isTelnyx = user?.voipProvider === "telnyx";
  const apiKey = user?.voipApiKey;
  const fromNumber = user?.voipNumber;
  const connectionId = user?.voipConnectionId;

  if (isTelnyx && apiKey && fromNumber && connectionId) {
    try {
      const result = await makeTelnyxCall({
        data: {
          apiKey,
          from: fromNumber,
          to: phone,
          connectionId,
        },
      });
      session.telnyxCallId = result.callId;
      session.telnyxCallControlId = result.callControlId;

      // Start recording + transcription
      if (result.callControlId) {
        try {
          await requestTelnyxRecording({
            data: { apiKey, callControlId: result.callControlId, channels: "dual" },
          });
        } catch {
          // ignore — recording is optional
        }
        try {
          await requestTelnyxTranscription({
            data: { apiKey, callControlId: result.callControlId },
          });
        } catch {
          // ignore — transcription is optional
        }
      }

      // Poll for status changes
      pollTelnyxStatus(session.id, result.callControlId, apiKey);
      return session;
    } catch (e) {
      console.error("Telnyx call failed:", e);
      session.status = "ended";
      emit("ended");
      activeSession = null;
      throw e;
    }
  }

  // Simulated provider flow for non-Telnyx or missing credentials
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

function pollTelnyxStatus(
  sessionId: string,
  callControlId: string,
  apiKey: string,
) {
  let attempts = 0;
  const maxAttempts = 120; // ~2 minutes at 1s intervals

  const interval = setInterval(async () => {
    attempts++;
    if (!activeSession || activeSession.id !== sessionId || attempts > maxAttempts) {
      clearInterval(interval);
      return;
    }

    try {
      const details = await getTelnyxCallDetails({
        data: { apiKey, callControlId },
      });

      const statusMap: Record<string, CallStatus> = {
        ringing: "ringing",
        answered: "connected",
        bridged: "connected",
        completed: "ended",
        busy: "ended",
        failed: "ended",
        no_answer: "missed",
        cancelled: "ended",
      };

      const mapped = statusMap[details.status] ?? activeSession.status;

      if (mapped !== activeSession.status) {
        activeSession.status = mapped;
        emit(mapped);
      }

      if (mapped === "ended" || mapped === "missed") {
        clearInterval(interval);
        setTimeout(() => {
          activeSession = null;
        }, 1200);
      }
    } catch {
      // ignore poll errors
    }
  }, 1000);
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
