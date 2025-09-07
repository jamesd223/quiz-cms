import { ReactNode } from "react";
import Link from "next/link";
import ClientAuthGate from "@/components/ClientAuthGate";

export default function QuizzesRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const nav = [{ href: "/quizzes", label: "Quizzes" }];
  return (
    <ClientAuthGate>
      <div className="grid min-h-svh grid-cols-[240px_1fr]">
        <aside className="border-r border-white/10 bg-neutral-950/80 p-4">
          <div className="mb-6 text-sm font-semibold text-neutral-200">
            Quiz CMS
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
        <main>{children}</main>
      </div>
    </ClientAuthGate>
  );
}
