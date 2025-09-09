"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listQuizzes, type Quiz } from "@/lib/api/quizzes";
import { TextInput as Input } from "@/components/ui/text-input";

export default function QuizzesPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError } = useQuery<Quiz[]>({
    queryKey: ["quizzes"],
    queryFn: () => listQuizzes(),
  });
  const rows = useMemo(
    () =>
      (data ?? []).filter((q) =>
        [q.title, q.slug].some((v) =>
          v?.toLowerCase().includes(query.toLowerCase())
        )
      ),
    [data, query]
  );

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="xl:col-span-3 rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="text-sm text-neutral-400">
            {isLoading
              ? "Loading..."
              : isError
              ? "Failed to load"
              : `${rows.length} result(s)`}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quizzes..."
              className="h-9 w-64"
            />
            <Link
              href="/quizzes/new"
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
            >
              New quiz
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-md ring-1 ring-white/10">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/60 text-neutral-300">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Title</th>
                <th className="px-3 py-2 text-left font-medium">Slug</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Brand ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr
                  key={q._id}
                  className="border-t border-white/10 hover:bg-neutral-900/50"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/quizzes/${q._id}`}
                      className="text-indigo-300 hover:underline"
                    >
                      {q.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{q.slug}</td>
                  <td className="px-3 py-2 capitalize">{q.status}</td>
                  <td className="px-3 py-2 text-neutral-400">{q.brand_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
