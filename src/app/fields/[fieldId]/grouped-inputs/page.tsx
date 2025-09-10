"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listGroupedInputsByField,
  updateGroupedInput,
  deleteGroupedInput,
  type GroupedInput,
} from "@/lib/api/grouped-inputs";
import { TextInput as Input } from "@/components/ui/text-input";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function FieldGroupedInputsPage() {
  const { fieldId } = useParams<{ fieldId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<GroupedInput[]>({
    queryKey: ["grouped-inputs", fieldId],
    queryFn: () => listGroupedInputsByField(fieldId),
  });
  const rows = useMemo(
    () => (data ?? []).slice().sort((a, b) => a.order_index - b.order_index),
    [data]
  );

  const patch = useMutation({
    mutationFn: async (payload: {
      id: string;
      updates: Partial<GroupedInput>;
    }) => updateGroupedInput(payload.id, payload.updates),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["grouped-inputs", fieldId] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => deleteGroupedInput(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["grouped-inputs", fieldId] });
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
            : `${rows.length} input(s)`}
        </div>
        <Button
          onClick={() => router.push(`/fields/${fieldId}/grouped-inputs/new`)}
        >
          New input
        </Button>
      </div>

      <div className="overflow-hidden rounded-md ring-1 ring-white/10">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/60 text-neutral-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Order</th>
              <th className="px-3 py-2 text-left font-medium">Key</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Row/Col/Span</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((gi) => (
              <tr key={gi._id} className="border-t border-white/10">
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    defaultValue={gi.order_index}
                    onBlur={(e) =>
                      patch.mutate({
                        id: gi._id,
                        updates: { order_index: Number(e.target.value) },
                      })
                    }
                    className="w-24"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    defaultValue={gi.field_key}
                    onBlur={(e) =>
                      patch.mutate({
                        id: gi._id,
                        updates: { field_key: e.target.value },
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2 text-neutral-400">{gi.input_type}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue={gi.row_index ?? 1}
                      min={1}
                      onBlur={(e) =>
                        patch.mutate({
                          id: gi._id,
                          updates: { row_index: Number(e.target.value) },
                        })
                      }
                      className="w-20"
                    />
                    <Input
                      type="number"
                      defaultValue={gi.col_index ?? 1}
                      min={1}
                      onBlur={(e) =>
                        patch.mutate({
                          id: gi._id,
                          updates: { col_index: Number(e.target.value) },
                        })
                      }
                      className="w-20"
                    />
                    <Input
                      type="number"
                      defaultValue={gi.col_span ?? 1}
                      min={1}
                      onBlur={(e) =>
                        patch.mutate({
                          id: gi._id,
                          updates: { col_span: Number(e.target.value) },
                        })
                      }
                      className="w-20"
                    />
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <Button onClick={() => remove.mutate(gi._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
