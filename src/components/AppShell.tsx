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
    pathname?.startsWith("/quizzes") ||
    pathname?.startsWith("/brands") ||
    pathname?.startsWith("/versions") ||
    pathname?.startsWith("/steps") ||
    pathname?.startsWith("/fields") ||
    pathname?.startsWith("/options") ||
    pathname?.startsWith("/media");

  if (!isAppSection) {
    return <>{children}</>;
  }

  const nav = [
    { href: "/quizzes", label: "Quizzes" },
    { href: "/brands", label: "Brands" },
    { href: "/media", label: "Media" },
  ];

  return (
    <ClientAuthGate>
      <div className="grid min-h-svh grid-cols-[248px_1fr]">
        <aside className="border-r border-white/10 bg-neutral-950/70 p-4 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
          <div className="mb-6 flex items-center justify-between text-[13px] font-semibold tracking-wide text-neutral-200">
            <span>Quiz CMS</span>
            <LogoutButton />
          </div>
          <nav className="divide-y divide-white/10 overflow-hidden rounded-md ring-1 ring-white/10">
            {nav.map((n) => {
              const isActive =
                pathname === n.href || pathname?.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={
                    "block px-3 py-2 text-sm transition-colors " +
                    (isActive
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "text-neutral-300 hover:bg-neutral-800/60")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="[&_.card]:glass-panel px-6 py-6">
          <div className="sticky top-0 z-10 -mx-6 mb-6 border-b border-white/10 bg-neutral-950/70 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
            <div className="flex items-center justify-between gap-4">
              <div className="text-[13px] tracking-wide text-neutral-300">
                {pathname?.startsWith("/brands")
                  ? "Brands"
                  : pathname?.startsWith("/media")
                  ? "Media"
                  : pathname?.startsWith("/versions")
                  ? "Versions"
                  : pathname?.startsWith("/steps")
                  ? "Steps"
                  : pathname?.startsWith("/fields")
                  ? "Fields"
                  : pathname?.startsWith("/options")
                  ? "Options"
                  : "Quizzes"}
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </ClientAuthGate>
  );
}
