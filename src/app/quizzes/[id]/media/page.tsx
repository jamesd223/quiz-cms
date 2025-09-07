"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type MediaItem = { id: string; url: string; name: string };

export default function MediaTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<{ items: MediaItem[] }>({
    queryKey: ["media"],
    queryFn: async () => {
      const res = await fetch("/api/media");
      if (!res.ok) throw new Error("Failed to load media");
      return res.json();
    },
  });

  const upload = useMutation({
    mutationFn: async (payload: { name: string; dataUrl: string }) => {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json() as Promise<MediaItem>;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["media"] }),
  });

  const [, setFileName] = useState<string>("");

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-sm font-medium text-neutral-300">Media</h2>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-neutral-800 px-3 py-2 text-sm text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-700">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setFileName(file.name);
              const reader = new FileReader();
              reader.onload = () => {
                upload.mutate({ name: file.name, dataUrl: String(reader.result) });
              };
              reader.readAsDataURL(file);
            }}
          />
          Upload image
        </label>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data?.items.map((m) => (
            <figure key={m.id} className="overflow-hidden rounded-md bg-neutral-900 ring-1 ring-white/10">
              <img src={m.url} alt={m.name} className="aspect-video w-full object-cover" />
              <figcaption className="flex items-center justify-between px-2 py-1 text-xs text-neutral-300">
                <span className="truncate">{m.name}</span>
                <button
                  className="rounded bg-neutral-800 px-2 py-0.5 hover:bg-neutral-700"
                  onClick={() => navigator.clipboard.writeText(m.url)}
                >
                  Copy URL
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}


