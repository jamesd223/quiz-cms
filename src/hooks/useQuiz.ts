"use client";

import { useQuery } from "@tanstack/react-query";

export const useQuiz = (id: string) => {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes/${id}`);
      if (!res.ok) throw new Error("Quiz not found");
      return res.json() as Promise<{
        id: string;
        title: string;
        slug: string;
        brand: string;
        status: "draft" | "published" | "archived";
        updatedAt: string;
        versions: Array<{
          id: string;
          name: string;
          isDefault: boolean;
          trafficWeight: number;
          steps: Array<{
            id: string;
            orderIndex: number;
            meta: {
              title: string;
              description?: string;
              footnote?: string;
              cta?: string;
              isVisible: boolean;
              layout: "default" | "wide" | "narrow";
              media?: { id: string; url: string } | null;
            };
            gridColumns: number;
            gridGapPx: number;
            fields: any[];
          }>;
        }>;
      }>;
    },
  });
};
