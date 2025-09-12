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
  const [newWeight, setNewWeight] = useState<number>(
    Math.max(0, 100 - totalWeight)
  );
  const [newDefault, setNewDefault] = useState(false);
  const add = useMutation({
    mutationFn: async () =>
      createVersion({
        quiz_id: id,
        label: newLabel,
        traffic_weight: newWeight,
        is_default: newDefault,
      }),
    onSuccess: async () => {
      setNewLabel("");
      setNewWeight(Math.max(0, 100 - totalWeight));
      setNewDefault(false);
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
    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-400">
            {isLoading
              ? "Loading..."
              : isError
              ? "Failed to load"
              : `${versions.length} version(s), total weight ${totalWeight}%`}
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
                <th className="px-3 py-2 text-left font-medium">
                  Version name
                </th>
                <th className="px-3 py-2 text-left font-medium">Weight</th>
                <th className="px-3 py-2 text-left font-medium">Default</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
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
                  <td className="px-3 py-2 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => router.push(`/versions/${v._id}`)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">
          Create version
        </h2>
        <div className="space-y-3">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Version name</span>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="v1"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Traffic weight</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={newWeight}
              onChange={(e) => setNewWeight(Number(e.target.value))}
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={newDefault}
              onChange={(e) => setNewDefault(e.target.checked)}
            />
            Set as default
          </label>
          <div className="flex justify-end">
            <Button
              onClick={() => add.mutate()}
              disabled={!newLabel || add.isPending}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
