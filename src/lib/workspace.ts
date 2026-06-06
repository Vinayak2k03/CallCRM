import { useSyncExternalStore } from "react";

export type ViewMode = "employee" | "manager";

const STORAGE_KEY = "catchh:workspace:v1";
const isBrowser = typeof window !== "undefined";

function read(): ViewMode {
  if (!isBrowser) return "employee";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "manager" ? "manager" : "employee";
  } catch {
    return "employee";
  }
}

let state: ViewMode = read();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const workspace = {
  get view() {
    return state;
  },
  setView(v: ViewMode) {
    state = v;
    if (isBrowser) localStorage.setItem(STORAGE_KEY, v);
    emit();
  },
  toggle() {
    this.setView(state === "manager" ? "employee" : "manager");
  },
};

export function useViewMode(): ViewMode {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => "employee" as ViewMode,
  );
}
