export type ID = string;

export interface Contact {
  id: ID;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  companyId?: ID;
  designation?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Company {
  id: ID;
  name: string;
  website?: string;
  industry?: string;
  revenue?: string;
  currentErp?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type CallType = "incoming" | "outgoing" | "missed";
export type CallStatus =
  | "idle"
  | "dialing"
  | "ringing"
  | "connected"
  | "ended"
  | "missed";

export interface CallLog {
  id: ID;
  phone: string;
  contactId?: ID;
  companyId?: ID;
  type: CallType;
  status: CallStatus;
  startedAt: number;
  endedAt?: number;
  durationSec: number;
  notes?: string;
  // Telnyx integration fields
  telnyxCallId?: string;
  telnyxCallControlId?: string;
  recordingUrl?: string;
  transcript?: string;
  transcriptStatus?: "pending" | "completed" | "failed";
}
