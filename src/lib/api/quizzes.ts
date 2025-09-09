"use client";

import { apiFetch } from "@/lib/api/client";

export type QuizStatus = "draft" | "published" | "archived";

export type Quiz = {
  _id: string;
  brand_id: string;
  slug: string;
  title: string;
  subtitle?: string;
  locale_default?: string;
  progress_style?: string;
  show_trust_strip?: boolean;
  show_seen_on?: boolean;
  status: QuizStatus;
};

type ListResponse = Quiz[] | { items?: Quiz[] } | { data?: Quiz[] };

export const listQuizzes = async (): Promise<Quiz[]> => {
  const res = await apiFetch<ListResponse>("/v1/quizzes", { method: "GET" });
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const items = obj["items"];
    if (Array.isArray(items)) return items as Quiz[];
    const data = obj["data"];
    if (Array.isArray(data)) return data as Quiz[];
  }
  return [];
};

export const createQuiz = async (payload: {
  brand_id: string;
  slug: string;
  title: string;
  subtitle?: string;
  locale_default?: string;
  progress_style?: string;
  show_trust_strip?: boolean;
  show_seen_on?: boolean;
  status?: QuizStatus;
}): Promise<Quiz | undefined> => {
  const res = await apiFetch<Quiz | undefined>("/v1/quizzes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
};

export const getQuiz = async (id: string): Promise<Quiz | undefined> => {
  const res = await apiFetch<Quiz | { quiz?: Quiz } | undefined>(
    `/v1/quizzes/${id}`,
    {
      method: "GET",
    }
  );
  if (!res) return undefined;
  if (typeof res === "object" && res && !Array.isArray(res)) {
    const obj = res as Record<string, unknown>;
    const maybeQuiz = obj["quiz"];
    if (maybeQuiz && typeof maybeQuiz === "object") return maybeQuiz as Quiz;
  }
  return res as Quiz;
};

export const updateQuiz = async (
  id: string,
  updates: Partial<Omit<Quiz, "_id">>
): Promise<Quiz | undefined> => {
  const res = await apiFetch<Quiz | undefined>(`/v1/quizzes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return res;
};
