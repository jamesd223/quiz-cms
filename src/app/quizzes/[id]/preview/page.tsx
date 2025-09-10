"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getAssembledQuizBySlug,
  type AssembledQuiz,
} from "@/lib/api/assembled";
import { TextInput as Input } from "@/components/ui/text-input";
import { useState } from "react";
import { getQuiz, type Quiz } from "@/lib/api/quizzes";

export default function QuizPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [version, setVersion] = useState<string>("");
  const [seed, setSeed] = useState<string>("");
  const { data: quiz } = useQuery<Quiz | undefined>({
    queryKey: ["quiz", id],
    queryFn: () => getQuiz(id),
  });
  const slug = quiz?.slug ?? "";
  const { data, isLoading, isError } = useQuery<AssembledQuiz | undefined>({
    enabled: !!slug,
    queryKey: ["assembled", slug, version, seed],
    queryFn: () =>
      getAssembledQuizBySlug(slug, {
        version: version || undefined,
        seed: seed || undefined,
      }),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-200">Preview JSON</h2>
          <div className="flex items-center gap-2">
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="version label (optional)"
              className="h-9 w-56"
            />
            <Input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="seed (optional)"
              className="h-9 w-48"
            />
          </div>
        </div>
        <pre className="max-h-[60vh] overflow-auto rounded-md bg-neutral-900 p-3 text-xs ring-1 ring-white/10">
          {isLoading
            ? "Loading..."
            : isError
            ? "Failed to load"
            : JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
