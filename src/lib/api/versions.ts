"use client";

import { apiFetch } from "@/lib/api/client";

export type Version = {
  _id: string;
  quiz_id: string;
  label: string;
  traffic_weight: number;
  is_default: boolean;
};

type ListResponse = Version[] | { items?: Version[] } | { data?: Version[] };

export const listVersionsByQuiz = async (
  quizId: string
): Promise<Version[]> => {
  const res = await apiFetch<ListResponse>(`/v1/versions/quiz/${quizId}`, {
    method: "GET",
  });
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const items = obj["items"];
    if (Array.isArray(items)) return items as Version[];
    const data = obj["data"];
    if (Array.isArray(data)) return data as Version[];
  }
  return [];
};

export const createVersion = async (payload: {
  quiz_id: string;
  label: string;
  traffic_weight?: number;
  is_default?: boolean;
}): Promise<Version | undefined> => {
  const res = await apiFetch<Version | undefined>("/v1/versions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
};

export const updateVersion = async (
  id: string,
  updates: Partial<Pick<Version, "label" | "traffic_weight" | "is_default">>
): Promise<Version | undefined> => {
  const res = await apiFetch<Version | undefined>(`/v1/versions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return res;
};
