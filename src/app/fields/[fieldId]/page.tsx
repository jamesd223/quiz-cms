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
    <div className="max-w-6xl mx-auto space-y-6">
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
            <span className="text-neutral-300">Type</span>
            <select
              defaultValue={data.type}
              onChange={(e) =>
                patch.mutate({ type: e.target.value as Field["type"] })
              }
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="input_text">input_text</option>
              <option value="input_number">input_number</option>
              <option value="input_email">input_email</option>
              <option value="input_phone">input_phone</option>
              <option value="date">date</option>
              <option value="slider">slider</option>
              <option value="choice_single">choice_single</option>
              <option value="choice_multi">choice_multi</option>
              <option value="group">group</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-300 md:col-span-2">
            <input
              type="checkbox"
              defaultChecked={data.required ?? false}
              onChange={(e) => patch.mutate({ required: e.target.checked })}
            />
            Required
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Row</span>
            <Input
              type="number"
              min={1}
              defaultValue={data.row_index ?? 1}
              onBlur={(e) =>
                patch.mutate({ row_index: Number(e.target.value) })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Col</span>
            <Input
              type="number"
              min={1}
              defaultValue={data.col_index ?? 1}
              onBlur={(e) =>
                patch.mutate({ col_index: Number(e.target.value) })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Col span</span>
            <Input
              type="number"
              min={1}
              defaultValue={data.col_span ?? 1}
              onBlur={(e) => patch.mutate({ col_span: Number(e.target.value) })}
            />
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
