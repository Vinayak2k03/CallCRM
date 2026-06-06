import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  FileText,
  Loader2,
  Clock,
  X,
  Headphones,
} from "lucide-react";
import { useStore, updateCallLog } from "@/lib/store";
import type { CallLog } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import {
  getTelnyxRecordings,
  getTelnyxTranscription,
} from "@/lib/api/telnyx.functions";

export const Route = createFileRoute("/calls")({
  head: () => ({
    meta: [
      { title: "Calls — Catchh" },
      { name: "description", content: "Call history, recordings & transcripts." },
    ],
  }),
  component: CallsPage,
});

function fmtDuration(s: number): string {
  if (!s) return "0s";
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return m > 0 ? `${m}m ${ss}s` : `${ss}s`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

function CallsPage() {
  const calls = useStore((s) => s.calls);
  const contacts = useStore((s) => s.contacts);
  const { user } = useAuth();
  const [activeCall, setActiveCall] = useState<CallLog | null>(null);
  const [loadingRecording, setLoadingRecording] = useState(false);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [modalMode, setModalMode] = useState<"recording" | "transcript" | null>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);

  async function openRecording(call: CallLog) {
    if (!call.telnyxCallControlId || !user?.voipApiKey) return;
    setActiveCall(call);
    setModalMode("recording");
    setLoadingRecording(true);
    try {
      const recordings = await getTelnyxRecordings({
        data: { apiKey: user.voipApiKey, callControlId: call.telnyxCallControlId },
      });
      if (recordings.length > 0 && recordings[0].downloadUrl) {
        setModalContent(recordings[0].downloadUrl);
        updateCallLog(call.id, { recordingUrl: recordings[0].downloadUrl });
      } else {
        setModalContent("");
      }
    } catch (e) {
      setModalContent(e instanceof Error ? e.message : "Failed to load recording");
    } finally {
      setLoadingRecording(false);
    }
  }

  async function openTranscript(call: CallLog) {
    if (!call.telnyxCallControlId || !user?.voipApiKey) return;
    setActiveCall(call);
    setModalMode("transcript");
    setLoadingTranscript(true);
    try {
      const result = await getTelnyxTranscription({
        data: { apiKey: user.voipApiKey, callControlId: call.telnyxCallControlId },
      });
      if (result.text) {
        setModalContent(result.text);
        updateCallLog(call.id, {
          transcript: result.text,
          transcriptStatus: result.status === "completed" ? "completed" : "pending",
        });
      } else {
        setModalContent(
          result.status === "pending"
            ? "Transcription is still processing. Check back shortly."
            : "No transcript available for this call.",
        );
        updateCallLog(call.id, {
          transcriptStatus: result.status === "completed" ? "completed" : "pending",
        });
      }
    } catch (e) {
      setModalContent(e instanceof Error ? e.message : "Failed to load transcript");
      updateCallLog(call.id, { transcriptStatus: "failed" });
    } finally {
      setLoadingTranscript(false);
    }
  }

  function closeModal() {
    setActiveCall(null);
    setModalMode(null);
    setModalContent(null);
  }

  return (
    <main className="flex-1 p-4 lg:p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-5">
          <h1 className="text-[20px] font-semibold tracking-tight">Call history</h1>
          <p className="text-[13px] text-muted-foreground">
            Recordings and transcripts from your calls.
          </p>
        </div>

        {calls.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="h-12 w-12 mx-auto rounded-full bg-secondary grid place-items-center mb-3">
              <PhoneOutgoing className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-[14px] font-medium text-foreground">No calls yet</div>
            <div className="text-[12.5px] text-muted-foreground mt-1">
              Use the dialer to place calls. Recordings and transcripts will appear here.
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <h2 className="text-[13px] font-semibold tracking-tight">All calls</h2>
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">{calls.length}</span>
            </div>
            <ul className="divide-y divide-border">
              {calls.map((call) => {
                const contact = call.contactId
                  ? contacts.find((c) => c.id === call.contactId)
                  : undefined;
                const isTelnyx =
                  user?.voipProvider === "telnyx" && !!call.telnyxCallControlId;
                return (
                  <li key={call.id} className="px-4 py-3 hover:bg-surface-muted/60">
                    <div className="flex items-start gap-3">
                      <CallIcon call={call} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-foreground truncate">
                            {contact
                              ? `${contact.firstName} ${contact.lastName}`
                              : call.phone}
                          </span>
                          {!contact && (
                            <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground px-1.5 py-0.5 rounded bg-secondary border border-border">
                              Unknown
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[11.5px] text-muted-foreground tabular-nums">
                          {call.phone} · {fmtDuration(call.durationSec)}
                        </div>
                        {call.notes && (
                          <div className="mt-1 text-[11.5px] text-muted-foreground line-clamp-1">
                            {call.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-muted-foreground">
                          {timeAgo(call.startedAt)}
                        </div>
                        {isTelnyx && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <button
                              onClick={() => openRecording(call)}
                              disabled={loadingRecording && activeCall?.id === call.id}
                              className="inline-flex items-center gap-1 h-6 px-2 text-[11px] font-medium rounded-md border border-border hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50"
                              title="Recording"
                            >
                              {loadingRecording && activeCall?.id === call.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Headphones className="h-3 w-3" />
                              )}
                              Recording
                            </button>
                            <button
                              onClick={() => openTranscript(call)}
                              disabled={loadingTranscript && activeCall?.id === call.id}
                              className="inline-flex items-center gap-1 h-6 px-2 text-[11px] font-medium rounded-md border border-border hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50"
                              title="Transcript"
                            >
                              {loadingTranscript && activeCall?.id === call.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <FileText className="h-3 w-3" />
                              )}
                              Transcript
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {modalMode && activeCall && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <div
            className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="text-[13px] font-semibold">
                {modalMode === "recording" ? "Call recording" : "Call transcript"}
              </div>
              <button
                onClick={closeModal}
                className="h-7 w-7 grid place-items-center rounded-md hover:bg-secondary text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              {modalMode === "recording" && loadingRecording && (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-[13px]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading recording...
                </div>
              )}
              {modalMode === "recording" && !loadingRecording && modalContent && (
                <audio controls className="w-full" src={modalContent}>
                  Your browser does not support the audio element.
                </audio>
              )}
              {modalMode === "recording" && !loadingRecording && modalContent === "" && (
                <div className="text-center py-8 text-muted-foreground text-[13px]">
                  No recording found for this call.
                </div>
              )}
              {modalMode === "transcript" && loadingTranscript && (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-[13px]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading transcript...
                </div>
              )}
              {modalMode === "transcript" && !loadingTranscript && (
                <div className="max-h-[320px] overflow-auto text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">
                  {modalContent ?? "No transcript available."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function CallIcon({ call }: { call: CallLog }) {
  const isMissed = call.status === "missed" || call.type === "missed";
  const base = "h-8 w-8 rounded-full grid place-items-center shrink-0";
  if (isMissed) {
    return (
      <div className={`${base} bg-destructive/10 text-destructive`}>
        <PhoneMissed className="h-3.5 w-3.5" />
      </div>
    );
  }
  if (call.type === "incoming") {
    return (
      <div className={`${base} bg-success/10 text-success`}>
        <PhoneIncoming className="h-3.5 w-3.5" />
      </div>
    );
  }
  return (
    <div className={`${base} bg-primary/10 text-primary`}>
      <PhoneOutgoing className="h-3.5 w-3.5" />
    </div>
  );
}
