import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Phone, Database, User as UserIcon, Settings, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { auth, useAuth } from "@/lib/auth";

const navItems = [
  { to: "/", label: "Dialer", icon: Phone, match: ["/"] },
  { to: "/database", label: "Database", icon: Database, match: ["/database"] },
] as const;

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAuthenticated } = useAuth();

  // Hide nav links on login screen
  const onLogin = pathname === "/login";

  return (
    <header className="h-14 border-b border-border bg-surface/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full px-5 flex items-center gap-8">
        <Link to={isAuthenticated ? "/" : "/login"} className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center text-[13px] font-semibold tracking-tight shadow-sm">
            C
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Catchh
          </span>
        </Link>

        {!onLogin && isAuthenticated && (
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = (item.match as readonly string[]).includes(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "inline-flex items-center gap-2 h-8 px-3 rounded-md text-[13px] font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              VoIP ready
            </span>
          )}
          {isAuthenticated && <UserMenu />}
        </div>
      </div>
    </header>
  );
}

function UserMenu() {
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="h-7 w-7 rounded-full bg-secondary border border-border grid place-items-center text-[11px] font-semibold text-foreground hover:bg-secondary/80 transition-colors"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50"
        >
          <div className="px-3 py-3 border-b border-border">
            <div className="text-[13px] font-semibold text-foreground truncate">{user.name}</div>
            <div className="text-[11.5px] text-muted-foreground truncate">{user.email}</div>
            <div className="mt-1 text-[10.5px] text-muted-foreground">ID: {user.userId}</div>
          </div>
          <div className="py-1">
            <MenuItem icon={<UserIcon className="h-3.5 w-3.5" />} onClick={() => go("/profile")}>
              Profile
            </MenuItem>
            <MenuItem icon={<Settings className="h-3.5 w-3.5" />} onClick={() => go("/settings")}>
              Settings
            </MenuItem>
          </div>
          <div className="py-1 border-t border-border">
            <MenuItem
              icon={<LogOut className="h-3.5 w-3.5" />}
              onClick={logout}
              destructive
            >
              Log out
            </MenuItem>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={[
        "w-full text-left inline-flex items-center gap-2 px-3 h-8 text-[13px] transition-colors",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-secondary/70",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}
