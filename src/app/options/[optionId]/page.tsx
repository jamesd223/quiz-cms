"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOption, updateOption, type Option } from "@/lib/api/options";
import { TextInput as Input } from "@/components/ui/text-input";

export default function OptionDetailPage() {
  const { optionId } = useParams<{ optionId: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery<Option | undefined>({
    queryKey: ["option", optionId],
    queryFn: () => getOption(optionId),
  });

  const patch = useMutation({
    mutationFn: async (updates: Partial<Option>) =>
      updateOption(optionId, updates),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["option", optionId] });
      router.refresh();
    },
  });

  const mediaParam = search.get("media_id");
  if (
    mediaParam &&
    data &&
    data.icon_media_id !== mediaParam &&
    data.image_media_id !== mediaParam
  ) {
    patch.mutate({ icon_media_id: mediaParam });
  }

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Not found</div>;

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">Option</h2>
        <div className="grid grid-cols-1 gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Label</span>
            <Input
              defaultValue={data.label ?? ""}
              onBlur={(e) => patch.mutate({ label: e.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Value</span>
            <Input
              defaultValue={data.value}
              onBlur={(e) => patch.mutate({ value: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Icon media ID</span>
              <Input
                defaultValue={data.icon_media_id ?? ""}
                onBlur={(e) => patch.mutate({ icon_media_id: e.target.value })}
              />
              <div>
                <button
                  className="mt-2 rounded-md bg-neutral-800 px-3 py-2 text-xs text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-700"
                  onClick={() =>
                    router.push(
                      `/media?next=${encodeURIComponent(
                        `/options/${optionId}`
                      )}`
                    )
                  }
                >
                  Attach icon
                </button>
              </div>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-neutral-300">Image media ID</span>
              <Input
                defaultValue={data.image_media_id ?? ""}
                onBlur={(e) => patch.mutate({ image_media_id: e.target.value })}
              />
              <div>
                <button
                  className="mt-2 rounded-md bg-neutral-800 px-3 py-2 text-xs text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-700"
                  onClick={() =>
                    router.push(
                      `/media?next=${encodeURIComponent(
                        `/options/${optionId}`
                      )}`
                    )
                  }
                >
                  Attach image
                </button>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
