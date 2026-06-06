import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { auth } from "@/lib/auth";
import { Phone } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Catchh" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d+$/.test(userId)) {
      setError("User ID must be numeric.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    auth.login(userId, password);
    navigate({ to: "/" });
  }

  return (
    <main className="flex-1 grid place-items-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center text-[15px] font-semibold shadow-sm">
            C
          </div>
          <span className="text-[17px] font-semibold tracking-tight">Catchh</span>
        </div>

        <div className="rounded-xl border border-border bg-surface shadow-sm p-6">
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">
            Sign in to your workspace
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Use your numeric user ID and password.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-[12px] font-medium text-foreground">User ID</label>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={userId}
                onChange={(e) => setUserId(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 1042"
                className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-ring/40"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>

            {error && (
              <p className="text-[12px] text-destructive">{error}</p>
            )}

            <button
              type="submit"
              className="w-full h-9 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-95 inline-flex items-center justify-center gap-2"
            >
              <Phone className="h-3.5 w-3.5" />
              Sign in
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          By signing in you agree to the Catchh terms of service.
        </p>
      </div>
    </main>
  );
}
