"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuiz, updateQuiz, type Quiz } from "@/lib/api/quizzes";
import { listBrands, type Brand } from "@/lib/api/brands";
import { TextInput as Input } from "@/components/ui/text-input";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { listVersionsByQuiz, type Version } from "@/lib/api/versions";
import { listStepsByVersion, type Step } from "@/lib/api/steps";

export default function QuizOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<Quiz | undefined>({
    queryKey: ["quiz", id],
    queryFn: () => getQuiz(id),
  });
  const { data: brands } = useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: () => listBrands(),
  });
  const { data: versions } = useQuery<Version[]>({
    queryKey: ["versions", id],
    queryFn: () => listVersionsByQuiz(id),
  });
  const defaultVersion = useMemo(
    () => (versions ?? []).find((v) => v.is_default) ?? (versions ?? [])[0],
    [versions]
  );
  const { data: steps } = useQuery<Step[] | undefined>({
    enabled: !!defaultVersion?._id,
    queryKey: ["steps", defaultVersion?._id],
    queryFn: () => listStepsByVersion(defaultVersion!._id),
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
            <span className="text-neutral-300">Brand</span>
            <select
              value={state.brand_id ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, brand_id: e.target.value }))
              }
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select brand</option>
              {(brands ?? []).map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
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
        <div className="mt-4 flex items-center gap-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            Save
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push(`/quizzes/${id}/preview`)}
          >
            Preview
          </Button>
        </div>
      </div>
      <div className="rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-200">
            Steps · {defaultVersion?.label ?? "-"}
          </h2>
          {defaultVersion && (
            <Button
              variant="secondary"
              onClick={() =>
                router.push(`/versions/${defaultVersion._id}/steps`)
              }
            >
              Manage steps
            </Button>
          )}
        </div>
        <ol className="space-y-2">
          {(steps ?? [])
            .slice()
            .sort((a, b) => a.order_index - b.order_index)
            .map((s) => (
              <li
                key={s._id}
                className="flex items-center justify-between rounded-md bg-neutral-900/60 px-3 py-2 ring-1 ring-white/10"
              >
                <div>
                  <div className="text-sm">{s.title ?? "Untitled"}</div>
                  <div className="text-xs text-neutral-400">
                    Order {s.order_index} · Grid {s.grid_columns ?? 12} cols ·
                    Gap {s.grid_gap_px ?? 8}px
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => router.push(`/steps/${s._id}`)}
                >
                  Edit
                </Button>
              </li>
            ))}
          {(!steps || steps.length === 0) && (
            <li className="text-sm text-neutral-400">No steps yet.</li>
          )}
        </ol>
      </div>
    </div>
  );
}
