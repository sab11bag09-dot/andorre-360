import { notFound } from "next/navigation";

import ArticleEditor from "@/components/admin/article-v4/ArticleEditor";
import { mapArticleToDraft } from "@/components/admin/article-v4/mapArticleToDraft";
import EditorialHistoryPanel from "@/components/admin/article/EditorialHistoryPanel";
import EditorialWorkflowPanel from "@/components/admin/article/EditorialWorkflowPanel";
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

  const article =
    await prisma.article.findUnique({
      where: {
        id: articleId,
      },
      include: {
        publications: {
          orderBy: [
            {
              active: "desc",
            },
            {
              createdAt: "desc",
            },
          ],
          take: 1,
        },
        translations: {
          where: {
            locale: {
              in: ["CA", "ES"],
            },
          },
          select: {
            locale: true,
            status: true,
          },
        },
        editorialEvents: {
          orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
          ],
          take: 50,
          select: {
            id: true,
            action: true,
            translationId: true,
            actorEmail: true,
            fromStatus: true,
            toStatus: true,
            details: true,
            createdAt: true,
          },
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
    activePublication,
  );

  return (
    <main className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <EditorialWorkflowPanel
        articleId={article.id}
        status={article.editorialStatus}
        translations={article.translations}
      />

      <EditorialHistoryPanel events={article.editorialEvents} />

      <ArticleEditor
        key={`${article.id}-${article.editorialStatus}`}
        mode="update"
        initialValues={draft}
      />
    </main>
  );
}
