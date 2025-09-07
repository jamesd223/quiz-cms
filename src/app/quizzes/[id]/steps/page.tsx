"use client";

import { useParams } from "next/navigation";
import { useQuiz } from "@/hooks/useQuiz";
import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function StepsTab() {
  const params = useParams<{ id: string }>();
  const id = params.id as string;
  const { data, isLoading } = useQuiz(id);
  const qc = useQueryClient();
  const version = useMemo(() => data?.versions.find((v) => v.isDefault) ?? data?.versions[0], [data]);

  const add = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quizzes/${id}/versions/${version!.id}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Step ${version!.steps.length + 1}` }),
      });
      if (!res.ok) throw new Error("Failed to add step");
      return res.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["quiz", id] }),
  });

  const del = useMutation({
    mutationFn: async (stepId: string) => {
      const res = await fetch(`/api/quizzes/${id}/versions/${version!.id}/steps/${stepId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete step");
      return res.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["quiz", id] }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data || !version) return <div>Not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-300">Steps · {version.name}</h2>
        <button
          onClick={() => add.mutate()}
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
        >
          Add step
        </button>
      </div>
      <ol className="space-y-2">
        {version.steps
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-md bg-neutral-900/60 px-3 py-2 ring-1 ring-white/10">
              <a href={`/quizzes/${id}/steps/${s.id}`} className="group block">
                <div className="text-sm group-hover:underline">{s.meta.title}</div>
                <div className="text-xs text-neutral-400">Order {s.orderIndex}</div>
              </a>
              <button
                onClick={() => del.mutate(s.id)}
                className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-300 ring-1 ring-white/10 hover:bg-neutral-700"
              >
                Delete
              </button>
            </li>
          ))}
      </ol>
    </div>
  );
}


