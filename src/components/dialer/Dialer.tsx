import { useEffect, useMemo, useState } from "react";
import {
  Phone,
  PhoneOff,
  Delete,
  UserPlus,
  Building2,
  User,
} from "lucide-react";
import {
  addCallLog,
  findContactByPhone,
  updateCallLog,
  useStore,
} from "@/lib/store";
import {
  endCall as voipEndCall,
  initiateCall as voipInitiateCall,
  onCallStatus,
} from "@/lib/voip";
import type { CallStatus, Contact } from "@/lib/types";
import { AddContactModal } from "@/components/crm/AddContactModal";

const KEYS: { d: string; sub?: string }[] = [
  { d: "1" }, { d: "2", sub: "ABC" }, { d: "3", sub: "DEF" },
  { d: "4", sub: "GHI" }, { d: "5", sub: "JKL" }, { d: "6", sub: "MNO" },
  { d: "7", sub: "PQRS" }, { d: "8", sub: "TUV" }, { d: "9", sub: "WXYZ" },
  { d: "*" }, { d: "0", sub: "+" }, { d: "#" },
];

const STATUS_LABEL: Record<CallStatus, string> = {
  idle: "Ready",
  dialing: "Dialing…",
  ringing: "Ringing…",
  connected: "Connected",
  ended: "Call ended",
  missed: "Missed",
};

const STATUS_DOT: Record<CallStatus, string> = {
  idle: "bg-muted-foreground/40",
  dialing: "bg-warning animate-pulse",
  ringing: "bg-warning animate-pulse",
  connected: "bg-success",
  ended: "bg-muted-foreground/40",
  missed: "bg-destructive",
};

export function Dialer() {
  const contacts = useStore((s) => s.contacts);
  const companies = useStore((s) => s.companies);

  const [number, setNumber] = useState("");
  const [status, setStatus] = useState<CallStatus>("idle");
  const [notes, setNotes] = useState("");
  const [callId, setCallId] = useState<string | null>(null);
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showAdd, setShowAdd] = useState(false);

  const match: Contact | undefined = useMemo(
    () => (number.length >= 3 ? findContactByPhone(number, contacts) : undefined),
    [number, contacts],
  );
  const matchCompany = useMemo(
    () => (match?.companyId ? companies.find((c) => c.id === match.companyId) : undefined),
    [match, companies],
  );

  useEffect(() => onCallStatus(setStatus), []);

  useEffect(() => {
    if (status !== "connected") return;
    setCallStartedAt(Date.now());
    const i = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (callStartedAt ?? Date.now())) / 1000));
    }, 500);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const isActive = status === "dialing" || status === "ringing" || status === "connected";

  function press(d: string) {
    if (isActive) return;
    setNumber((n) => (n + d).slice(0, 20));
  }

  function backspace() {
    if (isActive) return;
    setNumber((n) => n.slice(0, -1));
  }

  function clear() {
    if (isActive) return;
    setNumber("");
    setNotes("");
  }

  async function startCall() {
    if (!number || isActive) return;
    setElapsed(0);
    const log = addCallLog({
      phone: number,
      contactId: match?.id,
      companyId: match?.companyId,
      type: "outgoing",
      status: "dialing",
      startedAt: Date.now(),
      durationSec: 0,
      notes,
    });
    setCallId(log.id);
    await voipInitiateCall(number);
  }

  function hangUp() {
    voipEndCall();
    setStatus("ended");
    if (callId) {
      const duration = callStartedAt ? Math.floor((Date.now() - callStartedAt) / 1000) : 0;
      updateCallLog(callId, {
        status: "ended",
        endedAt: Date.now(),
        durationSec: duration,
        notes,
      });
    }
    setCallStartedAt(null);
    setTimeout(() => {
      setStatus("idle");
      setCallId(null);
      setElapsed(0);
    }, 1200);
  }

  function formatTimer(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold tracking-tight">Smart Dialer</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
          {STATUS_LABEL[status]}
          {status === "connected" && (
            <span className="ml-1 tabular-nums text-foreground font-medium">
              {formatTimer(elapsed)}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 pb-3">
        <div className="relative">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/[^\d+*#]/g, "").slice(0, 20))}
            placeholder="Enter number"
            disabled={isActive}
            className="w-full h-12 px-3 pr-10 bg-surface-muted border border-border rounded-lg text-[20px] font-medium tracking-tight tabular-nums text-foreground placeholder:text-muted-foreground/60 placeholder:text-base placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition disabled:opacity-60"
          />
          {number && !isActive && (
            <button
              onClick={backspace}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
              aria-label="Backspace"
            >
              <Delete className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Match preview */}
        <div className="mt-2 min-h-[44px]">
          {match ? (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-secondary/50 border border-border">
              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary grid place-items-center text-[11px] font-semibold">
                {match.firstName[0]}{match.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-foreground truncate">
                  {match.firstName} {match.lastName}
                </div>
                {matchCompany && (
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                    <Building2 className="h-3 w-3" />
                    {matchCompany.name}
                  </div>
                )}
              </div>
            </div>
          ) : number.length >= 3 ? (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg border border-dashed border-border text-[12px] text-muted-foreground hover:text-foreground hover:bg-secondary/40 hover:border-border-strong transition"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add new contact
            </button>
          ) : (
            <div className="px-2.5 py-2 text-[11px] text-muted-foreground/70">
              Start typing to search contacts
            </div>
          )}
        </div>
      </div>

      {/* Keypad */}
      <div className="px-4 grid grid-cols-3 gap-1.5">
        {KEYS.map((k) => (
          <button
            key={k.d}
            onClick={() => press(k.d)}
            disabled={isActive}
            className="h-11 rounded-lg bg-surface-muted hover:bg-secondary active:bg-accent border border-transparent hover:border-border transition flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-[16px] font-semibold leading-none text-foreground">{k.d}</span>
            {k.sub && (
              <span className="text-[8.5px] font-medium tracking-wider text-muted-foreground mt-0.5">
                {k.sub}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notes */}
      <div className="px-4 pt-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Call notes…"
          rows={2}
          className="w-full px-2.5 py-2 text-[12px] bg-surface-muted border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition"
        />
      </div>

      {/* Actions */}
      <div className="px-4 py-3 mt-auto flex items-center gap-2">
        {!isActive ? (
          <>
            <button
              onClick={clear}
              disabled={!number && !notes}
              className="h-10 px-3 text-[12px] font-medium rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition disabled:opacity-40"
            >
              Clear
            </button>
            <button
              onClick={startCall}
              disabled={!number}
              className="flex-1 h-10 rounded-lg bg-success text-success-foreground font-medium text-[13px] inline-flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Phone className="h-4 w-4" />
              Call
            </button>
          </>
        ) : (
          <button
            onClick={hangUp}
            className="flex-1 h-10 rounded-lg bg-destructive text-destructive-foreground font-medium text-[13px] inline-flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition"
          >
            <PhoneOff className="h-4 w-4" />
            End call
          </button>
        )}
      </div>

      {showAdd && (
        <AddContactModal
          defaultPhone={number}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

export { User };
