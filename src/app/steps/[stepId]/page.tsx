"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStep, updateStep, type Step } from "@/lib/api/steps";
import { listFieldsByStep, deleteField, type Field } from "@/lib/api/fields";
import { useMemo } from "react";
import { TextInput as Input } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export default function StepEditorPage() {
  const { stepId } = useParams<{ stepId: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const qc = useQueryClient();
  const {
    data: step,
    isLoading,
    isError,
  } = useQuery<Step | undefined>({
    queryKey: ["step", stepId],
    queryFn: () => getStep(stepId),
  });
  const { data: fields } = useQuery<Field[]>({
    enabled: !!step?._id,
    queryKey: ["fields", step?._id],
    queryFn: () => listFieldsByStep(step!._id),
  });
  const orderedFields = useMemo(
    () => (fields ?? []).slice().sort((a, b) => a.order_index - b.order_index),
    [fields]
  );

  const patch = useMutation({
    mutationFn: async (updates: Partial<Step>) => updateStep(stepId, updates),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["step", stepId] });
      router.refresh();
    },
  });

  const removeField = useMutation({
    mutationFn: async (fieldIdToDelete: string) => deleteField(fieldIdToDelete),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["fields", stepId] });
      router.refresh();
    },
  });

  const mediaParam = search.get("media_id");
  if (mediaParam && step && step.media_id !== mediaParam) {
    // apply once when arriving from media attach
    patch.mutate({ media_id: mediaParam });
  }

  if (isLoading) return <div>Loading...</div>;
  if (isError || !step) return <div>Not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-4">
        <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
          <h2 className="mb-3 text-sm font-medium text-neutral-200">Meta</h2>
          <div className="grid grid-cols-1 gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Title</span>
              <Input
                defaultValue={step.title}
                onBlur={(e) => patch.mutate({ title: e.target.value })}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Order</span>
              <Input
                type="number"
                min={0}
                defaultValue={step.order_index}
                onBlur={(e) =>
                  patch.mutate({ order_index: Number(e.target.value) })
                }
                className="w-32"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Description</span>
              <Input
                defaultValue={step.description}
                onBlur={(e) => patch.mutate({ description: e.target.value })}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Footnote</span>
              <Input
                defaultValue={step.footnote_text}
                onBlur={(e) => patch.mutate({ footnote_text: e.target.value })}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">CTA</span>
              <Input
                defaultValue={step.cta_text}
                onBlur={(e) => patch.mutate({ cta_text: e.target.value })}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Layout</span>
              <Input
                defaultValue={step.layout ?? "default"}
                onBlur={(e) => patch.mutate({ layout: e.target.value })}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Hero media ID</span>
              <Input
                defaultValue={step.media_id}
                onBlur={(e) => patch.mutate({ media_id: e.target.value })}
              />
              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2"
                  onClick={() =>
                    router.push(
                      `/media?next=${encodeURIComponent(`/steps/${stepId}`)}`
                    )
                  }
                >
                  Attach from library
                </Button>
              </div>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                defaultChecked={step.is_visible ?? true}
                onChange={(e) => patch.mutate({ is_visible: e.target.checked })}
              />
              Visible
            </label>
          </div>
        </div>

        <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
          <h2 className="mb-3 text-sm font-medium text-neutral-200">Grid</h2>
          <div className="flex items-center gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Columns</span>
              <Input
                type="number"
                min={1}
                max={24}
                defaultValue={step.grid_columns ?? 12}
                onBlur={(e) =>
                  patch.mutate({ grid_columns: Number(e.target.value) })
                }
                className="w-28"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Gap (px)</span>
              <Input
                type="number"
                min={0}
                max={64}
                defaultValue={step.grid_gap_px ?? 8}
                onBlur={(e) =>
                  patch.mutate({ grid_gap_px: Number(e.target.value) })
                }
                className="w-28"
              />
            </label>
          </div>
        </div>

        <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-200">Fields</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => router.push(`/steps/${stepId}/fields`)}
              >
                Manage fields
              </Button>
              <Button
                onClick={() => router.push(`/steps/${stepId}/fields/new`)}
              >
                New field
              </Button>
            </div>
          </div>
          <ol className="space-y-2">
            {orderedFields.map((f) => (
              <li
                key={f._id}
                className="flex items-center justify-between rounded-md bg-neutral-900/60 px-3 py-2 ring-1 ring-white/10"
              >
                <div>
                  <div className="text-sm">{f.label ?? f.key}</div>
                  <div className="text-xs text-neutral-400">
                    {f.type} · row {f.row_index ?? 1} col {f.col_index ?? 1}{" "}
                    span {f.col_span ?? 1}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => router.push(`/fields/${f._id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (confirm("Delete this field?")) {
                        removeField.mutate(f._id);
                      }
                    }}
                    disabled={removeField.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
            {(!orderedFields || orderedFields.length === 0) && (
              <li className="text-sm text-neutral-400">No fields yet.</li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}
