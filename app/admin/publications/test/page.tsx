import { replacePublication } from "@/actions/publications";
import { prisma } from "@/lib/prisma";

export default async function PublicationTestPage() {
  const articles = await prisma.article.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      category: true,
    },
  });

  async function testReplacePublication(formData: FormData) {
    "use server";

    const articleId = Number(formData.get("articleId"));
    const zone = String(formData.get("zone"));

    await replacePublication({
      articleId,
      pageKey: "home",
      zone: zone as
        | "hero"
        | "main"
        | "secondary"
        | "column"
        | "brief"
        | "bottom"
        | "standard",
      channel: "site",
      priority: 20,
    });
  }

  return (
    <main className="mx-auto max-w-4xl p-10">
      <h1 className="text-4xl font-bold">
        Test du moteur éditorial
      </h1>

      <p className="mt-3 text-gray-600">
        Choisis un article et une zone pour vérifier le moteur Remplacer.
      </p>

      <form
        action={testReplacePublication}
        className="mt-8 space-y-6 rounded-xl border bg-white p-8 shadow"
      >
        <div>
          <label
            htmlFor="articleId"
            className="mb-2 block font-semibold"
          >
            Article
          </label>

          <select
            id="articleId"
            name="articleId"
            className="w-full rounded-lg border px-4 py-3"
            required
          >
            <option value="">
              Choisir un article
            </option>

            {articles.map((article) => (
              <option
                key={article.id}
                value={article.id}
              >
                {article.category} — {article.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="zone"
            className="mb-2 block font-semibold"
          >
            Zone éditoriale
          </label>

          <select
            id="zone"
            name="zone"
            className="w-full rounded-lg border px-4 py-3"
            required
          >
            <option value="hero">
              Une principale
            </option>

            <option value="main">
              Grande carte
            </option>

            <option value="column">
              Colonne de droite
            </option>

            <option value="brief">
              Brève
            </option>

            <option value="bottom">
              Bas de page
            </option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-yellow-600"
        >
          Tester le remplacement
        </button>
      </form>
    </main>
  );
}