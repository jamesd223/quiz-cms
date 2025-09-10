"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadMedia } from "@/lib/api/media";

export default function MediaUploadPage() {
  const qc = useQueryClient();
  const upload = useMutation({
    mutationFn: async (form: FormData) => uploadMedia(form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media"] });
    },
  });

  return (
    <div className="max-w-md space-y-4">
      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">Upload</h2>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget as HTMLFormElement);
            upload.mutate(form);
          }}
        >
          <input type="file" name="file" />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            {upload.isPending ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
