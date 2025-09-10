"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOption, type Option } from "@/lib/api/options";
import { useState } from "react";
import { TextInput as Input } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export default function NewOptionPage() {
  const { fieldId } = useParams<{ fieldId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  const create = useMutation({
    mutationFn: async () =>
      createOption({
        field_id: fieldId,
        order_index: 999,
        is_visible: true,
        label,
        value,
      } as unknown as Omit<Option, "_id">),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["options", fieldId] });
      router.replace(`/fields/${fieldId}/options`);
    },
  });

  return (
    <div className="max-w-md space-y-4">
      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">
          New option
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Label</span>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Value</span>
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
          </label>
        </div>
        <div className="mt-4">
          <Button
            onClick={() => create.mutate()}
            disabled={!label || !value || create.isPending}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
