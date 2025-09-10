"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGroupedInput,
  updateGroupedInput,
  type GroupedInput,
} from "@/lib/api/grouped-inputs";
import { TextInput as Input } from "@/components/ui/text-input";

export default function GroupedInputDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<GroupedInput | undefined>({
    queryKey: ["grouped-input", id],
    queryFn: () => getGroupedInput(id),
  });

  const patch = useMutation({
    mutationFn: async (updates: Partial<GroupedInput>) =>
      updateGroupedInput(id, updates),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["grouped-input", id] });
      router.refresh();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Not found</div>;

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">
          Grouped input
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Key</span>
            <Input
              defaultValue={data.field_key}
              onBlur={(e) => patch.mutate({ field_key: e.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Type</span>
            <Input
              defaultValue={data.input_type}
              onBlur={(e) => patch.mutate({ input_type: e.target.value })}
            />
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
      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10 text-xs text-neutral-400">
        <div>ID</div>
        <div className="text-neutral-300">{data._id}</div>
      </div>
    </div>
  );
}
