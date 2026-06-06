import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Briefcase, UserCog, ChevronDown, Check } from "lucide-react";
import { useViewMode, workspace, type ViewMode } from "@/lib/workspace";

const OPTIONS: Array<{
  value: ViewMode;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  landing: "/" | "/dashboard";
}> = [
  {
    value: "employee",
    label: "Employee View",
    hint: "Execution: dialer, AI, database",
    icon: UserCog,
    landing: "/",
  },
  {
    value: "manager",
    label: "Manager View",
    hint: "KPIs, team, dashboards",
    icon: Briefcase,
    landing: "/dashboard",
  },
];

export function WorkspaceSwitcher() {
  const view = useViewMode();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = OPTIONS.find((o) => o.value === view)!;
  const CurrentIcon = current.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 h-8 pl-2 pr-2 rounded-md border border-border bg-surface hover:bg-secondary/70 transition-colors"
      >
        <span className="h-5 w-5 rounded grid place-items-center bg-primary/10 text-primary">
          <CurrentIcon className="h-3 w-3" />
        </span>
        <span className="text-[12.5px] font-medium text-foreground">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 mt-1.5 w-[260px] rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Switch workspace
            </div>
          </div>
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = opt.value === view;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  workspace.setView(opt.value);
                  setOpen(false);
                  navigate({ to: opt.landing });
                }}
                className={[
                  "w-full text-left flex items-start gap-2.5 px-3 py-2.5 hover:bg-secondary/70 transition-colors",
                  active ? "bg-secondary/40" : "",
                ].join(" ")}
              >
                <span className="mt-0.5 h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                    {opt.label}
                    {active && <Check className="h-3 w-3 text-primary" />}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">{opt.hint}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
