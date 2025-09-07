"use client";

import { useParams } from "next/navigation";
import { useQuiz } from "@/hooks/useQuiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function VersionsTab() {
  const params = useParams<{ id: string }>();
  const id = params.id as string;
  const { data, isLoading } = useQuiz(id);
  const qc = useQueryClient();

  const addVersion = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/quizzes/${id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to add version");
      return res.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["quiz", id] }),
  });

  type VersionUpdates = { name?: string; isDefault?: boolean; trafficWeight?: number };
  const updateVersion = useMutation({
    mutationFn: async (payload: { versionId: string; updates: VersionUpdates }) => {
      const res = await fetch(`/api/quizzes/${id}/versions/${payload.versionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.updates),
      });
      if (!res.ok) throw new Error("Failed to update version");
      return res.json();
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["quiz", id] }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{data.title}</h1>
          <p className="text-sm text-neutral-400">{data.brand} · {data.slug}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => addVersion.mutate(`v${(data.versions.length || 0) + 1}`)}
            className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Add version
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md ring-1 ring-white/10">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/60 text-neutral-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-left font-medium">Default</th>
              <th className="px-3 py-2 text-left font-medium">Traffic</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.versions.map((v) => (
              <tr key={v.id} className="border-t border-white/10">
                <td className="px-3 py-2">
                  <input
                    defaultValue={v.name}
                    onBlur={(e) =>
                      updateVersion.mutate({ versionId: v.id, updates: { name: e.target.value } })
                    }
                    className="rounded-md bg-neutral-900 px-2 py-1 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="radio"
                    name="defaultVersion"
                    checked={v.isDefault}
                    onChange={() =>
                      updateVersion.mutate({ versionId: v.id, updates: { isDefault: true } })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={v.trafficWeight}
                    onBlur={(e) =>
                      updateVersion.mutate({ versionId: v.id, updates: { trafficWeight: Number(e.target.value) } })
                    }
                    className="w-20 rounded-md bg-neutral-900 px-2 py-1 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-3 py-2 text-right text-xs text-neutral-400">{v.steps.length} steps</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


