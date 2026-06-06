import { useSyncExternalStore } from "react";
import type { CallLog, Company, Contact, ID } from "./types";

type State = {
  contacts: Contact[];
  companies: Company[];
  calls: CallLog[];
};

const STORAGE_KEY = "catchh:v1";
const isBrowser = typeof window !== "undefined";

function uid(): string {
  if (isBrowser && "crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function seedData(): State {
  const acme: Company = {
    id: uid(),
    name: "Acme Industries",
    website: "acme.com",
    industry: "Manufacturing",
    revenue: "$50M – $100M",
    currentErp: "SAP S/4HANA",
    notes: "Evaluating new CRM Q2.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const northwind: Company = {
    id: uid(),
    name: "Northwind Traders",
    website: "northwind.io",
    industry: "Logistics",
    revenue: "$10M – $50M",
    currentErp: "Oracle NetSuite",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const initech: Company = {
    id: uid(),
    name: "Initech",
    website: "initech.com",
    industry: "Software",
    revenue: "$5M – $10M",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const contacts: Contact[] = [
    {
      id: uid(),
      firstName: "Sarah",
      lastName: "Chen",
      phone: "+14155550123",
      email: "sarah.chen@acme.com",
      companyId: acme.id,
      designation: "VP Operations",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: uid(),
      firstName: "Marcus",
      lastName: "Patel",
      phone: "+14155550148",
      email: "marcus@northwind.io",
      companyId: northwind.id,
      designation: "Head of Procurement",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: uid(),
      firstName: "Elena",
      lastName: "Rodriguez",
      phone: "+14155550199",
      email: "elena@initech.com",
      companyId: initech.id,
      designation: "CTO",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  return {
    companies: [acme, northwind, initech],
    contacts,
    calls: [],
  };
}

function load(): State {
  if (!isBrowser) return { contacts: [], companies: [], calls: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as State;
  } catch {
    return { contacts: [], companies: [], calls: [] };
  }
}

let state: State = { contacts: [], companies: [], calls: [] };
let hydrated = false;
const listeners = new Set<() => void>();

function ensureHydrated() {
  if (!hydrated && isBrowser) {
    state = load();
    hydrated = true;
  }
}

function persist() {
  if (isBrowser) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function setState(updater: (s: State) => State) {
  ensureHydrated();
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): State {
  ensureHydrated();
  return state;
}

const emptyState: State = { contacts: [], companies: [], calls: [] };
function getServerSnapshot(): State {
  return emptyState;
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getServerSnapshot()),
  );
}

// ============ Contacts ============
export function addContact(data: Omit<Contact, "id" | "createdAt" | "updatedAt">): Contact {
  const c: Contact = { ...data, id: uid(), createdAt: Date.now(), updatedAt: Date.now() };
  setState((s) => ({ ...s, contacts: [c, ...s.contacts] }));
  return c;
}

export function updateContact(id: ID, patch: Partial<Contact>) {
  setState((s) => ({
    ...s,
    contacts: s.contacts.map((c) =>
      c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c,
    ),
  }));
}

export function deleteContact(id: ID) {
  setState((s) => ({ ...s, contacts: s.contacts.filter((c) => c.id !== id) }));
}

// ============ Companies ============
export function addCompany(data: Omit<Company, "id" | "createdAt" | "updatedAt">): Company {
  const c: Company = { ...data, id: uid(), createdAt: Date.now(), updatedAt: Date.now() };
  setState((s) => ({ ...s, companies: [c, ...s.companies] }));
  return c;
}

export function updateCompany(id: ID, patch: Partial<Company>) {
  setState((s) => ({
    ...s,
    companies: s.companies.map((c) =>
      c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c,
    ),
  }));
}

export function deleteCompany(id: ID) {
  setState((s) => ({
    ...s,
    companies: s.companies.filter((c) => c.id !== id),
    contacts: s.contacts.map((c) =>
      c.companyId === id ? { ...c, companyId: undefined } : c,
    ),
  }));
}

// ============ Calls ============
export function addCallLog(data: Omit<CallLog, "id">): CallLog {
  const log: CallLog = { ...data, id: uid() };
  setState((s) => ({ ...s, calls: [log, ...s.calls] }));
  return log;
}

export function updateCallLog(id: ID, patch: Partial<CallLog>) {
  setState((s) => ({
    ...s,
    calls: s.calls.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  }));
}

// ============ Lookups ============
export function findContactByPhone(phone: string, contacts: Contact[]): Contact | undefined {
  const normalized = phone.replace(/\D/g, "");
  if (!normalized) return undefined;
  return contacts.find((c) => c.phone.replace(/\D/g, "").includes(normalized));
}

export function contactsForCompany(companyId: ID, contacts: Contact[]): Contact[] {
  return contacts.filter((c) => c.companyId === companyId);
}
