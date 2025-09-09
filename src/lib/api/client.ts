"use client";

import { getToken, setToken, clearToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
  parseJson?: boolean;
};

const tryParse = async (res: Response): Promise<unknown> => {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
};

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

const refresh = async (): Promise<string | null> => {
  if (isRefreshing) {
    await new Promise<void>((r) => pendingRequests.push(r));
    return getToken();
  }
  isRefreshing = true;
  try {
    const res = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    const data = (await tryParse(res)) as { access_token?: string } | undefined;
    if (res.ok && data?.access_token) {
      setToken(data.access_token);
      return data.access_token;
    }
    return null;
  } finally {
    isRefreshing = false;
    pendingRequests.forEach((fn) => fn());
    pendingRequests = [];
  }
};

export const apiFetch = async <T = unknown>(
  path: string,
  opts: ApiFetchOptions = {}
): Promise<T> => {
  const { auth = true, parseJson = true, headers, ...init } = opts;
  const token = getToken();
  const doRequest = async (bearer?: string): Promise<Response> => {
    const explicitContentType =
      headers && (headers as Record<string, unknown>)["Content-Type"];
    const shouldSetJson = !explicitContentType && typeof init.body === "string";
    const mergedHeaders: Record<string, string> = {
      ...(shouldSetJson ? { "Content-Type": "application/json" } : {}),
      ...(auth && (bearer || token)
        ? { Authorization: `Bearer ${bearer ?? token}` }
        : {}),
      ...((headers as Record<string, string>) || {}),
    };
    return fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: mergedHeaders,
      ...init,
    });
  };

  let res = await doRequest();
  if (res.status === 401 && auth) {
    const newToken = await refresh();
    if (newToken) {
      res = await doRequest(newToken);
    }
  }

  if (!res.ok) {
    const body = await tryParse(res);
    if (res.status === 401) clearToken();
    throw new ApiError(`Request failed with ${res.status}`, res.status, body);
  }

  if (!parseJson) return undefined as unknown as T;
  const body = (await tryParse(res)) as T;
  return body;
};
