import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, useAuth, type VoipProvider } from "@/lib/auth";
import { fetchTelnyxNumbers } from "@/lib/api/telnyx.functions";
import { Check, Loader2, Phone } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Catchh" }] }),
  component: SettingsPage,
});

const PROVIDERS: { id: VoipProvider; label: string; description: string }[] = [
  { id: "callhippo", label: "CallHippo", description: "Cloud telephony for sales teams." },
  { id: "twilio", label: "Twilio", description: "Programmable voice via Twilio." },
  { id: "aircall", label: "Aircall", description: "Cloud-based call center." },
  { id: "telnyx", label: "Telnyx", description: "Programmable voice, recording & transcripts." },
  { id: "none", label: "Disconnected", description: "Disable outbound VoIP." },
];

function SettingsPage() {
  const { user } = useAuth();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [provider, setProvider] = useState<VoipProvider>(user?.voipProvider ?? "callhippo");
  const [apiKey, setApiKey] = useState(user?.voipApiKey ?? "");
  const [apiSecret, setApiSecret] = useState(user?.voipApiSecret ?? "");
  const [voipNumber, setVoipNumber] = useState(user?.voipNumber ?? "");
  const [connectionId, setConnectionId] = useState(user?.voipConnectionId ?? "");
  const [fetching, setFetching] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setPhone(user.phone);
    setProvider(user.voipProvider);
    setApiKey(user.voipApiKey);
    setApiSecret(user.voipApiSecret);
    setVoipNumber(user.voipNumber);
    setConnectionId(user.voipConnectionId ?? "");
  }, [user]);

  if (!user) return null;

  async function fetchNumber() {
    if (!apiKey) return;
    setFetching(true);
    setFetchError(null);
    try {
      if (provider === "telnyx") {
        const numbers = await fetchTelnyxNumbers({ data: { apiKey, limit: 10 } });
        if (numbers.length > 0) {
          setVoipNumber(numbers[0].phoneNumber);
        } else {
          setFetchError("No Telnyx numbers found on this account.");
        }
      } else {
        // Simulated provider API call for other providers
        await new Promise((r) => setTimeout(r, 900));
        const sample = "+1 415 555 " + Math.floor(1000 + Math.random() * 8999);
        setVoipNumber(sample);
      }
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to fetch numbers");
    } finally {
      setFetching(false);
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    auth.updateProfile({
      phone,
      voipProvider: provider,
      voipApiKey: apiKey,
      voipApiSecret: apiSecret,
      voipNumber,
      voipConnectionId: connectionId,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <main className="flex-1 p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-5">
          <h1 className="text-[20px] font-semibold tracking-tight">Settings</h1>
          <p className="text-[13px] text-muted-foreground">
            Manage your phone number and VoIP provider.
          </p>
        </div>

        <form onSubmit={save} className="space-y-5">
          {/* Phone */}
          <section className="rounded-xl border border-border bg-surface shadow-sm p-6">
            <h2 className="text-[14px] font-semibold text-foreground">Phone number</h2>
            <p className="text-[12px] text-muted-foreground">
              Used as your caller ID fallback.
            </p>
            <div className="mt-4">
              <label className="text-[12px] font-medium">Mobile / direct line</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 415 555 0188"
                className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </section>

          {/* VoIP */}
          <section className="rounded-xl border border-border bg-surface shadow-sm p-6">
            <h2 className="text-[14px] font-semibold text-foreground">VoIP provider</h2>
            <p className="text-[12px] text-muted-foreground">
              Connect a provider to place outbound calls.
            </p>

            <div className="mt-4 grid sm:grid-cols-2 gap-2">
              {PROVIDERS.map((p) => {
                const active = provider === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={[
                      "text-left rounded-lg border px-3 py-2.5 transition-colors",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface hover:bg-secondary/60",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium">{p.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5">{p.description}</p>
                  </button>
                );
              })}
            </div>

            {provider !== "none" && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-[12px] font-medium">API key</label>
                  <input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your provider API key"
                    className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                  />
                </div>

                {provider === "telnyx" && (
                  <>
                    <div>
                      <label className="text-[12px] font-medium">API secret</label>
                      <input
                        type="password"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        placeholder="Paste your Telnyx API secret"
                        className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Optional. Some Telnyx operations require a secret key.
                      </p>
                    </div>
                    <div>
                      <label className="text-[12px] font-medium">Connection ID (Call Control App)</label>
                      <input
                        value={connectionId}
                        onChange={(e) => setConnectionId(e.target.value)}
                        placeholder="e.g. 1234567890abcdef"
                        className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-ring/40 font-mono"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Required. Create a Call Control App in Telnyx portal and paste its ID here.
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[12px] font-medium">VoIP number</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      value={voipNumber}
                      onChange={(e) => setVoipNumber(e.target.value)}
                      placeholder="Fetched from provider"
                      className="flex-1 h-9 px-3 rounded-md border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-ring/40"
                    />
                    <button
                      type="button"
                      onClick={fetchNumber}
                      disabled={!apiKey || fetching}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-surface text-[12px] font-medium hover:bg-secondary/60 disabled:opacity-50"
                    >
                      {fetching ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Phone className="h-3.5 w-3.5" />
                      )}
                      Fetch
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Pulls an available number from your {PROVIDERS.find((p) => p.id === provider)?.label} account.
                  </p>
                  {fetchError && (
                    <p className="text-[11px] text-destructive mt-1">{fetchError}</p>
                  )}
                </div>
              </div>
            )}
          </section>

          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="text-[12px] text-success inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            <button
              type="submit"
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-95"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
