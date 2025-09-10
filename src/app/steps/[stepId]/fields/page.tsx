"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listFieldsByStep,
  updateField,
  deleteField,
  type Field,
} from "@/lib/api/fields";
import { getStep, type Step } from "@/lib/api/steps";
import { TextInput as Input } from "@/components/ui/text-input";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function StepFieldsPage() {
  const { stepId } = useParams<{ stepId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: step } = useQuery<Step | undefined>({
    queryKey: ["step", stepId],
    queryFn: () => getStep(stepId),
  });
  const { data, isLoading, isError } = useQuery<Field[]>({
    queryKey: ["fields", stepId],
    queryFn: () => listFieldsByStep(stepId),
  });
  const fields = useMemo(
    () => (data ?? []).slice().sort((a, b) => a.order_index - b.order_index),
    [data]
  );

  const patch = useMutation({
    mutationFn: async (payload: { id: string; updates: Partial<Field> }) =>
      updateField(payload.id, payload.updates),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["fields", stepId] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => deleteField(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["fields", stepId] });
    },
  });

  const gridColumns = step?.grid_columns ?? 12;
  const wouldConflict = (
    list: Field[],
    updated: Field,
    columns: number
  ): boolean => {
    type CellKey = string;
    const occupied = new Map<CellKey, string>();
    const place = (f: Field) => {
      const startRow = Math.max(1, f.row_index ?? 1);
      const startCol = Math.max(1, Math.min(columns, f.col_index ?? 1));
      const endRow = startRow + Math.max(1, f.row_span ?? 1) - 1;
      const endCol = Math.max(
        1,
        Math.min(columns, startCol + Math.max(1, f.col_span ?? 1) - 1)
      );
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const key = `${r}:${c}`;
          const existing = occupied.get(key);
          if (existing && existing !== f._id) return true;
          occupied.set(key, f._id);
        }
      }
      return false;
    };
    for (const f of list) {
      if (f._id === updated._id) {
        if (place(updated)) return true;
      } else {
        if (place(f)) return true;
      }
    }
    return false;
  };

  const safeUpdate = (f: Field, updates: Partial<Field>) => {
    // Enforce unique key within version
    if (updates.key) {
      const dup = fields.find(
        (other) => other._id !== f._id && other.key === updates.key
      );
      if (dup) {
        alert(
          `Duplicate key: "${updates.key}" already exists on another field.`
        );
        return;
      }
    }
    // Collision guard
    const candidate: Field = { ...f, ...updates } as Field;
    if (wouldConflict(fields, candidate, gridColumns)) {
      alert("Grid collision detected. Adjust row/col/span.");
      return;
    }
    patch.mutate({ id: f._id, updates });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          {isLoading
            ? "Loading..."
            : isError
            ? "Failed to load"
            : `${fields.length} field(s)`}
        </div>
        <Button onClick={() => router.push(`/steps/${stepId}/fields/new`)}>
          New field
        </Button>
      </div>

      <div className="overflow-hidden rounded-md ring-1 ring-white/10">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/60 text-neutral-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Order</th>
              <th className="px-3 py-2 text-left font-medium">Key</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Visible</th>
              <th className="px-3 py-2 text-left font-medium">Row/Col/Span</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f._id} className="border-t border-white/10">
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    defaultValue={f.order_index}
                    onBlur={(e) =>
                      safeUpdate(f, { order_index: Number(e.target.value) })
                    }
                    className="w-24"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    defaultValue={f.key}
                    onBlur={(e) => safeUpdate(f, { key: e.target.value })}
                  />
                </td>
                <td className="px-3 py-2 text-neutral-400">{f.type}</td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    defaultChecked={f.is_visible ?? true}
                    onChange={(e) =>
                      safeUpdate(f, { is_visible: e.target.checked })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue={f.row_index ?? 1}
                      min={1}
                      onBlur={(e) =>
                        safeUpdate(f, { row_index: Number(e.target.value) })
                      }
                      className="w-20"
                    />
                    <Input
                      type="number"
                      defaultValue={f.col_index ?? 1}
                      min={1}
                      onBlur={(e) =>
                        safeUpdate(f, { col_index: Number(e.target.value) })
                      }
                      className="w-20"
                    />
                    <Input
                      type="number"
                      defaultValue={f.col_span ?? 1}
                      min={1}
                      onBlur={(e) =>
                        safeUpdate(f, { col_span: Number(e.target.value) })
                      }
                      className="w-20"
                    />
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => router.push(`/fields/${f._id}`)}
                    >
                      Edit
                    </Button>
                    <Button onClick={() => remove.mutate(f._id)}>Delete</Button>
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
