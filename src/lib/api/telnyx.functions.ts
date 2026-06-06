import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TELNYX_BASE = "https://api.telnyx.com/v2";

function getAuth(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function telnyxFetch(path: string, apiKey: string, opts?: RequestInit) {
  const res = await fetch(`${TELNYX_BASE}${path}`, {
    ...opts,
    headers: {
      ...getAuth(apiKey),
      ...(opts?.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.errors?.[0]?.detail ?? `Telnyx error: ${res.status}`);
  }
  return json;
}

export const makeTelnyxCall = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      apiKey: z.string().min(1),
      from: z.string().min(1),
      to: z.string().min(1),
      connectionId: z.string().optional(),
      webhookUrl: z.string().url().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const payload: Record<string, unknown> = {
      from: data.from,
      to: data.to,
    };
    if (data.connectionId) payload.connection_id = data.connectionId;
    if (data.webhookUrl) {
      payload.webhook_url = data.webhookUrl;
      payload.webhook_url_method = "POST";
    }

    const json = await telnyxFetch("/calls", data.apiKey, {
      method: "POST",
      body: JSON.stringify({ data: payload }),
    });

    return {
      callId: json.data?.id as string,
      callControlId: json.data?.call_control_id as string,
      status: json.data?.status as string,
      raw: json.data,
    };
  });

export const getTelnyxCallDetails = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      apiKey: z.string().min(1),
      callControlId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const json = await telnyxFetch(`/calls/${data.callControlId}`, data.apiKey);
    return {
      status: json.data?.status as string,
      direction: json.data?.direction as string,
      duration: json.data?.duration as number | undefined,
      startedAt: json.data?.start_time as string | undefined,
      endedAt: json.data?.end_time as string | undefined,
      raw: json.data,
    };
  });

export const getTelnyxRecordings = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      apiKey: z.string().min(1),
      callControlId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const json = await telnyxFetch(
      `/calls/${data.callControlId}/recordings`,
      data.apiKey,
    );
    const recordings = (json.data ?? []) as Array<{
      id: string;
      download_url?: string;
      status?: string;
      duration?: number;
      channels?: string;
    }>;
    return recordings.map((r) => ({
      id: r.id,
      downloadUrl: r.download_url ?? null,
      status: r.status ?? "unknown",
      duration: r.duration ?? 0,
      channels: r.channels ?? "single",
    }));
  });

export const getTelnyxTranscription = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      apiKey: z.string().min(1),
      callControlId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const json = await telnyxFetch(
      `/calls/${data.callControlId}/transcription`,
      data.apiKey,
    );
    return {
      status: json.data?.status as string,
      text: json.data?.transcription_text as string | undefined,
      raw: json.data,
    };
  });

export const fetchTelnyxNumbers = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      apiKey: z.string().min(1),
      limit: z.number().min(1).max(50).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const json = await telnyxFetch(
      `/phone_numbers?filter[limit]=${data.limit ?? 10}`,
      data.apiKey,
    );
    const numbers = (json.data ?? []) as Array<{
      id: string;
      phone_number: string;
      connection_name?: string;
    }>;
    return numbers.map((n) => ({
      id: n.id,
      phoneNumber: n.phone_number,
      connectionName: n.connection_name ?? "",
    }));
  });

export const requestTelnyxRecording = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      apiKey: z.string().min(1),
      callControlId: z.string().min(1),
      format: z.enum(["wav", "mp3"]).optional(),
      channels: z.enum(["single", "dual"]).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const payload: Record<string, unknown> = {
      channels: data.channels ?? "single",
      format: data.format ?? "mp3",
    };
    const json = await telnyxFetch(
      `/calls/${data.callControlId}/actions/record_start`,
      data.apiKey,
      {
        method: "POST",
        body: JSON.stringify({ data: payload }),
      },
    );
    return {
      result: json.data?.result as string,
      raw: json.data,
    };
  });

export const requestTelnyxTranscription = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      apiKey: z.string().min(1),
      callControlId: z.string().min(1),
      language: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const payload: Record<string, unknown> = {};
    if (data.language) payload.language = data.language;
    const json = await telnyxFetch(
      `/calls/${data.callControlId}/actions/transcription_start`,
      data.apiKey,
      {
        method: "POST",
        body: JSON.stringify({ data: payload }),
      },
    );
    return {
      result: json.data?.result as string,
      raw: json.data,
    };
  });
