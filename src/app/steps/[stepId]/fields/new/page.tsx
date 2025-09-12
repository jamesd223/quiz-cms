"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createField, type Field } from "@/lib/api/fields";
import { useState } from "react";
import { TextInput as Input } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export default function NewFieldPage() {
  const { stepId } = useParams<{ stepId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<Field["type"]>("input_text");
  const [required, setRequired] = useState(false);
  const [row, setRow] = useState(1);
  const [col, setCol] = useState(1);
  const [colSpan, setColSpan] = useState(1);

  const create = useMutation({
    mutationFn: async () =>
      createField({
        step_id: stepId,
        order_index: 999,
        is_visible: true,
        key,
        label,
        type,
        required,
        row_index: row,
        col_index: col,
        col_span: colSpan,
      } as unknown as Omit<Field, "_id">),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["fields", stepId] });
      router.replace(`/steps/${stepId}/fields`);
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">New field</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Key</span>
            <Input value={key} onChange={(e) => setKey(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Label</span>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Field["type"])}
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
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            Required
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Row</span>
            <Input
              type="number"
              min={1}
              value={row}
              onChange={(e) => setRow(Number(e.target.value))}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Col</span>
            <Input
              type="number"
              min={1}
              value={col}
              onChange={(e) => setCol(Number(e.target.value))}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Col span</span>
            <Input
              type="number"
              min={1}
              value={colSpan}
              onChange={(e) => setColSpan(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => create.mutate()}
            disabled={!key || !label || create.isPending}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
