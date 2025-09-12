"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVersion, updateVersion, type Version } from "@/lib/api/versions";
import { TextInput as Input } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export default function VersionSettingsPage() {
  const { versionId } = useParams<{ versionId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<Version | undefined>({
    queryKey: ["version", versionId],
    queryFn: () => getVersion(versionId),
  });

  const save = useMutation({
    mutationFn: async (updates: Partial<Version>) =>
      updateVersion(versionId, {
        label: updates.label,
        traffic_weight: updates.traffic_weight,
        is_default: updates.is_default,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["version", versionId] });
      router.refresh();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">Version</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Version name</span>
            <Input
              defaultValue={data.label}
              onBlur={(e) => save.mutate({ label: e.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Traffic weight</span>
            <Input
              type="number"
              min={0}
              max={100}
              defaultValue={data.traffic_weight}
              onBlur={(e) =>
                save.mutate({ traffic_weight: Number(e.target.value) })
              }
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-300 md:col-span-2">
            <input
              type="checkbox"
              defaultChecked={data.is_default}
              onChange={(e) => save.mutate({ is_default: e.target.checked })}
            />
            Default
          </label>
        </div>
      </div>
      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10 text-xs text-neutral-400">
        <div>Version ID</div>
        <div className="text-neutral-300">{data._id}</div>
      </div>
    </div>
  );
}
