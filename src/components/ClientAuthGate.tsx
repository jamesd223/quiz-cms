"use client";

import { ReactNode, useEffect } from "react";
import { requireAuthClient } from "@/lib/auth";

export default function ClientAuthGate({ children }: { children: ReactNode }) {
  useEffect(() => {
    requireAuthClient();
  }, []);
  return <>{children}</>;
}
