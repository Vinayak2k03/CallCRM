import { useMemo, useState } from "react";
import { Search, Pencil, Trash2, Building2, Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { deleteContact, useStore } from "@/lib/store";
import type { Contact } from "@/lib/types";
import { AddContactModal } from "./AddContactModal";

interface Props {
  compact?: boolean;
  initialCompanyId?: string;
}

export function ContactTable({ compact, initialCompanyId }: Props) {
  const contacts = useStore((s) => s.contacts);
  const companies = useStore((s) => s.companies);
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>(initialCompanyId ?? "");
  const [editing, setEditing] = useState<Contact | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return contacts.filter((c) => {
      if (companyFilter && c.companyId !== companyFilter) return false;
      if (!term) return true;
      const company = companies.find((x) => x.id === c.companyId)?.name ?? "";
      return [c.firstName, c.lastName, c.phone, c.email ?? "", c.designation ?? "", company]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [contacts, companies, q, companyFilter]);

  const filterCompanyName = companyFilter
    ? companies.find((c) => c.id === companyFilter)?.name
    : undefined;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search contacts"
            className="w-full h-8 pl-8 pr-3 text-[12.5px] bg-surface-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
          />
        </div>
        {filterCompanyName && (
          <span className="inline-flex items-center gap-1.5 h-7 px-2 text-[11px] font-medium rounded-md bg-primary/10 text-primary border border-primary/20">
            <Building2 className="h-3 w-3" />
            {filterCompanyName}
            <button
              className="ml-1 text-primary/70 hover:text-primary"
              onClick={() => setCompanyFilter("")}
            >
              ×
            </button>
          </span>
        )}
        <button
          onClick={() => setAdding(true)}
          className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 text-[12.5px] font-medium rounded-md bg-primary text-primary-foreground hover:opacity-95 shadow-sm transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Add contact
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">
        <table className="w-full text-[12.5px]">
          <thead className="sticky top-0 bg-surface-muted/95 backdrop-blur z-10 border-b border-border">
            <tr className="text-left text-[10.5px] uppercase tracking-wider text-muted-foreground">
              <th className="font-medium px-4 py-2">Name</th>
              <th className="font-medium px-3 py-2">Phone</th>
              {!compact && <th className="font-medium px-3 py-2">Email</th>}
              <th className="font-medium px-3 py-2">Company</th>
              {!compact && <th className="font-medium px-3 py-2">Title</th>}
              <th className="font-medium px-3 py-2 w-[80px]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-[12px]">
                  No contacts found.
                </td>
              </tr>
            )}
            {filtered.map((c) => {
              const company = companies.find((x) => x.id === c.companyId);
              return (
                <tr key={c.id} className="border-b border-border hover:bg-surface-muted/60 group">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary grid place-items-center text-[10.5px] font-semibold shrink-0">
                        {c.firstName[0]}{c.lastName[0] ?? ""}
                      </div>
                      <span className="font-medium text-foreground">
                        {c.firstName} {c.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{c.phone}</td>
                  {!compact && (
                    <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[200px]">{c.email ?? "—"}</td>
                  )}
                  <td className="px-3 py-2.5">
                    {company ? (
                      <button
                        onClick={() => navigate({ to: "/database", search: { tab: "companies", id: company.id } })}
                        className="inline-flex items-center gap-1 text-foreground hover:text-primary hover:underline"
                      >
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {company.name}
                      </button>
                    ) : (
                      <span className="text-muted-foreground/70">—</span>
                    )}
                  </td>
                  {!compact && (
                    <td className="px-3 py-2.5 text-muted-foreground">{c.designation ?? "—"}</td>
                  )}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => setEditing(c)}
                        className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${c.firstName} ${c.lastName}?`)) deleteContact(c.id);
                        }}
                        className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {adding && <AddContactModal onClose={() => setAdding(false)} />}
      {editing && <AddContactModal initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
