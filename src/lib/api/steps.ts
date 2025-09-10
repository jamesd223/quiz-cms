"use client";

import { apiFetch } from "@/lib/api/client";

export type Step = {
  _id: string;
  quiz_version_id: string;
  order_index: number;
  is_visible?: boolean;
  title?: string;
  description?: string;
  footnote_text?: string;
  cta_text?: string;
  layout?: string;
  media_id?: string;
  grid_columns?: number;
  grid_rows?: number;
  grid_gap_px?: number;
};

type ListResponse = Step[] | { items?: Step[] } | { data?: Step[] };

export const listStepsByVersion = async (
  versionId: string
): Promise<Step[]> => {
  const res = await apiFetch<ListResponse>(`/v1/steps/version/${versionId}`, {
    method: "GET",
  });
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const items = obj["items"];
    if (Array.isArray(items)) return items as Step[];
    const data = obj["data"];
    if (Array.isArray(data)) return data as Step[];
  }
  return [];
};

export const createStep = async (
  payload: Omit<Step, "_id">
): Promise<Step | undefined> => {
  const res = await apiFetch<Step | undefined>("/v1/steps", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
};

export const updateStep = async (
  id: string,
  updates: Partial<Step>
): Promise<Step | undefined> => {
  const res = await apiFetch<Step | undefined>(`/v1/steps/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return res;
};

export const deleteStep = async (id: string): Promise<void> => {
  await apiFetch(`/v1/steps/${id}`, { method: "DELETE", parseJson: false });
};

export const getStep = async (id: string): Promise<Step | undefined> => {
  const res = await apiFetch<Step | { step?: Step } | undefined>(
    `/v1/steps/${id}`,
    { method: "GET" }
  );
  if (!res) return undefined;
  if (typeof res === "object" && res && !Array.isArray(res)) {
    const obj = res as Record<string, unknown>;
    const maybe = obj["step"];
    if (maybe && typeof maybe === "object") return maybe as Step;
  }
  return res as Step;
};
