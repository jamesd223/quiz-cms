"use client";

import { apiFetch } from "@/lib/api/client";

export type Submission = {
  _id?: string;
  quiz_id: string;
  version_label: string;
  answers: Record<string, unknown>;
  meta?: { ua?: string; locale?: string; ip?: string; ref?: string };
};

export const createSubmission = async (payload: Submission): Promise<void> => {
  await apiFetch("/v1/submissions", {
    method: "POST",
    body: JSON.stringify(payload),
    parseJson: false,
  });
};
