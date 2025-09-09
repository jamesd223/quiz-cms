"use client";

import { apiFetch } from "@/lib/api/client";

export type AssembledQuiz = {
  quiz: unknown;
  version: unknown;
  steps: unknown[];
  fields: unknown[];
  options: unknown[];
  grouped_inputs: unknown[];
  media?: unknown[];
};

export const getAssembledQuizBySlug = async (
  slug: string,
  params?: { version?: string; seed?: string }
): Promise<AssembledQuiz | undefined> => {
  const qs = new URLSearchParams();
  if (params?.version) qs.set("version", params.version);
  if (params?.seed) qs.set("seed", params.seed);
  const res = await apiFetch<AssembledQuiz>(
    `/v1/quizzes/${encodeURIComponent(slug)}${
      qs.toString() ? `?${qs.toString()}` : ""
    }`
  );
  return res;
};
