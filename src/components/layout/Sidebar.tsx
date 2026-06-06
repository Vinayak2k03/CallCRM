import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Phone,
  PhoneCall,
  Database,
  BarChart3,
  Users,
  Sparkles,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useViewMode } from "@/lib/workspace";
import { auth, useAuth } from "@/lib/auth";

type Item = {
  to: "/" | "/dashboard" | "/database" | "/calls";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: string[];
};

const EMPLOYEE_ITEMS: Item[] = [
  { to: "/", label: "Dialer", icon: Phone, match: ["/"] },
  { to: "/database", label: "Database", icon: Database, match: ["/database"] },
  { to: "/calls", label: "Calls", icon: PhoneCall, match: ["/calls"] },
  { to: "/dashboard", label: "My Performance", icon: BarChart3, match: ["/dashboard"] },
];

const MANAGER_ITEMS: Item[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, match: ["/dashboard"] },
  { to: "/database", label: "Database", icon: Users, match: ["/database"] },
  { to: "/calls", label: "Calls", icon: PhoneCall, match: ["/calls"] },
  { to: "/", label: "Dialer", icon: Phone, match: ["/"] },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const view = useViewMode();
  const items = view === "manager" ? MANAGER_ITEMS : EMPLOYEE_ITEMS;

  return (
    <aside className="w-[224px] shrink-0 bg-[oklch(0.20_0.04_260)] text-white flex flex-col">
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-white/5">
        <div className="h-8 w-8 rounded-md bg-primary grid place-items-center text-[14px] font-semibold shadow-sm">
          C
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[14px] font-semibold tracking-tight">Catchh</span>
          <span className="text-[10px] text-white/50 uppercase tracking-wider">Sales Cloud</span>
        </div>
      </div>

      <div className="px-3 pt-4 pb-2">
        <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold px-2 mb-1.5">
          {view === "manager" ? "Manager Workspace" : "Execution"}
        </div>
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = item.match.includes(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={[
                  "group inline-flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/65 hover:text-white hover:bg-white/5",
                ].join(" ")}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {view === "employee" && (
        <div className="px-3 pt-4 pb-2 mt-2 border-t border-white/5">
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold px-2 mb-1.5">
            Intelligence
          </div>
          <div className="px-2.5 py-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Call Coach
            </div>
            <p className="mt-1 text-[10.5px] text-white/55 leading-relaxed">
              Live transcripts & objection handling activate during calls.
            </p>
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-white/5">
        <div className="p-2">
          <SidebarUserMenu />
        </div>
        <div className="px-3 pb-2 text-[10px] text-white/30">v0.1 • Build 2026.6</div>
      </div>
    </aside>
  );
}

function SidebarUserMenu() {
  const { user } = useAuth();
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

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function go(to: "/profile" | "/settings") {
    setOpen(false);
    navigate({ to });
  }
  function logout() {
    setOpen(false);
    auth.logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="relative" ref={ref}>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1.5 rounded-lg border border-border bg-popover text-foreground shadow-lg overflow-hidden z-50">
          <div className="px-3 py-2.5 border-b border-border">
            <div className="text-[12.5px] font-semibold truncate">{user.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
            <div className="mt-0.5 text-[10.5px] text-muted-foreground">ID: {user.userId} · {user.role}</div>
          </div>
          <button onClick={() => go("/profile")} className="w-full text-left flex items-center gap-2 px-3 h-8 text-[12.5px] hover:bg-secondary/70">
            <UserIcon className="h-3.5 w-3.5" /> Profile
          </button>
          <button onClick={() => go("/settings")} className="w-full text-left flex items-center gap-2 px-3 h-8 text-[12.5px] hover:bg-secondary/70">
            <Settings className="h-3.5 w-3.5" /> Settings
          </button>
          <button onClick={logout} className="w-full text-left flex items-center gap-2 px-3 h-8 text-[12.5px] text-destructive hover:bg-destructive/10 border-t border-border">
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-2 h-10 rounded-md hover:bg-white/5 transition-colors"
      >
        <span className="h-7 w-7 rounded-full bg-primary/20 text-white grid place-items-center text-[11px] font-semibold">
          {initials}
        </span>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[12.5px] font-semibold text-white truncate leading-tight">{user.name}</div>
          <div className="text-[10.5px] text-white/50 truncate">{user.role}</div>
        </div>
        <ChevronUp className={`h-3.5 w-3.5 text-white/50 transition-transform ${open ? "" : "rotate-180"}`} />
      </button>
    </div>
  );
}
