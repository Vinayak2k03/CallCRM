import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ArrowDownRight, Plus, Phone, Users, TrendingUp, Target } from "lucide-react";
import { useViewMode } from "@/lib/workspace";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Catchh" },
      { name: "description", content: "Performance KPIs and analytics." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const view = useViewMode();
  const calls = useStore((s) => s.calls);
  const contacts = useStore((s) => s.contacts);
  const companies = useStore((s) => s.companies);

  const totalCalls = calls.length;
  const connected = calls.filter((c) => c.status === "ended").length;
  const connectRate = totalCalls ? Math.round((connected / totalCalls) * 100) : 0;

  const kpis = view === "manager"
    ? [
        { label: "Team Calls (7d)", value: String(totalCalls + 248), delta: "+12.5%", up: true, icon: Phone },
        { label: "Connect Rate", value: `${connectRate || 62}%`, delta: "+3.1%", up: true, icon: Target },
        { label: "Pipeline Value", value: "$1.24M", delta: "+8.2%", up: true, icon: TrendingUp },
        { label: "Active Contacts", value: String(contacts.length + 184), delta: "-1.4%", up: false, icon: Users },
      ]
    : [
        { label: "My Calls Today", value: String(totalCalls || 0), delta: "+4", up: true, icon: Phone },
        { label: "Talk Time", value: "1h 42m", delta: "+22m", up: true, icon: Target },
        { label: "My Pipeline", value: "$148K", delta: "+12%", up: true, icon: TrendingUp },
        { label: "Quota Attainment", value: "74%", delta: "+6%", up: true, icon: TrendingUp },
      ];

  return (
    <div className="p-5 lg:p-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div className="text-[10.5px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
            {view === "manager" ? "Team performance" : "My performance"}
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            {view === "manager" ? "Sales Operations Overview" : "Personal Dashboard"}
          </h1>
        </div>
        {view === "manager" && (
          <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[12.5px] font-semibold shadow-sm hover:opacity-95 transition">
            <Plus className="h-3.5 w-3.5" />
            New Dashboard
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="bg-card border border-border rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="text-[11.5px] text-muted-foreground font-medium">{k.label}</div>
                <span className="h-6 w-6 rounded-md bg-primary/10 text-primary grid place-items-center">
                  <Icon className="h-3 w-3" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <div className="text-[22px] font-semibold tracking-tight text-foreground tabular-nums">
                  {k.value}
                </div>
                <span
                  className={[
                    "inline-flex items-center gap-0.5 text-[11px] font-semibold",
                    k.up ? "text-success" : "text-destructive",
                  ].join(" ")}
                >
                  {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {k.delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="text-[13px] font-semibold text-foreground">Call volume — last 14 days</div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {view === "manager" ? "Team" : "You"}
            </div>
          </div>
          <div className="p-4">
            <MiniBars />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-border text-[13px] font-semibold text-foreground">
            {view === "manager" ? "Top performers" : "Recent activity"}
          </div>
          <ul className="divide-y divide-border">
            {(view === "manager"
              ? [
                  { n: "Priya Sharma", v: "82 calls", s: "$142K" },
                  { n: "James O'Connor", v: "74 calls", s: "$118K" },
                  { n: "Sahil Anand", v: "61 calls", s: "$96K" },
                  { n: "Mei Tanaka", v: "55 calls", s: "$88K" },
                ]
              : [
                  { n: "Sarah Chen — Acme", v: "Connected", s: "2h ago" },
                  { n: "Marcus Patel — Northwind", v: "Voicemail", s: "3h ago" },
                  { n: "Elena Rodriguez — Initech", v: "Connected", s: "Yesterday" },
                  { n: contacts[0]?.firstName ? `${contacts[0].firstName} ${contacts[0].lastName}` : "New lead", v: companies[0]?.name ?? "—", s: "Today" },
                ]
            ).map((r, i) => (
              <li key={i} className="px-4 py-2.5 flex items-center gap-2.5">
                <span className="h-7 w-7 rounded-full bg-secondary text-foreground text-[10.5px] font-semibold grid place-items-center">
                  {r.n.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium text-foreground truncate">{r.n}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{r.v}</div>
                </div>
                <div className="text-[11.5px] font-semibold text-foreground tabular-nums">{r.s}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MiniBars() {
  const values = [42, 58, 49, 64, 71, 55, 68, 80, 73, 86, 79, 92, 84, 95];
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-1.5 h-44">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-primary/70 to-primary/30 hover:from-primary hover:to-primary/50 transition-colors"
            style={{ height: `${(v / max) * 100}%` }}
            title={`${v} calls`}
          />
          <span className="text-[9.5px] text-muted-foreground">{i + 1}</span>
        </div>
      ))}
    </div>
  );
}
