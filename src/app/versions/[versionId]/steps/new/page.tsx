"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStep, type Step } from "@/lib/api/steps";
import { useEffect, useState } from "react";
import { TextInput as Input } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export default function NewStepPage() {
  const { versionId } = useParams<{ versionId: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [footnote, setFootnote] = useState("");
  const [cta, setCta] = useState("");
  const [visible, setVisible] = useState(true);
  const [layout, setLayout] = useState("default");
  const [mediaId, setMediaId] = useState("");
  const [order, setOrder] = useState(999);
  const [cols, setCols] = useState(12);
  const [gap, setGap] = useState(8);

  const create = useMutation({
    mutationFn: async () =>
      createStep({
        quiz_version_id: versionId,
        order_index: order,
        title: title || undefined,
        description: description || undefined,
        footnote_text: footnote || undefined,
        cta_text: cta || undefined,
        is_visible: visible,
        layout,
        media_id: mediaId || undefined,
        grid_columns: cols,
        grid_gap_px: gap,
      } as Omit<Step, "_id">),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["steps", versionId] });
      router.replace(`/versions/${versionId}/steps`);
    },
  });

  useEffect(() => {
    const mediaParam = search.get("media_id");
    if (mediaParam && mediaId !== mediaParam) setMediaId(mediaParam);
  }, [search, mediaId]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">Meta</h2>
        <div className="grid grid-cols-1 gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Title</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Order</span>
            <Input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-32"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Description</span>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Footnote</span>
            <Input
              value={footnote}
              onChange={(e) => setFootnote(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">CTA</span>
            <Input value={cta} onChange={(e) => setCta(e.target.value)} />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
            />
            Visible
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Layout</span>
            <Input
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              placeholder="default | wide | narrow"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Media ID</span>
            <Input
              value={mediaId}
              onChange={(e) => setMediaId(e.target.value)}
            />
            <div>
              <Button
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() =>
                  router.push(
                    `/media?next=${encodeURIComponent(
                      `/versions/${versionId}/steps/new`
                    )}`
                  )
                }
              >
                Attach from library
              </Button>
            </div>
          </label>
        </div>
      </div>
      <div className="rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">Grid</h2>
        <div className="flex items-center gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Columns</span>
            <Input
              type="number"
              min={1}
              max={24}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-28"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Gap (px)</span>
            <Input
              type="number"
              min={0}
              max={64}
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-28"
            />
          </label>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => create.mutate()} disabled={create.isPending}>
          Create
        </Button>
      </div>
    </div>
  );
}
