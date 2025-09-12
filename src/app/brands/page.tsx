"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listBrands,
  createBrand,
  deleteBrand,
  type Brand,
} from "@/lib/api/brands";
// import Link from "next/link";
import { useMemo, useState } from "react";
import { TextInput as Input } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export default function BrandsListPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError } = useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: () => listBrands(),
  });
  const rows = useMemo(
    () =>
      (data ?? []).filter((b) =>
        b.name.toLowerCase().includes(query.toLowerCase())
      ),
    [data, query]
  );

  const qc = useQueryClient();
  const [newName, setNewName] = useState("");
  const create = useMutation({
    mutationFn: async () => createBrand(newName),
    onSuccess: async () => {
      setNewName("");
      await qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2 rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="text-sm text-neutral-400">
            {isLoading
              ? "Loading..."
              : isError
              ? "Failed to load"
              : `${rows.length} brand(s)`}
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brands..."
              className="h-9 w-64"
            />
          </div>
        </div>
        <div className="overflow-hidden rounded-md ring-1 ring-white/10">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/60 text-neutral-300">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr
                  key={b._id}
                  className="border-t border-white/10 hover:bg-neutral-900/50"
                >
                  <td className="px-3 py-2">{b.name}</td>
                  <td className="px-3 py-2 text-neutral-400">{b._id}</td>
                  <td className="px-3 py-2 text-right">
                    <InlineBrandEditor id={b._id} name={b.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-neutral-900/50 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-medium text-neutral-200">
          Create brand
        </h2>
        <div className="space-y-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Brand name"
          />
          <Button
            onClick={() => create.mutate()}
            disabled={!newName || create.isPending}
          >
            {create.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function InlineBrandEditor({ id, name }: { id: string; name: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const save = useMutation({
    mutationFn: async () =>
      fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001"
        }/v1/brands/${id}`,
        { method: "PATCH", body: JSON.stringify({ name: value }) }
      ),
    onSuccess: async () => {
      setEditing(false);
      await qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });
  const remove = useMutation({
    mutationFn: async () => deleteBrand(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  return editing ? (
    <div className="flex items-center justify-end gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8 w-48"
      />
      <Button onClick={() => save.mutate()} disabled={!value || save.isPending}>
        Save
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          setEditing(false);
          setValue(name);
        }}
      >
        Cancel
      </Button>
    </div>
  ) : (
    <div className="flex justify-end gap-2">
      <Button variant="secondary" onClick={() => setEditing(true)}>
        Edit
      </Button>
      <Button
        onClick={() => {
          if (confirm("Delete this brand?")) remove.mutate();
        }}
        disabled={remove.isPending}
      >
        Delete
      </Button>
    </div>
  );
}
