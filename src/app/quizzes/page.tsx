"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requireAuthClient } from "@/lib/auth";

type QuizListItem = {
  id: string;
  title: string;
  slug: string;
  brand: string;
  status: "draft" | "published" | "archived";
  updatedAt: string;
};

export default function QuizzesPage() {
  useEffect(() => {
    requireAuthClient();
  }, []);

  const [query, setQuery] = useState("");
  const { data, isLoading } = useQuery<{ items: QuizListItem[] }>({
    queryKey: ["quizzes", { q: query }],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to load quizzes");
      return (await res.json()) as { items: QuizListItem[] };
    },
  });

  const qc = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      slug: string;
      brand: string;
    }) => {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create quiz");
      return res.json();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/quizzes/${id}/archive`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to archive");
      return res.json();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");

  const rows = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="px-6 py-6">
      <div className="sticky top-0 z-10 -mx-6 border-b border-white/10 bg-neutral-950/70 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">Quizzes</h1>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-9 w-64 rounded-md bg-neutral-900 px-3 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
          <div className="mb-3 text-sm text-neutral-400">
            {isLoading ? "Loading..." : `${rows.length} results`}
          </div>
          <div className="overflow-hidden rounded-md ring-1 ring-white/10">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900/60 text-neutral-300">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Title</th>
                  <th className="px-3 py-2 text-left font-medium">Slug</th>
                  <th className="px-3 py-2 text-left font-medium">Brand</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Updated</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((q) => (
                  <tr
                    key={q.id}
                    className="border-t border-white/10 hover:bg-neutral-900/50"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/quizzes/${q.id}`}
                        className="text-indigo-300 hover:underline"
                      >
                        {q.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{q.slug}</td>
                    <td className="px-3 py-2">{q.brand}</td>
                    <td className="px-3 py-2 capitalize">{q.status}</td>
                    <td className="px-3 py-2">
                      {new Date(q.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        className="rounded-md bg-neutral-800 px-2 py-1 text-xs ring-1 ring-white/10 hover:bg-neutral-700"
                        onClick={() => archiveMutation.mutate(q.id)}
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
          <h2 className="mb-3 text-sm font-medium text-neutral-200">
            Create new quiz
          </h2>
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              placeholder="Title"
            />
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              placeholder="Slug"
            />
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              placeholder="Brand"
            />
            <button
              onClick={() => createMutation.mutate({ title, slug, brand })}
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={!title || !slug || !brand || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
