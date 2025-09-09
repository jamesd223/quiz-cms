"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuiz, updateQuiz, type Quiz } from "@/lib/api/quizzes";
import { TextInput as Input } from "@/components/ui/text-input";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function QuizEditBasicsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<Quiz | undefined>({
    queryKey: ["quiz", id],
    queryFn: () => getQuiz(id),
  });

  const [state, setState] = useState<Partial<Quiz>>({});
  useEffect(() => {
    if (data) setState(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () =>
      updateQuiz(id, {
        title: state.title!,
        slug: state.slug!,
        brand_id: state.brand_id!,
        locale_default: state.locale_default,
        progress_style: state.progress_style,
        status: state.status!,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["quiz", id] });
      router.refresh();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Not found</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-200">Basics</h2>
          <Button
            variant="secondary"
            onClick={() => router.push(`/quizzes/${id}/versions`)}
          >
            Manage versions
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Title</span>
            <Input
              value={state.title ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, title: e.target.value }))
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Slug</span>
            <Input
              value={state.slug ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, slug: e.target.value }))
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Brand ID</span>
            <Input
              value={state.brand_id ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, brand_id: e.target.value }))
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Default locale</span>
            <Input
              value={state.locale_default ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, locale_default: e.target.value }))
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Progress style</span>
            <Input
              value={state.progress_style ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, progress_style: e.target.value }))
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Status</span>
            <select
              value={state.status}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  status: e.target.value as "draft" | "published" | "archived",
                }))
              }
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </label>
        </div>
        <div className="mt-4">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
