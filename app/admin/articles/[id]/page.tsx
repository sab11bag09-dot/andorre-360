import { notFound } from "next/navigation";
import EditorialWorkflowPanel from "@/components/admin/article/EditorialWorkflowPanel";

import ArticleEditor from "@/components/admin/article-v4/ArticleEditor";
import { mapArticleToDraft } from "@/components/admin/article-v4/mapArticleToDraft";
import { prisma } from "@/lib/prisma";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articleId = Number(id);

  if (!Number.isInteger(articleId)) {
    notFound();
  }

  const article = await prisma.article.findUnique({
    where: {
      id: articleId,
    },
    include: {
      publications: {
        where: {
          active: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!article) {
    notFound();
  }

  const activePublication =
    article.publications[0] ?? null;

  const draft = mapArticleToDraft(
    article,
    activePublication
  );

  return (
    <main className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <EditorialWorkflowPanel
  articleId={article.id}
  status={article.editorialStatus}
/>
      <ArticleEditor
  key={`${article.id}-${article.editorialStatus}`}
  mode="update"
  initialValues={draft}
/>
    </main>
  );
}