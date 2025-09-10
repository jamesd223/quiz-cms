"use client";

import { apiFetch } from "@/lib/api/client";
import { getToken } from "@/lib/auth";

export type Media = {
  _id: string;
  type: "icon" | "image" | "logo" | "avatar";
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  locale?: string;
};

type ListResponse = Media[] | { items?: Media[] } | { data?: Media[] };

export const listMedia = async (): Promise<Media[]> => {
  const res = await apiFetch<ListResponse>("/v1/media", { method: "GET" });
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj["items"])) return obj["items"] as Media[];
    if (Array.isArray(obj["data"])) return obj["data"] as Media[];
  }
  return [];
};

export const uploadMedia = async (
  form: FormData
): Promise<Media | undefined> => {
  // multipart/form-data per spec
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001"
    }/v1/media`,
    {
      method: "POST",
      body: form,
      credentials: "include",
      headers: (() => {
        const token = getToken();
        return token ? { Authorization: `Bearer ${token}` } : undefined;
      })(),
    }
  );
  if (!res.ok) return undefined;
  try {
    return (await res.json()) as Media;
  } catch {
    return undefined;
  }
};

export const deleteMedia = async (id: string): Promise<void> => {
  await apiFetch(`/v1/media/${id}`, { method: "DELETE", parseJson: false });
};
