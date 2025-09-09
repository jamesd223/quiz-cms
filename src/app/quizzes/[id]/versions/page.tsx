"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listVersionsByQuiz,
  createVersion,
  updateVersion,
  type Version,
} from "@/lib/api/versions";
import { Button } from "@/components/ui/button";
import { TextInput as Input } from "@/components/ui/text-input";

const sumWeights = (versions: Version[]) =>
  versions.reduce((acc, v) => acc + (v.traffic_weight ?? 0), 0);

export default function QuizVersionsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<Version[]>({
    queryKey: ["versions", id],
    queryFn: () => listVersionsByQuiz(id),
  });
  const versions = useMemo(() => data ?? [], [data]);
  const totalWeight = sumWeights(versions);
  const overLimit = totalWeight > 100;

  const [newLabel, setNewLabel] = useState("");
  const add = useMutation({
    mutationFn: async () => createVersion({ quiz_id: id, label: newLabel }),
    onSuccess: async () => {
      setNewLabel("");
      await qc.invalidateQueries({ queryKey: ["versions", id] });
    },
  });

  const update = useMutation({
    mutationFn: async (payload: { id: string; updates: Partial<Version> }) =>
      updateVersion(payload.id, {
        label: payload.updates.label,
        traffic_weight: payload.updates.traffic_weight,
        is_default: payload.updates.is_default,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["versions", id] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          {isLoading
            ? "Loading..."
            : isError
            ? "Failed to load"
            : `${versions.length} version(s), total weight ${totalWeight}%`}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g., v1)"
            className="h-9 w-48"
          />
          <Button
            onClick={() => add.mutate()}
            disabled={!newLabel || add.isPending}
          >
            Add
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push(`/quizzes/${id}/versions/new`)}
          >
            Advanced
          </Button>
        </div>
      </div>

      {overLimit && (
        <div className="rounded-md bg-amber-950/40 p-3 text-sm text-amber-300 ring-1 ring-amber-400/30">
          Total traffic_weight exceeds 100%. Adjust weights.
        </div>
      )}

      <div className="overflow-hidden rounded-md ring-1 ring-white/10">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/60 text-neutral-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Label</th>
              <th className="px-3 py-2 text-left font-medium">Weight</th>
              <th className="px-3 py-2 text-left font-medium">Default</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => (
              <tr key={v._id} className="border-t border-white/10">
                <td className="px-3 py-2">
                  <Input
                    defaultValue={v.label}
                    onBlur={(e) =>
                      update.mutate({
                        id: v._id,
                        updates: { label: e.target.value },
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    defaultValue={v.traffic_weight}
                    min={0}
                    max={100}
                    onBlur={(e) =>
                      update.mutate({
                        id: v._id,
                        updates: { traffic_weight: Number(e.target.value) },
                      })
                    }
                    className="w-24"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="radio"
                    name="default"
                    checked={v.is_default}
                    onChange={() =>
                      update.mutate({
                        id: v._id,
                        updates: { is_default: true },
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2 text-right text-xs text-neutral-400">
                  {v._id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
