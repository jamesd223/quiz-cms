"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQuiz, listQuizzes } from "@/lib/api/quizzes";
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

  const availableLocales = [
    "",
    "en-US",
    "en-GB",
    "es-ES",
    "fr-FR",
    "de-DE",
    "pt-BR",
    "it-IT",
    "nl-NL",
    "ja-JP",
    "ko-KR",
    "zh-CN",
  ];

  const progressStyles = ["", "bar", "dots", "none"];

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
      if (created && typeof created === "object" && "_id" in created) {
        const id = (created as { _id?: string })._id;
        if (id) {
          router.replace(`/quizzes/${id}`);
          return;
        }
      } else {
        try {
          const all = await listQuizzes();
          const match = all.find(
            (q) => q.slug === slug && q.brand_id === brandId
          );
          if (match?._id) router.replace(`/quizzes/${match._id}`);
          else router.replace("/quizzes");
        } catch {
          router.replace("/quizzes");
        }
      }
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-xl bg-neutral-900/50 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <h2 className="mb-5 text-sm font-medium tracking-wide text-neutral-200">
          Create quiz
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <label className="space-y-1 text-sm md:col-span-12">
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
          <label className="space-y-1 text-sm md:col-span-8">
            <span className="text-neutral-300">Title</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My quiz"
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-4">
            <span className="text-neutral-300">Slug</span>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-quiz"
            />
          </label>
          <label className="space-y-1 text-sm md:col-span-4">
            <span className="text-neutral-300">Default locale</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            >
              {availableLocales.map((loc) => (
                <option key={loc || "none"} value={loc}>
                  {loc ? loc : "Select locale (optional)"}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-4">
            <span className="text-neutral-300">Progress style</span>
            <select
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
            >
              {progressStyles.map((ps) => (
                <option key={ps || "none"} value={ps}>
                  {ps ? ps : "Select progress style (optional)"}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm md:col-span-4">
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
          <div className="md:col-span-12 flex justify-end pt-2">
            <Button
              onClick={() => create.mutate()}
              disabled={!brandId || !slug || !title || create.isPending}
            >
              {create.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
