"use client";

import { apiFetch } from "@/lib/api/client";

export type Brand = { _id: string; name: string };

export const listBrands = async (): Promise<Brand[]> => {
  // Handle multiple possible response shapes: Brand[], { items: Brand[] }, { data: Brand[] }
  const data = await apiFetch<unknown>("/v1/brands", { method: "GET" });
  if (Array.isArray(data)) return data as Brand[];
  if (data && typeof data === "object") {
    const maybe = data as { items?: unknown; data?: unknown };
    if (Array.isArray(maybe.items)) return maybe.items as Brand[];
    if (Array.isArray(maybe.data)) return maybe.data as Brand[];
  }
  return [];
};

export const createBrand = async (name: string): Promise<Brand | undefined> => {
  const res = await apiFetch<Brand | undefined>("/v1/brands", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return res;
};

export const updateBrand = async (
  id: string,
  updates: { name?: string }
): Promise<Brand | undefined> => {
  const res = await apiFetch<Brand | undefined>(`/v1/brands/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return res;
};

export const deleteBrand = async (id: string): Promise<void> => {
  await apiFetch(`/v1/brands/${id}`, { method: "DELETE", parseJson: false });
};
