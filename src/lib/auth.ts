import { useSyncExternalStore } from "react";

export type VoipProvider = "callhippo" | "twilio" | "aircall" | "telnyx" | "none";

export type UserProfile = {
  userId: string; // numeric id
  name: string; // fixed
  email: string;
  role: string;
  phone: string;
  voipProvider: VoipProvider;
  voipApiKey: string;
  voipApiSecret: string;
  voipNumber: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: UserProfile | null;
};

const STORAGE_KEY = "catchh:auth:v1";
const isBrowser = typeof window !== "undefined";

const DEFAULT_USER: UserProfile = {
  userId: "1042",
  name: "Sahil Anand",
  email: "sahil@catchh.io",
  role: "Account Executive",
  phone: "",
  voipProvider: "callhippo",
  voipApiKey: "",
  voipApiSecret: "",
  voipNumber: "",
};

function read(): AuthState {
  if (!isBrowser) return { isAuthenticated: false, user: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isAuthenticated: false, user: null };
    return JSON.parse(raw) as AuthState;
  } catch {
    return { isAuthenticated: false, user: null };
  }
}

let state: AuthState = read();
const listeners = new Set<() => void>();

function persist() {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export const auth = {
  get state() {
    return state;
  },
  login(userId: string, _password: string) {
    state = {
      isAuthenticated: true,
      user: { ...DEFAULT_USER, userId: userId || DEFAULT_USER.userId },
    };
    persist();
    emit();
  },
  logout() {
    state = { isAuthenticated: false, user: null };
    persist();
    emit();
  },
  updateProfile(patch: Partial<UserProfile>) {
    if (!state.user) return;
    state = { ...state, user: { ...state.user, ...patch } };
    persist();
    emit();
  },
};

const SERVER_SNAPSHOT: AuthState = { isAuthenticated: false, user: null };

export function useAuth(): AuthState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_SNAPSHOT,
  );
}
