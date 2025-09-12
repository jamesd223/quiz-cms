"use client";

import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuiz, updateQuiz, type Quiz } from "@/lib/api/quizzes";
import { listBrands, type Brand } from "@/lib/api/brands";
import { TextInput as Input } from "@/components/ui/text-input";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  listVersionsByQuiz,
  type Version,
  deleteVersion,
} from "@/lib/api/versions";
import { listStepsByVersion, deleteStep, type Step } from "@/lib/api/steps";
import { listMedia, type Media } from "@/lib/api/media";

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
  const {
    data: media,
    isLoading: isMediaLoading,
    isError: isMediaError,
  } = useQuery<Media[]>({
    queryKey: ["media"],
    queryFn: () => listMedia(),
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

  const removeStep = useMutation({
    mutationFn: async (stepIdToDelete: string) => deleteStep(stepIdToDelete),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["steps", defaultVersion?._id],
      });
      router.refresh();
    },
  });

  const removeVersion = useMutation({
    mutationFn: async (versionIdToDelete: string) =>
      deleteVersion(versionIdToDelete),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["versions", id] });
      router.refresh();
    },
  });

  const availableLocales = [
    "",
    "en-US",
    "en-GB",
    "es-ES",
    "fr-FR",
    "de-DE",
    "pt-BR",
    "it-IT",
    "nl-NL",
    "ja-JP",
    "ko-KR",
    "zh-CN",
  ];

  const progressStyles = ["", "bar", "dots", "none"];

  const [panel, setPanel] = useState<"steps" | "versions" | "media">("steps");

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-xl bg-neutral-900/50 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-wide text-neutral-200">
            Basics
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <label className="space-y-1 text-sm md:col-span-8">
            <span className="text-neutral-300">Title</span>
            <Input
              value={state.title ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, title: e.target.value }))
              }
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-4">
            <span className="text-neutral-300">Slug</span>
            <Input
              value={state.slug ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, slug: e.target.value }))
              }
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-12">
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
          <label className="space-y-1 text-sm md:col-span-4">
            <span className="text-neutral-300">Default locale</span>
            <select
              value={state.locale_default ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, locale_default: e.target.value }))
              }
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            >
              {availableLocales.map((loc) => (
                <option key={loc || "none"} value={loc}>
                  {loc ? loc : "Select locale (optional)"}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-4">
            <span className="text-neutral-300">Progress style</span>
            <select
              value={state.progress_style ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, progress_style: e.target.value }))
              }
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            >
              {progressStyles.map((ps) => (
                <option key={ps || "none"} value={ps}>
                  {ps ? ps : "Select progress style (optional)"}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-4">
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
          <div className="md:col-span-12 flex items-center justify-end gap-2 pt-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              Save
            </Button>
          </div>
        </div>
      </div>
      {/* Removed redundant navigation card */}
      <div className="rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <div className="mb-3">
          <div className="mb-3 grid grid-cols-3 gap-3 md:grid-cols-6">
            <button
              type="button"
              onClick={() => setPanel("steps")}
              className={
                "rounded-md px-4 py-2 text-sm ring-1 ring-white/10 " +
                (panel === "steps"
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "bg-neutral-900/60 text-neutral-200 hover:bg-neutral-800/60")
              }
            >
              Steps
            </button>
            <button
              type="button"
              onClick={() => setPanel("versions")}
              className={
                "rounded-md px-4 py-2 text-sm ring-1 ring-white/10 " +
                (panel === "versions"
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "bg-neutral-900/60 text-neutral-200 hover:bg-neutral-800/60")
              }
            >
              Versions
            </button>
            <button
              type="button"
              onClick={() => setPanel("media")}
              className={
                "rounded-md px-4 py-2 text-sm ring-1 ring-white/10 " +
                (panel === "media"
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "bg-neutral-900/60 text-neutral-200 hover:bg-neutral-800/60")
              }
            >
              Media
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-200">
              {panel === "steps"
                ? `Steps · ${defaultVersion?.label ?? "-"}`
                : panel === "versions"
                ? "Versions"
                : "Media"}
            </h2>
            {panel === "steps" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    router.push(
                      defaultVersion
                        ? `/versions/${defaultVersion._id}/steps`
                        : `/quizzes/${id}/versions`
                    )
                  }
                >
                  Manage steps
                </Button>
                <Button
                  onClick={() =>
                    router.push(
                      defaultVersion
                        ? `/versions/${defaultVersion._id}/steps/new`
                        : `/quizzes/${id}/versions`
                    )
                  }
                >
                  New step
                </Button>
              </div>
            )}
            {panel === "versions" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/quizzes/${id}/versions`)}
                >
                  Manage versions
                </Button>
                <Button
                  onClick={() => router.push(`/quizzes/${id}/versions/new`)}
                >
                  New version
                </Button>
              </div>
            )}
            {panel === "media" && (
              <Button variant="secondary" onClick={() => router.push(`/media`)}>
                Open library
              </Button>
            )}
          </div>
        </div>

        {panel === "steps" && (
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
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => router.push(`/steps/${s._id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this step?")) {
                          removeStep.mutate(s._id);
                        }
                      }}
                      disabled={removeStep.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            {(!steps || steps.length === 0) && (
              <li className="text-sm text-neutral-400">No steps yet.</li>
            )}
          </ol>
        )}

        {panel === "versions" && (
          <div className="space-y-2">
            {(versions ?? []).length === 0 && (
              <div className="text-sm text-neutral-400">No versions yet.</div>
            )}
            <ol className="space-y-2">
              {(versions ?? []).map((v) => (
                <li
                  key={v._id}
                  className="flex items-center justify-between rounded-md bg-neutral-900/60 px-3 py-2 ring-1 ring-white/10"
                >
                  <div>
                    <div className="text-sm">{v.label ?? "Untitled"}</div>
                    <div className="text-xs text-neutral-400">
                      {v.is_default ? "Default" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => router.push(`/versions/${v._id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this version?")) {
                          removeVersion.mutate(v._id);
                        }
                      }}
                      disabled={removeVersion.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {panel === "media" && (
          <div className="space-y-3">
            <div className="text-sm text-neutral-400">
              {isMediaLoading
                ? "Loading..."
                : isMediaError
                ? "Failed to load"
                : `${(media ?? []).length} item(s)`}
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {(media ?? []).map((m) => (
                <div
                  key={m._id}
                  className="rounded-lg bg-neutral-900/50 p-2 ring-1 ring-white/10"
                >
                  <div className="aspect-square overflow-hidden rounded-md bg-neutral-800">
                    {m.type !== "icon" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.url}
                        alt={m.alt ?? ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs text-neutral-400">
                        icon
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
