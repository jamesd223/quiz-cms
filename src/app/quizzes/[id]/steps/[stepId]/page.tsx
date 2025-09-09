"use client";

import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { detectGridCollisions, type Step, type Field } from "@/types/quiz";

export default function StepEditorPage() {
  const params = useParams<{ id: string; stepId: string }>();
  const id = params.id as string;
  const stepId = params.stepId as string;
  const { data } = useQuiz(id);
  const version = useMemo(
    () => data?.versions.find((v) => v.isDefault) ?? data?.versions[0],
    [data]
  );
  const step = useMemo<Step | undefined>(
    () => version?.steps.find((s) => s.id === stepId),
    [version, stepId]
  );
  const qc = useQueryClient();

  const updateGrid = useMutation({
    mutationFn: async (payload: {
      gridColumns?: number;
      gridGapPx?: number;
    }) => {
      const res = await fetch(
        `/api/quizzes/${id}/versions/${version!.id}/steps/${stepId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to update grid");
      return res.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["quiz", id] }),
  });

  const [columns, setColumns] = useState(step?.gridColumns ?? 12);
  const [gap, setGap] = useState(step?.gridGapPx ?? 8);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  if (!step) return <div>Step not found</div>;

  const collisions = detectGridCollisions(
    step.fields as Field[],
    step.gridColumns
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div>
          <div className="text-sm font-medium text-neutral-200">
            Grid columns
          </div>
          <input
            type="number"
            min={1}
            max={24}
            value={columns}
            onChange={(e) => setColumns(Number(e.target.value))}
            onBlur={() => updateGrid.mutate({ gridColumns: columns })}
            className="w-24 rounded-md bg-neutral-900 px-2 py-1 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <div className="text-sm font-medium text-neutral-200">
            Grid gap (px)
          </div>
          <input
            type="number"
            min={0}
            max={64}
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
            onBlur={() => updateGrid.mutate({ gridGapPx: gap })}
            className="w-24 rounded-md bg-neutral-900 px-2 py-1 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {(warning || collisions.length > 0) && (
        <div className="rounded-md bg-amber-950/40 p-3 text-sm text-amber-300 ring-1 ring-amber-400/30">
          {warning ?? `${collisions.length} grid collision(s) detected.`}
        </div>
      )}

      <div className="rounded-xl bg-neutral-900/60 p-4 ring-1 ring-white/10">
        <div
          ref={gridRef}
          tabIndex={0}
          onKeyDown={(e) => {
            if (!selectedFieldId) return;
            const idx = step.fields.findIndex(
              (ff) => ff.id === selectedFieldId
            );
            if (idx < 0) return;
            const f = step.fields[idx];
            const next = { ...f, position: { ...f.position } } as Field;
            if (e.key === "ArrowLeft")
              next.position.col = Math.max(1, next.position.col - 1);
            if (e.key === "ArrowRight")
              next.position.col = Math.min(
                step.gridColumns,
                next.position.col + 1
              );
            if (e.key === "ArrowUp")
              next.position.row = Math.max(1, next.position.row - 1);
            if (e.key === "ArrowDown")
              next.position.row = Math.max(1, next.position.row + 1);
            const other = step.fields.filter((x) => x.id !== f.id);
            const hasCollision =
              detectGridCollisions([next, ...other], step.gridColumns).length >
              0;
            if (hasCollision) {
              setWarning("Move blocked: collision detected");
              return;
            }
            setWarning(null);
            void updateGrid.mutateAsync({}).then(async () => {
              await fetch(
                `/api/quizzes/${id}/versions/${
                  version!.id
                }/steps/${stepId}/fields/${f.id}`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ position: next.position }),
                }
              );
              void qc.invalidateQueries({ queryKey: ["quiz", id] });
            });
          }}
          className="grid outline-none"
          style={{
            gridTemplateColumns: `repeat(${step.gridColumns}, minmax(0, 1fr))`,
            gap: `${step.gridGapPx}px`,
          }}
        >
          {(step.fields as Field[]).map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedFieldId(f.id)}
              onPointerDown={() => {
                const onUp = async (up: PointerEvent) => {
                  window.removeEventListener("pointerup", onUp);
                  if (!gridRef.current) return;
                  const rect = gridRef.current.getBoundingClientRect();
                  const relX = up.clientX - rect.left;
                  const relY = up.clientY - rect.top;
                  const totalCols = step.gridColumns;
                  const gapPx = step.gridGapPx;
                  const colWidth =
                    (rect.width - gapPx * (totalCols - 1)) / totalCols;
                  const col = Math.max(
                    1,
                    Math.min(
                      totalCols,
                      Math.floor(relX / (colWidth + gapPx)) + 1
                    )
                  );
                  const row = Math.max(
                    1,
                    Math.floor(relY / (colWidth + gapPx)) + 1
                  );
                  const next = {
                    ...f,
                    position: {
                      ...f.position,
                      col,
                      row,
                    },
                  } as Field;
                  const other = step.fields.filter((x) => x.id !== f.id);
                  const hasCollision =
                    detectGridCollisions([next, ...other], step.gridColumns)
                      .length > 0;
                  if (hasCollision) {
                    setWarning("Drop blocked: collision detected");
                    return;
                  }
                  setWarning(null);
                  await fetch(
                    `/api/quizzes/${id}/versions/${
                      version!.id
                    }/steps/${stepId}/fields/${f.id}`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ position: next.position }),
                    }
                  );
                  void qc.invalidateQueries({ queryKey: ["quiz", id] });
                };
                window.addEventListener("pointerup", onUp, { once: true });
              }}
              className={`rounded-md p-2 ring-1 ring-white/10 ${
                selectedFieldId === f.id ? "bg-neutral-700" : "bg-neutral-800"
              }`}
              style={{
                gridColumn: `${f.position.col} / span ${f.position.colSpan}`,
                gridRow: `${f.position.row} / span ${f.position.rowSpan}`,
                cursor: "grab",
              }}
            >
              <div className="text-xs text-neutral-400">{f.type}</div>
              <div className="text-sm font-medium">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
