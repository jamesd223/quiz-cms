import Link from "next/link";

export default async function QuizLayout({
  children,
  params,
}: LayoutProps<"/quizzes/[id]">) {
  const { id } = await params;
  const tabs = [
    { href: `/quizzes/${id}`, label: "Versions" },
    { href: `/quizzes/${id}/steps`, label: "Steps" },
    { href: `/quizzes/${id}/fields`, label: "Fields" },
    { href: `/quizzes/${id}/media`, label: "Media" },
  ];
  return (
    <div>
      <div className="sticky top-0 z-10 -mx-6 border-b border-white/10 bg-neutral-950/70 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-neutral-300">Quiz</div>
          <div className="flex items-center gap-1">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-md px-3 py-1.5 text-sm text-neutral-300 hover:bg-white/10"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}
