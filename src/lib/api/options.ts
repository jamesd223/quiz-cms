"use client";

import { apiFetch } from "@/lib/api/client";

export type Option = {
  _id: string;
  field_id: string;
  order_index: number;
  is_visible?: boolean;
  label?: string;
  description?: string;
  value: string;
  icon_media_id?: string;
  image_media_id?: string;
  is_default?: boolean;
  score?: number;
  row_index?: number;
  col_index?: number;
  row_span?: number;
  col_span?: number;
};

type ListResponse = Option[] | { items?: Option[] } | { data?: Option[] };

export const listOptionsByField = async (
  fieldId: string
): Promise<Option[]> => {
  const res = await apiFetch<ListResponse>(`/v1/options/field/${fieldId}`, {
    method: "GET",
  });
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    const items = obj["items"];
    if (Array.isArray(items)) return items as Option[];
    const data = obj["data"];
    if (Array.isArray(data)) return data as Option[];
  }
  return [];
};

export const createOption = async (
  payload: Omit<Option, "_id">
): Promise<Option | undefined> => {
  const res = await apiFetch<Option | undefined>("/v1/options", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
};

export const updateOption = async (
  id: string,
  updates: Partial<Option>
): Promise<Option | undefined> => {
  const res = await apiFetch<Option | undefined>(`/v1/options/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return res;
};

export const deleteOption = async (id: string): Promise<void> => {
  await apiFetch(`/v1/options/${id}`, { method: "DELETE", parseJson: false });
};

export const getOption = async (id: string): Promise<Option | undefined> => {
  const res = await apiFetch<Option | { option?: Option } | undefined>(
    `/v1/options/${id}`,
    { method: "GET" }
  );
  if (!res) return undefined;
  if (typeof res === "object" && res && !Array.isArray(res)) {
    const obj = res as Record<string, unknown>;
    const maybe = obj["option"];
    if (maybe && typeof maybe === "object") return maybe as Option;
  }
  return res as Option;
};
