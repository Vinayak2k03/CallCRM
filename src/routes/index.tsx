import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Activity, Lightbulb } from "lucide-react";
import { Dialer } from "@/components/dialer/Dialer";
import { RecentCalls } from "@/components/calls/RecentCalls";
import { MiniCRM } from "@/components/crm/MiniCRM";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dialer — Catchh" },
      { name: "description", content: "Smart dialer with live AI call analysis." },
    ],
  }),
  component: DialerPage,
});

function DialerPage() {
  return (
    <div className="p-4 lg:p-5 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Left column — Dialer */}
        <div className="lg:col-span-4 xl:col-span-3 min-h-[560px]">
          <Dialer />
        </div>

        {/* Middle column — AI Call Analysis (employee execution intelligence) */}
        <div className="lg:col-span-5 xl:col-span-6 min-h-[560px]">
          <AIAnalysisPanel />
        </div>

        {/* Right column — Recent calls */}
        <div className="lg:col-span-3 xl:col-span-3 min-h-[560px]">
          <RecentCalls />
        </div>

        {/* Bottom — Mini CRM (full width under) */}
        <div className="lg:col-span-12 min-h-[380px]">
          <MiniCRM />
        </div>
      </div>
    </div>
  );
}

function AIAnalysisPanel() {
  return (
    <div className="h-full bg-card border border-border rounded-xl shadow-xs flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-primary/10 text-primary grid place-items-center">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-foreground">Live AI Analysis</div>
            <div className="text-[10.5px] text-muted-foreground">Transcripts, sentiment & coaching</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
          Idle
        </span>
      </div>

      <div className="flex-1 p-5 overflow-auto">
        <div className="text-[10.5px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          Sample insight
        </div>
        <div className="rounded-lg border border-border bg-surface-muted p-3 mb-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
            <div>
              <div className="text-[12.5px] font-semibold text-foreground">Next best action</div>
              <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                When the prospect mentions pricing concerns, anchor on the Q4 ROI guarantee before discussing tiers.
              </p>
            </div>
          </div>
        </div>

        <div className="text-[10.5px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          Live transcript
        </div>
        <div className="space-y-2">
          <TranscriptLine speaker="You" text="Hi Sarah — thanks for taking the call today." />
          <TranscriptLine speaker="Sarah" prospect text="Of course. I have about fifteen minutes before my next meeting." />
          <TranscriptLine speaker="You" text="Perfect. I wanted to walk through how teams like yours streamline outbound." />
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
            <Activity className="h-3 w-3 animate-pulse text-primary" />
            Listening…
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-muted-foreground">Sentiment</span>
            <span className="font-semibold text-success">Positive · 78%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-success" style={{ width: "78%" }} />
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-border bg-surface-muted/50 text-[11px] text-muted-foreground">
        AI activates automatically when a call connects.
      </div>
    </div>
  );
}

function TranscriptLine({ speaker, text, prospect }: { speaker: string; text: string; prospect?: boolean }) {
  return (
    <div className="flex gap-2.5">
      <span
        className={[
          "text-[10.5px] font-bold uppercase tracking-wider w-14 shrink-0 pt-0.5",
          prospect ? "text-primary" : "text-muted-foreground",
        ].join(" ")}
      >
        {speaker}
      </span>
      <p className={["text-[12.5px] leading-relaxed", prospect ? "text-foreground font-medium" : "text-muted-foreground"].join(" ")}>
        {text}
      </p>
    </div>
  );
}
