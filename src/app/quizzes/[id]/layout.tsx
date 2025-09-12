export default async function QuizLayout({
  children,
  params,
}: LayoutProps<"/quizzes/[id]">) {
  const { id } = await params;
  return (
    <div>
      <div>{children}</div>
    </div>
  );
}
