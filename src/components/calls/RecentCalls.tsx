import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  UserPlus,
  Building2,
  User,
  Clock,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { CallLog } from "@/lib/types";
import { AddContactModal } from "@/components/crm/AddContactModal";

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

function fmtDuration(s: number): string {
  if (!s) return "0s";
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return m > 0 ? `${m}m ${ss}s` : `${ss}s`;
}

export function RecentCalls() {
  const calls = useStore((s) => s.calls);
  const contacts = useStore((s) => s.contacts);
  const companies = useStore((s) => s.companies);
  const navigate = useNavigate();
  const [addPhone, setAddPhone] = useState<string | null>(null);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold tracking-tight">Recent calls</h2>
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">{calls.length}</span>
      </div>

      <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">
        {calls.length === 0 ? (
          <div className="h-full grid place-items-center px-6 py-12 text-center">
            <div>
              <div className="h-10 w-10 mx-auto rounded-full bg-secondary grid place-items-center mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-[13px] font-medium text-foreground">No calls yet</div>
              <div className="text-[11.5px] text-muted-foreground mt-1">
                Calls from the dialer will appear here.
              </div>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {calls.map((call) => {
              const contact = call.contactId ? contacts.find((c) => c.id === call.contactId) : undefined;
              const company =
                contact?.companyId
                  ? companies.find((c) => c.id === contact.companyId)
                  : call.companyId
                  ? companies.find((c) => c.id === call.companyId)
                  : undefined;
              return (
                <li key={call.id} className="px-4 py-3 hover:bg-surface-muted/60 group">
                  <div className="flex items-start gap-3">
                    <CallIcon call={call} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {contact ? (
                          <button
                            className="text-[13px] font-medium text-foreground hover:text-primary truncate"
                            onClick={() =>
                              navigate({ to: "/database", search: { tab: "contacts", id: contact.id } })
                            }
                          >
                            {contact.firstName} {contact.lastName}
                          </button>
                        ) : (
                          <span className="text-[13px] font-medium text-foreground tabular-nums">
                            {call.phone}
                          </span>
                        )}
                        {!contact && (
                          <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground px-1.5 py-0.5 rounded bg-secondary border border-border">
                            Unknown
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-muted-foreground">
                        {company && (
                          <button
                            className="inline-flex items-center gap-1 hover:text-foreground"
                            onClick={() => navigate({ to: "/database", search: { tab: "companies", id: company.id } })}
                          >
                            <Building2 className="h-3 w-3" />
                            {company.name}
                          </button>
                        )}
                        {company && <span>·</span>}
                        <span className="tabular-nums">{call.phone}</span>
                      </div>
                      {call.notes && (
                        <div className="mt-1.5 text-[11.5px] text-muted-foreground line-clamp-2">
                          {call.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-muted-foreground">{timeAgo(call.startedAt)}</div>
                      <div className="text-[11px] text-foreground tabular-nums mt-0.5">
                        {fmtDuration(call.durationSec)}
                      </div>
                    </div>
                  </div>

                  {!contact && (
                    <div className="mt-2 pl-9 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => setAddPhone(call.phone)}
                        className="inline-flex items-center gap-1.5 h-6 px-2 text-[11px] font-medium rounded-md border border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                      >
                        <UserPlus className="h-3 w-3" />
                        Add contact
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {addPhone && (
        <AddContactModal defaultPhone={addPhone} onClose={() => setAddPhone(null)} />
      )}
    </div>
  );
}

function CallIcon({ call }: { call: CallLog }) {
  const isMissed = call.status === "missed" || call.type === "missed";
  const base = "h-7 w-7 rounded-full grid place-items-center shrink-0 mt-0.5";
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

export { User };
