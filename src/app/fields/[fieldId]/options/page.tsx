"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listOptionsByField,
  updateOption,
  deleteOption,
  type Option,
} from "@/lib/api/options";
import { TextInput as Input } from "@/components/ui/text-input";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function FieldOptionsPage() {
  const { fieldId } = useParams<{ fieldId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<Option[]>({
    queryKey: ["options", fieldId],
    queryFn: () => listOptionsByField(fieldId),
  });
  const options = useMemo(
    () => (data ?? []).slice().sort((a, b) => a.order_index - b.order_index),
    [data]
  );

  const patch = useMutation({
    mutationFn: async (payload: { id: string; updates: Partial<Option> }) =>
      updateOption(payload.id, payload.updates),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["options", fieldId] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => deleteOption(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["options", fieldId] });
    },
  });

  // New option is handled on the separate /options/new page

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          {isLoading
            ? "Loading..."
            : isError
            ? "Failed to load"
            : `${options.length} option(s)`}
        </div>
        <Button onClick={() => router.push(`/fields/${fieldId}/options/new`)}>
          New option
        </Button>
      </div>

      <div className="overflow-hidden rounded-md ring-1 ring-white/10">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/60 text-neutral-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Order</th>
              <th className="px-3 py-2 text-left font-medium">Label</th>
              <th className="px-3 py-2 text-left font-medium">Value</th>
              <th className="px-3 py-2 text-left font-medium">Visible</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {options.map((o) => (
              <tr key={o._id} className="border-t border-white/10">
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    defaultValue={o.order_index}
                    onBlur={(e) =>
                      patch.mutate({
                        id: o._id,
                        updates: { order_index: Number(e.target.value) },
                      })
                    }
                    className="w-24"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    defaultValue={o.label ?? ""}
                    onBlur={(e) =>
                      patch.mutate({
                        id: o._id,
                        updates: { label: e.target.value },
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    defaultValue={o.value}
                    onBlur={(e) =>
                      patch.mutate({
                        id: o._id,
                        updates: { value: e.target.value },
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    defaultChecked={o.is_visible ?? true}
                    onChange={(e) =>
                      patch.mutate({
                        id: o._id,
                        updates: { is_visible: e.target.checked },
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <Button onClick={() => remove.mutate(o._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
