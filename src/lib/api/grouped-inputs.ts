"use client";

import { apiFetch } from "@/lib/api/client";

export type GroupedInput = {
  _id: string;
  field_id: string;
  order_index: number;
  is_visible?: boolean;
  field_key: string;
  label?: string;
  input_type: string;
  unit?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  required?: boolean;
  row_index?: number;
  col_index?: number;
  row_span?: number;
  col_span?: number;
};

type ListResponse =
  | GroupedInput[]
  | { items?: GroupedInput[] }
  | { data?: GroupedInput[] };

export const listGroupedInputsByField = async (
  fieldId: string
): Promise<GroupedInput[]> => {
  const res = await apiFetch<ListResponse>(
    `/v1/grouped-inputs/field/${fieldId}`,
    { method: "GET" }
  );
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const items = obj["items"];
    if (Array.isArray(items)) return items as GroupedInput[];
    const data = obj["data"];
    if (Array.isArray(data)) return data as GroupedInput[];
  }
  return [];
};

export const createGroupedInput = async (
  payload: Omit<GroupedInput, "_id">
): Promise<GroupedInput | undefined> => {
  const res = await apiFetch<GroupedInput | undefined>("/v1/grouped-inputs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
};

export const updateGroupedInput = async (
  id: string,
  updates: Partial<GroupedInput>
): Promise<GroupedInput | undefined> => {
  const res = await apiFetch<GroupedInput | undefined>(
    `/v1/grouped-inputs/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    }
  );
  return res;
};

export const deleteGroupedInput = async (id: string): Promise<void> => {
  await apiFetch(`/v1/grouped-inputs/${id}`, {
    method: "DELETE",
    parseJson: false,
  });
};

export const getGroupedInput = async (
  id: string
): Promise<GroupedInput | undefined> => {
  const res = await apiFetch<
    GroupedInput | { grouped_input?: GroupedInput } | undefined
  >(`/v1/grouped-inputs/${id}`, {
    method: "GET",
  });
  if (!res) return undefined;
  if (typeof res === "object" && res && !Array.isArray(res)) {
    const obj = res as Record<string, unknown>;
    const maybe = (obj as { grouped_input?: unknown }).grouped_input;
    if (maybe && typeof maybe === "object") return maybe as GroupedInput;
  }
  return res as GroupedInput;
};
