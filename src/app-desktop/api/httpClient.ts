import { readSession, clearSession } from "@/app-desktop/auth/authStorage";

// Fixes the Angular ApiService bug where the "which backend" flag was
// respected inconsistently per-verb (ignored on GET, absent on DELETE).
// Every call here must explicitly choose a target and every verb honors it.
export type ApiTarget = "default" | "enterprise";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
const ENTERPRISE_API_BASE_URL = import.meta.env.VITE_ENTERPRISE_API_BASE_URL as string | undefined;
const AUTH_KEY = import.meta.env.VITE_AUTH_KEY as string | undefined;

function baseUrlFor(target: ApiTarget): string {
  const url = target === "enterprise" ? ENTERPRISE_API_BASE_URL : API_BASE_URL;
  if (!url) {
    throw new Error(
      `Missing env var for API target "${target}" — set VITE_API_BASE_URL / VITE_ENTERPRISE_API_BASE_URL`,
    );
  }
  return url;
}

function buildHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  if (AUTH_KEY) headers.set("authKey", AUTH_KEY);
  const session = readSession();
  if (session?.accessToken) headers.set("Authorization", `Bearer ${session.accessToken}`);
  return headers;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let onUnauthorized: (() => void) | null = null;
export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  target: ApiTarget,
  path: string,
  options?: { body?: unknown; params?: Record<string, string | number | undefined>; headers?: HeadersInit },
): Promise<T> {
  const url = new URL(path, baseUrlFor(target));
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const headers = buildHeaders(options?.headers);
  const hasBody = options?.body !== undefined && method !== "GET";
  if (hasBody) headers.set("Content-Type", "application/json");

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: hasBody ? JSON.stringify(options?.body) : undefined,
  });

  if (res.status === 401) {
    clearSession();
    onUnauthorized?.();
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      // no JSON body
    }
    throw new ApiError(`Request failed: ${method} ${path} (${res.status})`, res.status, body);
  }

  return (await res.json()) as T;
}

export const api = {
  get: <T>(target: ApiTarget, path: string, params?: Record<string, string | number | undefined>) =>
    request<T>("GET", target, path, { params }),
  post: <T>(target: ApiTarget, path: string, body?: unknown) => request<T>("POST", target, path, { body }),
  put: <T>(target: ApiTarget, path: string, body?: unknown) => request<T>("PUT", target, path, { body }),
  delete: <T>(target: ApiTarget, path: string) => request<T>("DELETE", target, path),
};

export async function postBlob(target: ApiTarget, path: string, body?: unknown): Promise<Blob> {
  const url = new URL(path, baseUrlFor(target));
  const headers = buildHeaders();
  headers.set("Content-Type", "application/json");

  const res = await fetch(url.toString(), {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearSession();
    onUnauthorized?.();
  }
  if (!res.ok) {
    throw new ApiError(`Request failed: POST ${path} (${res.status})`, res.status);
  }
  return res.blob();
}
