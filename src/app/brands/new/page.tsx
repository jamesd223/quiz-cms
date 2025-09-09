"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrand } from "@/lib/api/brands";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function NewBrandPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: async () => createBrand(name),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: ["brands"] });
      if (created?._id) router.replace(`/brands/${created._id}`);
      else router.replace("/brands");
    },
  });

  return (
    <div className="max-w-md rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
      <h2 className="mb-3 text-sm font-medium text-neutral-200">
        Create brand
      </h2>
      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
          placeholder="Brand name"
        />
        <Button
          onClick={() => mutation.mutate()}
          disabled={!name || mutation.isPending}
        >
          {mutation.isPending ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
}
