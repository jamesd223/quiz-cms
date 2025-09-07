"use client";

import { ReactNode, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    const enableMocking = async () => {
      if (process.env.NODE_ENV === "development") {
        const { worker } = await import("@/mocks/browser");
        await worker.start({ serviceWorker: { url: "/mockServiceWorker.js" } });
      }
    };
    void enableMocking();
  }, []);

  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}
