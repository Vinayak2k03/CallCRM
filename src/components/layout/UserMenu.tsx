import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { User as UserIcon, Settings, LogOut } from "lucide-react";
import { auth, useAuth } from "@/lib/auth";

export function UserMenu() {
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
        className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-border grid place-items-center text-[11px] font-semibold hover:bg-primary/15 transition-colors"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-60 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50">
          <div className="px-3 py-3 border-b border-border">
            <div className="text-[13px] font-semibold text-foreground truncate">{user.name}</div>
            <div className="text-[11.5px] text-muted-foreground truncate">{user.email}</div>
            <div className="mt-1 text-[10.5px] text-muted-foreground">ID: {user.userId} • {user.role}</div>
          </div>
          <div className="py-1">
            <Item icon={<UserIcon className="h-3.5 w-3.5" />} onClick={() => go("/profile")}>
              Profile
            </Item>
            <Item icon={<Settings className="h-3.5 w-3.5" />} onClick={() => go("/settings")}>
              Settings
            </Item>
          </div>
          <div className="py-1 border-t border-border">
            <Item icon={<LogOut className="h-3.5 w-3.5" />} onClick={logout} destructive>
              Log out
            </Item>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({
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
