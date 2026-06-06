import { useMemo, useState } from "react";
import { Search, Pencil, Trash2, Plus, Users, ExternalLink } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { contactsForCompany, deleteCompany, useStore } from "@/lib/store";
import type { Company } from "@/lib/types";
import { AddCompanyModal } from "./AddCompanyModal";

interface Props {
  compact?: boolean;
  highlightId?: string;
}

export function CompanyTable({ compact, highlightId }: Props) {
  const companies = useStore((s) => s.companies);
  const contacts = useStore((s) => s.contacts);
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Company | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return companies;
    return companies.filter((c) =>
      [c.name, c.website ?? "", c.industry ?? "", c.currentErp ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [companies, q]);

  function openContacts(companyId: string) {
    navigate({ to: "/database", search: { tab: "contacts", companyId } });
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search companies"
            className="w-full h-8 pl-8 pr-3 text-[12.5px] bg-surface-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
          />
        </div>
        <button
          onClick={() => setAdding(true)}
          className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 text-[12.5px] font-medium rounded-md bg-primary text-primary-foreground hover:opacity-95 shadow-sm transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Add company
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">
        <table className="w-full text-[12.5px]">
          <thead className="sticky top-0 bg-surface-muted/95 backdrop-blur z-10 border-b border-border">
            <tr className="text-left text-[10.5px] uppercase tracking-wider text-muted-foreground">
              <th className="font-medium px-4 py-2">Company</th>
              {!compact && <th className="font-medium px-3 py-2">Website</th>}
              <th className="font-medium px-3 py-2">Industry</th>
              {!compact && <th className="font-medium px-3 py-2">Revenue</th>}
              {!compact && <th className="font-medium px-3 py-2">ERP</th>}
              <th className="font-medium px-3 py-2">Contacts</th>
              <th className="font-medium px-3 py-2 w-[80px]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-[12px]">
                  No companies found.
                </td>
              </tr>
            )}
            {filtered.map((c) => {
              const count = contactsForCompany(c.id, contacts).length;
              return (
                <tr
                  key={c.id}
                  className={`border-b border-border hover:bg-surface-muted/60 group ${
                    highlightId === c.id ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-md bg-secondary text-foreground grid place-items-center text-[10.5px] font-semibold shrink-0 border border-border">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{c.name}</span>
                    </div>
                  </td>
                  {!compact && (
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {c.website ? (
                        <a
                          href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:text-primary"
                        >
                          {c.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : "—"}
                    </td>
                  )}
                  <td className="px-3 py-2.5 text-muted-foreground">{c.industry ?? "—"}</td>
                  {!compact && <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{c.revenue ?? "—"}</td>}
                  {!compact && <td className="px-3 py-2.5 text-muted-foreground">{c.currentErp ?? "—"}</td>}
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => openContacts(c.id)}
                      disabled={count === 0}
                      className="inline-flex items-center gap-1.5 h-6 px-2 text-[11px] font-medium rounded-md bg-secondary text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-default border border-border"
                    >
                      <Users className="h-3 w-3" />
                      {count === 0 ? "No contacts" : count === 1 ? "1 contact" : `${count} contacts`}
                    </button>
                  </td>
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
                          if (confirm(`Delete ${c.name}? Contacts will be unlinked.`)) deleteCompany(c.id);
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

      {adding && <AddCompanyModal onClose={() => setAdding(false)} />}
      {editing && <AddCompanyModal initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
