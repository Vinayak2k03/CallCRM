import { Outlet, useRouterState } from "@tanstack/react-router";
import { Search, Bell } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/lib/auth";

const PUBLIC_ROUTES = new Set(["/login"]);

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAuthenticated } = useAuth();
  const isPublic = PUBLIC_ROUTES.has(pathname);

  if (isPublic || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 shrink-0 bg-surface border-b border-border flex items-center px-4 gap-3">
          <WorkspaceSwitcher />
          <div className="h-5 w-px bg-border" />
          <PageTitle pathname={pathname} />

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search contacts, companies…"
                className="w-[280px] h-8 pl-8 pr-3 bg-surface-muted border border-border rounded-md text-[12.5px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
              />
            </div>
            <button
              type="button"
              className="h-8 w-8 grid place-items-center rounded-md border border-border bg-surface hover:bg-secondary/70 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
            </button>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


function PageTitle({ pathname }: { pathname: string }) {
  const map: Record<string, { crumb: string; title: string }> = {
    "/": { crumb: "Execution", title: "Smart Dialer" },
    "/dashboard": { crumb: "Analytics", title: "Performance Overview" },
    "/database": { crumb: "Records", title: "Database" },
    "/profile": { crumb: "Account", title: "Profile" },
    "/settings": { crumb: "Account", title: "Settings" },
  };
  const m = map[pathname] ?? { crumb: "", title: "" };
  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <span className="text-[10.5px] uppercase tracking-widest text-muted-foreground font-semibold">
        {m.crumb}
      </span>
      <span className="text-muted-foreground/60 text-[11px]">/</span>
      <span className="text-[13px] font-semibold text-foreground truncate">{m.title}</span>
    </div>
  );
}
