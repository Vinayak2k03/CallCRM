import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Mail, Phone, IdCard, Briefcase, Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Catchh" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="flex-1 p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-5">
          <h1 className="text-[20px] font-semibold tracking-tight">Profile</h1>
          <p className="text-[13px] text-muted-foreground">Your account details.</p>
        </div>

        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="p-6 flex items-center gap-4 border-b border-border">
            <div className="h-14 w-14 rounded-full bg-secondary border border-border grid place-items-center text-[15px] font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[16px] font-semibold text-foreground truncate">{user.name}</div>
              <div className="text-[13px] text-muted-foreground truncate">{user.role}</div>
            </div>
            <Link
              to="/settings"
              className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-surface text-[12px] font-medium hover:bg-secondary/60"
            >
              <SettingsIcon className="h-3.5 w-3.5" />
              Edit settings
            </Link>
          </div>

          <dl className="divide-y divide-border">
            <Row icon={<IdCard className="h-3.5 w-3.5" />} label="User ID" value={user.userId} />
            <Row icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={user.email} />
            <Row icon={<Briefcase className="h-3.5 w-3.5" />} label="Role" value={user.role} />
            <Row
              icon={<Phone className="h-3.5 w-3.5" />}
              label="Phone"
              value={user.phone || <span className="text-muted-foreground">Not set</span>}
            />
            <Row
              icon={<Phone className="h-3.5 w-3.5" />}
              label="VoIP number"
              value={user.voipNumber || <span className="text-muted-foreground">Not connected</span>}
            />
          </dl>
        </div>
      </div>
    </main>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 px-6 py-3.5">
      <dt className="text-[12px] text-muted-foreground inline-flex items-center gap-2">
        {icon}
        {label}
      </dt>
      <dd className="col-span-2 text-[13px] text-foreground">{value}</dd>
    </div>
  );
}
