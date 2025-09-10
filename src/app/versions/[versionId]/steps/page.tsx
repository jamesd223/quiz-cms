"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listStepsByVersion,
  updateStep,
  deleteStep,
  type Step,
} from "@/lib/api/steps";
import { useMemo } from "react";
import { TextInput as Input } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export default function VersionStepsPage() {
  const { versionId } = useParams<{ versionId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<Step[]>({
    queryKey: ["steps", versionId],
    queryFn: () => listStepsByVersion(versionId),
  });
  const steps = useMemo(
    () => (data ?? []).slice().sort((a, b) => a.order_index - b.order_index),
    [data]
  );

  const patch = useMutation({
    mutationFn: async (payload: { id: string; updates: Partial<Step> }) =>
      updateStep(payload.id, payload.updates),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["steps", versionId] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => deleteStep(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["steps", versionId] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          {isLoading
            ? "Loading..."
            : isError
            ? "Failed to load"
            : `${steps.length} step(s)`}
        </div>
        <Button onClick={() => router.push(`/versions/${versionId}/steps/new`)}>
          New step
        </Button>
      </div>

      <div className="overflow-hidden rounded-md ring-1 ring-white/10">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/60 text-neutral-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Order</th>
              <th className="px-3 py-2 text-left font-medium">Title</th>
              <th className="px-3 py-2 text-left font-medium">Visible</th>
              <th className="px-3 py-2 text-left font-medium">Grid</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => (
              <tr key={s._id} className="border-t border-white/10">
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    defaultValue={s.order_index}
                    onBlur={(e) =>
                      patch.mutate({
                        id: s._id,
                        updates: { order_index: Number(e.target.value) },
                      })
                    }
                    className="w-24"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    defaultValue={s.title}
                    onBlur={(e) =>
                      patch.mutate({
                        id: s._id,
                        updates: { title: e.target.value },
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    defaultChecked={s.is_visible ?? true}
                    onChange={(e) =>
                      patch.mutate({
                        id: s._id,
                        updates: { is_visible: e.target.checked },
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue={s.grid_columns ?? 12}
                      min={1}
                      max={24}
                      onBlur={(e) =>
                        patch.mutate({
                          id: s._id,
                          updates: { grid_columns: Number(e.target.value) },
                        })
                      }
                      className="w-24"
                    />
                    <Input
                      type="number"
                      defaultValue={s.grid_gap_px ?? 8}
                      min={0}
                      max={64}
                      onBlur={(e) =>
                        patch.mutate({
                          id: s._id,
                          updates: { grid_gap_px: Number(e.target.value) },
                        })
                      }
                      className="w-24"
                    />
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => router.push(`/steps/${s._id}`)}
                    >
                      Edit
                    </Button>
                    <Button onClick={() => remove.mutate(s._id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
