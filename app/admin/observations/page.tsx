import { prisma } from "@/lib/prisma";

import {
  createArticleFromObservationAction,
  deleteAiDraftFromObservationAction,
  regenerateArticleFromObservationAction,
  deleteAllDraftArticlesAction,
} from "./actions";

export default async function ObservationsPage() {
  const observations = await prisma.observation.findMany({
    where: {
      OR: [
        { processed: false },
        { id: 1105, processed: true, articleId: 263 },
        { article: { editorialStatus: "AI_DRAFT" } },
      ],
    },
    include: {
      source: true,
      article: {
        select: {
          id: true,
          published: true,
          editorialStatus: true,
        },
      },
    },
    orderBy: [
      {
        publishedAt: "desc",
      },
      {
        collectedAt: "desc",
      },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">
          Observations à traiter
        </h1>

        <form action={deleteAllDraftArticlesAction}>
          <button
            type="submit"
            className="rounded bg-red-700 px-3 py-2 text-sm font-semibold text-white"
          >
            Supprimer tous les brouillons
          </button>
        </form>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2 text-left">Titre</th>
            <th className="border p-2 text-left">Source</th>
            <th className="border p-2 text-left">Date</th>
            <th className="border p-2 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {observations.map((observation) => (
            <tr key={observation.id}>
              <td className="border p-2">
                {observation.title}
              </td>

              <td className="border p-2">
                {observation.source.name}
              </td>

              <td className="border p-2">
                {observation.publishedAt?.toLocaleDateString() ?? "-"}
              </td>

              <td className="border p-2 text-center">
                <div className="flex flex-wrap justify-center gap-2">
                <form
                  action={async () => {
                    "use server";
                    if (observation.id === 1105) {
                      await regenerateArticleFromObservationAction(
                        observation.id,
                      );
                    } else {
                      await createArticleFromObservationAction(
                        observation.id,
                      );
                    }
                  }}
                >
                  <button
                    className="rounded bg-blue-600 px-3 py-2 text-white"
                  >
                    {observation.id === 1105
                      ? "Régénérer l’article 263"
                      : "Créer un brouillon"}
                  </button>
                </form>
                {observation.article?.editorialStatus === "AI_DRAFT" && (
                  <form
                    action={async () => {
                      "use server";
                      await deleteAiDraftFromObservationAction(
                        observation.id,
                      );
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded bg-red-600 px-3 py-2 text-white"
                      formAction={async () => {
                        "use server";
                        await deleteAiDraftFromObservationAction(
                          observation.id,
                        );
                      }}
                    >
                      Supprimer le brouillon
                    </button>
                  </form>
                )}
                </div>
              </td>
            </tr>
          ))}

          {observations.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="border p-4 text-center"
              >
                Aucune observation à traiter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}