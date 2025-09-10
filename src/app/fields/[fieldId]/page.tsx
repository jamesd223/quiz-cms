"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getField, updateField, type Field } from "@/lib/api/fields";
import { Button } from "@/components/ui/button";
import { TextInput as Input } from "@/components/ui/text-input";

export default function FieldDetailPage() {
  const { fieldId } = useParams<{ fieldId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<Field | undefined>({
    queryKey: ["field", fieldId],
    queryFn: () => getField(fieldId),
  });

  const patch = useMutation({
    mutationFn: async (updates: Partial<Field>) =>
      updateField(fieldId, updates),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["field", fieldId] });
      router.refresh();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Not found</div>;

  const isChoice =
    data.type === "choice_single" || data.type === "choice_multi";
  const isGroup = data.type === "group";

  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">Field</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Key</span>
            <Input
              defaultValue={data.key}
              onBlur={(e) => patch.mutate({ key: e.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Label</span>
            <Input
              defaultValue={data.label ?? ""}
              onBlur={(e) => patch.mutate({ label: e.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Placeholder</span>
            <Input
              defaultValue={data.placeholder ?? ""}
              onBlur={(e) => patch.mutate({ placeholder: e.target.value })}
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-300 md:col-span-2">
            <input
              type="checkbox"
              defaultChecked={data.required ?? false}
              onChange={(e) => patch.mutate({ required: e.target.checked })}
            />
            Required
          </label>
        </div>
      </div>

      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-200">Children</h2>
          {isChoice && (
            <Button onClick={() => router.push(`/fields/${fieldId}/options`)}>
              Manage options
            </Button>
          )}
          {isGroup && (
            <Button
              onClick={() => router.push(`/fields/${fieldId}/grouped-inputs`)}
            >
              Manage grouped inputs
            </Button>
          )}
        </div>
        {!isChoice && !isGroup && (
          <div className="text-sm text-neutral-400">
            This field has no children.
          </div>
        )}
      </div>

      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10 text-xs text-neutral-400">
        <div>Field ID</div>
        <div className="text-neutral-300">{data._id}</div>
        <div>Type</div>
        <div className="text-neutral-300">{data.type}</div>
      </div>
    </div>
  );
}
