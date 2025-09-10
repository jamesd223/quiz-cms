"use client";

import { apiFetch } from "@/lib/api/client";

export type FieldType =
  | "choice_single"
  | "choice_multi"
  | "input_text"
  | "input_number"
  | "input_email"
  | "input_phone"
  | "date"
  | "slider"
  | "group";

export type Field = {
  _id: string;
  step_id: string;
  order_index: number;
  is_visible?: boolean;
  key: string;
  label?: string;
  help_text?: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  input_mask?: string;
  min?: number;
  max?: number;
  unit?: string;
  validation_regex?: string;
  validation_message?: string;
  row_index?: number;
  col_index?: number;
  row_span?: number;
  col_span?: number;
  container_layout_mode?: string;
  container_grid_columns?: number;
  container_grid_rows?: number;
  container_gap_px?: number;
  randomize_options?: boolean;
  value_format?: string;
  default_value?: unknown;
};

type ListResponse = Field[] | { items?: Field[] } | { data?: Field[] };

export const listFieldsByStep = async (stepId: string): Promise<Field[]> => {
  const res = await apiFetch<ListResponse>(`/v1/fields/step/${stepId}`, {
    method: "GET",
  });
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const items = obj["items"];
    if (Array.isArray(items)) return items as Field[];
    const data = obj["data"];
    if (Array.isArray(data)) return data as Field[];
  }
  return [];
};

export const createField = async (
  payload: Omit<Field, "_id">
): Promise<Field | undefined> => {
  const res = await apiFetch<Field | undefined>("/v1/fields", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
};

export const updateField = async (
  id: string,
  updates: Partial<Field>
): Promise<Field | undefined> => {
  const res = await apiFetch<Field | undefined>(`/v1/fields/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return res;
};

export const deleteField = async (id: string): Promise<void> => {
  await apiFetch(`/v1/fields/${id}`, { method: "DELETE", parseJson: false });
};

export const getField = async (id: string): Promise<Field | undefined> => {
  const res = await apiFetch<Field | { field?: Field } | undefined>(
    `/v1/fields/${id}`,
    { method: "GET" }
  );
  if (!res) return undefined;
  if (typeof res === "object" && res && !Array.isArray(res)) {
    const obj = res as Record<string, unknown>;
    const maybe = obj["field"];
    if (maybe && typeof maybe === "object") return maybe as Field;
  }
  return res as Field;
};
