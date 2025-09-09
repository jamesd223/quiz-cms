"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin } from "@/lib/api/auth";
import { getToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, go to quizzes
    const token = getToken();
    if (token) {
      router.replace("/quizzes");
    }
  }, [router]);

  return (
    <div className="min-h-svh grid place-items-center px-6 py-16">
      <div className="w-full max-w-sm rounded-xl bg-neutral-900/50 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
        <h1 className="mb-6 text-xl font-semibold">Sign in</h1>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget as HTMLFormElement);
            const email = String(form.get("email") ?? "");
            const password = String(form.get("password") ?? "");
            try {
              await apiLogin(email, password);
              router.replace("/quizzes");
            } catch (err) {
              console.error(err);
              alert("Sign-in failed. Check API availability.");
            }
          }}
        >
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Email</label>
            <input
              type="email"
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              placeholder="admin@yourdomain.com"
              defaultValue="admin@yourdomain.com"
              name="email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-neutral-300">Password</label>
            <input
              type="password"
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
              placeholder="Admin123!"
              defaultValue="Admin123!"
              name="password"
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
