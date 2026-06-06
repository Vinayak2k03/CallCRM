import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ title, onClose, children, footer, size = "md" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" } as const;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={`w-full ${widths[size]} bg-card border border-border rounded-xl shadow-lg overflow-hidden`}
      >
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h3 className="text-[14px] font-semibold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-border bg-surface-muted/50 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full h-9 px-2.5 text-[13px] bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition placeholder:text-muted-foreground/60";

export const textareaClass =
  "w-full px-2.5 py-2 text-[13px] bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition resize-none";

export const btnPrimary =
  "h-9 px-4 text-[13px] font-medium rounded-md bg-primary text-primary-foreground hover:opacity-95 shadow-sm transition";
export const btnGhost =
  "h-9 px-3 text-[13px] font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition";
export const btnDanger =
  "h-9 px-3 text-[13px] font-medium rounded-md text-destructive hover:bg-destructive/10 transition";
