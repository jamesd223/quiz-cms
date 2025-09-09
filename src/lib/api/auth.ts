"use client";

import { apiFetch } from "@/lib/api/client";
import { setToken, clearToken } from "@/lib/auth";

export const login = async (
  email: string,
  password: string
): Promise<string> => {
  const data = await apiFetch<{ access_token: string }>("/v1/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data.access_token;
};

export const logout = async (): Promise<void> => {
  try {
    await apiFetch("/v1/auth/logout", { method: "POST" });
  } finally {
    clearToken();
  }
};
