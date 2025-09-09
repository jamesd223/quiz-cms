"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ClientAuthGate from "@/components/ClientAuthGate";
import LogoutButton from "@/components/LogoutButton";

type AppShellProps = { children: ReactNode };

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAppSection =
    pathname?.startsWith("/quizzes") || pathname?.startsWith("/brands");

  if (!isAppSection) {
    return <>{children}</>;
  }

  const nav = [
    { href: "/quizzes", label: "Quizzes" },
    { href: "/brands", label: "Brands" },
  ];

  return (
    <ClientAuthGate>
      <div className="grid min-h-svh grid-cols-[240px_1fr]">
        <aside className="border-r border-white/10 bg-neutral-950/70 p-4 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
          <div className="mb-6 flex items-center justify-between text-sm font-semibold text-neutral-200">
            <span>Quiz CMS</span>
            <LogoutButton />
          </div>
          <nav className="space-y-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="block rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800/60"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="[&_.card]:glass-panel px-6 py-6">
          <div className="sticky top-0 z-10 -mx-6 mb-6 border-b border-white/10 bg-neutral-950/70 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-neutral-300">
                {pathname?.startsWith("/brands") ? "Brands" : "Quizzes"}
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </ClientAuthGate>
  );
}
