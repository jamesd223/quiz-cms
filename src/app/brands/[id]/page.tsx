"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listBrands, updateBrand, type Brand } from "@/lib/api/brands";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data } = useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: () => listBrands(),
  });
  const brand = useMemo(() => data?.find((b) => b._id === id), [data, id]);
  const [name, setName] = useState(brand?.name ?? "");

  const rename = useMutation({
    mutationFn: async () => updateBrand(id, { name }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["brands"] });
      router.refresh();
    },
  });

  if (!brand) return <div>Loading...</div>;

  return (
    <div className="max-w-lg space-y-4">
      <div className="rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">
          Rename brand
        </h2>
        <div className="space-y-3">
          <input
            defaultValue={brand.name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={() => rename.mutate()}
              disabled={!name || rename.isPending}
            >
              {rename.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-neutral-900/50 p-4 ring-1 ring-white/10">
        <div className="text-xs text-neutral-400">ID</div>
        <div className="text-sm">{brand._id}</div>
      </div>
    </div>
  );
}
