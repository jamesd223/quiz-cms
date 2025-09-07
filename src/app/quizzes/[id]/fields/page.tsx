"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuiz } from "@/hooks/useQuiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Field, type ChoiceField, type GroupField, type GroupedInput, isChoiceField, isGroupField } from "@/types/quiz";

const palette: Array<{ type: Field["type"]; label: string }> = [
  { type: "input_text", label: "Text" },
  { type: "input_number", label: "Number" },
  { type: "input_email", label: "Email" },
  { type: "input_phone", label: "Phone" },
  { type: "input_date", label: "Date" },
  { type: "input_slider", label: "Slider" },
  { type: "choice_single", label: "Single choice" },
  { type: "choice_multi", label: "Multi choice" },
  { type: "group", label: "Group" },
];

export default function FieldsTab() {
  const params = useParams<{ id: string }>();
  const id = params.id as string;
  const { data } = useQuiz(id);
  const version = useMemo(() => data?.versions.find((v) => v.isDefault) ?? data?.versions[0], [data]);
  const step = version?.steps[0];
  const qc = useQueryClient();

  const addField = useMutation({
    mutationFn: async (t: Field["type"]) => {
      const res = await fetch(`/api/quizzes/${id}/versions/${version!.id}/steps/${step!.id}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: t }),
      });
      if (!res.ok) throw new Error("Failed to add field");
      return res.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["quiz", id] }),
  });

  const updateField = useMutation({
    mutationFn: async (payload: { fieldId: string; updates: Partial<Field> }) => {
      const res = await fetch(`/api/quizzes/${id}/versions/${version!.id}/steps/${step!.id}/fields/${payload.fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.updates),
      });
      if (!res.ok) throw new Error("Failed to update field");
      return res.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["quiz", id] }),
  });

  const delField = useMutation({
    mutationFn: async (fieldId: string) => {
      const res = await fetch(`/api/quizzes/${id}/versions/${version!.id}/steps/${step!.id}/fields/${fieldId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete field");
      return res.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["quiz", id] }),
  });

  const [editing, setEditing] = useState<Field | null>(null);
  const duplicateKey = useMemo(() => {
    if (!editing || !step || !version) return null;
    let occurrences = 0;
    for (const s of version.steps) {
      occurrences += s.fields.filter((f) => f.key === editing.key).length;
    }
    return occurrences > 1 ? editing.key : null;
  }, [editing, step, version]);

  if (!version || !step) return <div>No steps yet.</div>;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="rounded-xl bg-neutral-900/60 p-4 ring-1 ring-white/10">
        <h3 className="mb-3 text-sm font-medium text-neutral-200">Palette</h3>
        <div className="grid grid-cols-2 gap-2">
          {palette.map((p) => (
            <button
              key={p.type}
              onClick={() => addField.mutate(p.type)}
              className="rounded-md bg-neutral-800 px-2 py-2 text-xs text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      </aside>
      <div className="space-y-6">
        <div className="rounded-xl bg-neutral-900/60 p-4 ring-1 ring-white/10">
          <h3 className="mb-3 text-sm font-medium text-neutral-200">Fields</h3>
          <ul className="space-y-2">
            {step.fields.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-md bg-neutral-950/50 px-3 py-2 ring-1 ring-white/10">
                <div>
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-xs text-neutral-400">{f.type} · key: {f.key}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing(f)}
                    className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => delField.mutate(f.id)}
                    className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {editing && (
          <div className="rounded-xl bg-neutral-900/60 p-4 ring-1 ring-white/10">
            <h3 className="mb-3 text-sm font-medium text-neutral-200">Edit field</h3>
            {duplicateKey && (
              <div className="mb-3 rounded-md bg-amber-950/40 p-2 text-xs text-amber-300 ring-1 ring-amber-400/30">
                Duplicate field key: {duplicateKey}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Label</span>
                <input
                  defaultValue={editing.label}
                  onBlur={(e) => updateField.mutate({ fieldId: editing.id, updates: { label: e.target.value } })}
                  className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Key</span>
                <input
                  defaultValue={editing.key}
                  onBlur={(e) => updateField.mutate({ fieldId: editing.id, updates: { key: e.target.value } })}
                  className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Required</span>
                <input
                  type="checkbox"
                  defaultChecked={editing.required}
                  onChange={(e) => updateField.mutate({ fieldId: editing.id, updates: { required: e.target.checked } })}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Placeholder</span>
                <input
                  defaultValue={editing.placeholder}
                  onBlur={(e) => updateField.mutate({ fieldId: editing.id, updates: { placeholder: e.target.value } })}
                  className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>

            {isChoiceField(editing) && (
              <div className="mt-4">
                <div className="mb-2 text-sm font-medium text-neutral-200">Options</div>
                <OptionsEditor field={editing} onChange={(updates) => updateField.mutate({ fieldId: editing.id, updates })} />
              </div>
            )}

            {isGroupField(editing) && (
              <div className="mt-4">
                <div className="mb-2 text-sm font-medium text-neutral-200">Grouped inputs</div>
                <GroupedInputsEditor field={editing} onChange={(updates) => updateField.mutate({ fieldId: editing.id, updates })} />
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={() => setEditing(null)}
                className="rounded-md bg-neutral-800 px-3 py-2 text-sm text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OptionsEditor({ field, onChange }: { field: ChoiceField; onChange: (updates: Partial<ChoiceField>) => void }) {
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className="w-40 rounded-md bg-neutral-800 px-2 py-1 text-sm outline-none ring-1 ring-white/10" />
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="w-48 rounded-md bg-neutral-800 px-2 py-1 text-sm outline-none ring-1 ring-white/10" />
        <button
          onClick={() => {
            if (!value || !label) return;
            onChange({ options: [...field.options, { value, label }] });
            setValue("");
            setLabel("");
          }}
          className="rounded-md bg-indigo-500 px-2 py-1 text-xs text-white hover:bg-indigo-400"
        >
          Add
        </button>
      </div>
      <ul className="space-y-1">
        {field.options.map((opt, idx) => (
          <li key={`${opt.value}-${idx}`} className="flex items-center justify-between rounded-md bg-neutral-950/50 px-2 py-1 text-xs ring-1 ring-white/10">
            <span className="text-neutral-300">{opt.value} — {opt.label}</span>
            <button
              className="rounded bg-neutral-800 px-2 py-0.5 hover:bg-neutral-700"
              onClick={() => onChange({ options: field.options.filter((o, i) => i !== idx) })}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GroupedInputsEditor({ field, onChange }: { field: GroupField; onChange: (updates: Partial<GroupField>) => void }) {
  const [label, setLabel] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Child label" className="w-48 rounded-md bg-neutral-800 px-2 py-1 text-sm outline-none ring-1 ring-white/10" />
        <button
          onClick={() => {
            if (!label) return;
            const newChild: GroupedInput = { type: "input_text", key: `child_${Math.random().toString(36).slice(2,6)}`, label, required: false } as GroupedInput;
            onChange({ groupedInputs: [...field.groupedInputs, newChild] });
            setLabel("");
          }}
          className="rounded-md bg-indigo-500 px-2 py-1 text-xs text-white hover:bg-indigo-400"
        >
          Add child
        </button>
      </div>
      <ul className="space-y-1">
        {field.groupedInputs?.map((child: GroupedInput, idx: number) => (
          <li key={`${child.key}-${idx}`} className="flex items-center justify-between rounded-md bg-neutral-950/50 px-2 py-1 text-xs ring-1 ring-white/10">
            <span className="text-neutral-300">{child.label}</span>
            <button
              className="rounded bg-neutral-800 px-2 py-0.5 hover:bg-neutral-700"
              onClick={() => onChange({ groupedInputs: field.groupedInputs.filter((_, i) => i !== idx) })}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}


