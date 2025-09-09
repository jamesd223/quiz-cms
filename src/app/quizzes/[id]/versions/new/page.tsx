"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listVersionsByQuiz,
  createVersion,
  type Version,
} from "@/lib/api/versions";
import { useMemo, useState } from "react";
import { TextInput as Input } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export default function NewVersionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data } = useQuery<Version[]>({
    queryKey: ["versions", id],
    queryFn: () => listVersionsByQuiz(id),
  });
  const versions = useMemo(() => data ?? [], [data]);
  const currentSum = versions.reduce(
    (acc, v) => acc + (v.traffic_weight ?? 0),
    0
  );

  const [label, setLabel] = useState("");
  const [weight, setWeight] = useState<number>(Math.max(0, 100 - currentSum));
  const [isDefault, setIsDefault] = useState(false);

  const create = useMutation({
    mutationFn: async () =>
      createVersion({
        quiz_id: id,
        label,
        traffic_weight: weight,
        is_default: isDefault,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["versions", id] });
      router.replace(`/quizzes/${id}/versions`);
    },
  });

  const overLimit = currentSum + (weight || 0) > 100;

  return (
    <div className="max-w-md space-y-4">
      <div className="rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">
          New version
        </h2>
        <div className="space-y-3">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Label</span>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="v1"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Traffic weight</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            Set as default
          </label>
          {overLimit && (
            <div className="rounded-md bg-amber-950/40 p-2 text-xs text-amber-300 ring-1 ring-amber-400/30">
              Total weight would exceed 100%.
            </div>
          )}
          <Button
            onClick={() => create.mutate()}
            disabled={!label || overLimit || create.isPending}
          >
            {create.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
