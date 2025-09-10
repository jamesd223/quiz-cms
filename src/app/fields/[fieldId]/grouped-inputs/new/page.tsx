"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGroupedInput,
  type GroupedInput,
} from "@/lib/api/grouped-inputs";
import { useState } from "react";
import { TextInput as Input } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export default function NewGroupedInputPage() {
  const { fieldId } = useParams<{ fieldId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [key, setKey] = useState("");
  const [type, setType] = useState("input_text");
  const [row, setRow] = useState(1);
  const [col, setCol] = useState(1);
  const [colSpan, setColSpan] = useState(1);

  const create = useMutation({
    mutationFn: async () =>
      createGroupedInput({
        field_id: fieldId,
        order_index: 999,
        field_key: key,
        input_type: type,
        row_index: row,
        col_index: col,
        col_span: colSpan,
      } as unknown as Omit<GroupedInput, "_id">),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["grouped-inputs", fieldId] });
      router.replace(`/fields/${fieldId}/grouped-inputs`);
    },
  });

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">
          New grouped input
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Key</span>
            <Input value={key} onChange={(e) => setKey(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Type</span>
            <Input value={type} onChange={(e) => setType(e.target.value)} />
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
        <div className="mt-4">
          <Button
            onClick={() => create.mutate()}
            disabled={!key || create.isPending}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
