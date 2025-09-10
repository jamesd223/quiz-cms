"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { listMedia, type Media } from "@/lib/api/media";
import { useRouter, useSearchParams } from "next/navigation";

export default function MediaLibraryPage() {
  return (
    <Suspense fallback={<div />}>
      <MediaLibraryInner />
    </Suspense>
  );
}

function MediaLibraryInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const { data, isLoading, isError } = useQuery<Media[]>({
    queryKey: ["media"],
    queryFn: () => listMedia(),
  });
  const items = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          {isLoading
            ? "Loading..."
            : isError
            ? "Failed to load"
            : `${items.length} item(s)`}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((m) => (
          <div
            key={m._id}
            className="rounded-lg bg-neutral-900/50 p-2 ring-1 ring-white/10"
          >
            <div className="aspect-square overflow-hidden rounded-md bg-neutral-800">
              {/* Simple preview */}
              {m.type !== "icon" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt={m.alt ?? ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs text-neutral-400">
                  icon
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="truncate text-xs text-neutral-400">{m._id}</div>
              {typeof navigator !== "undefined" && (
                <button
                  className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-700"
                  onClick={() => navigator.clipboard.writeText(m._id)}
                >
                  Copy ID
                </button>
              )}
              {next && (
                <button
                  className="rounded-md bg-indigo-500 px-2 py-1 text-xs text-white hover:bg-indigo-400"
                  onClick={() =>
                    router.replace(
                      `${next}?media_id=${encodeURIComponent(m._id)}`
                    )
                  }
                >
                  Attach
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
