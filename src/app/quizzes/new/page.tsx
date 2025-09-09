"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuiz } from "@/lib/api/quizzes";
import { listBrands, type Brand } from "@/lib/api/brands";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TextInput as Input } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export default function NewQuizPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: brands } = useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: () => listBrands(),
  });
  const [brandId, setBrandId] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [locale, setLocale] = useState("");
  const [progress, setProgress] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    "draft"
  );

  const create = useMutation({
    mutationFn: async () =>
      createQuiz({
        brand_id: brandId,
        slug,
        title,
        locale_default: locale || undefined,
        progress_style: progress || undefined,
        status,
      }),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: ["quizzes"] });
      if (created?._id) router.replace(`/quizzes/${created._id}`);
      else router.replace("/quizzes");
    },
  });

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">
          Create quiz
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Brand</span>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select brand</option>
              {(brands ?? []).map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Slug</span>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-quiz"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Title</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My quiz"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Default locale</span>
            <Input
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              placeholder="en-US"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Progress style</span>
            <Input
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              placeholder="bar | dots | none"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-300">Status</span>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "published" | "archived")
              }
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </label>
          <Button
            onClick={() => create.mutate()}
            disabled={!brandId || !slug || !title || create.isPending}
          >
            {create.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
