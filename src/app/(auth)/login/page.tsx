"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation<{ token: string }, Error, FormValues>({
    mutationFn: async (values) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      return (await res.json()) as { token: string };
    },
    onSuccess: (data) => {
      setToken(data.token);
      router.replace("/quizzes");
    },
  });

  return (
    <div className="min-h-svh grid place-items-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl bg-neutral-900/60 p-6 shadow-lg ring-1 ring-white/10">
        <h1 className="mb-6 text-xl font-semibold">Sign in</h1>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
        >
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Email</label>
            <input
              type="email"
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Password</label>
            <input
              type="password"
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              placeholder="Your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Signing in..." : "Sign in"}
          </button>
          {mutation.isError && (
            <p className="text-xs text-red-400">{mutation.error.message}</p>
          )}
        </form>
        <p className="mt-4 text-xs text-neutral-400">
          Demo: admin@example.com / password
        </p>
      </div>
    </div>
  );
}
