import Image from "next/image";
import { notFound } from "next/navigation";
import { recordArticleView } from "@/lib/analytics";

import { getArticleBySlug } from "@/lib/articles";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await getArticleBySlug(slug);

  if (!article || !article.published) {
    notFound();
  }
  await recordArticleView(article.id);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative h-[500px] w-full">
        <Image
          src={article.image}
          alt={article.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute bottom-0 left-0 p-10">
          <p className="tracking-widest text-yellow-500">
            {article.category}
          </p>

          <h1 className="mt-4 max-w-4xl font-serif text-5xl md:text-6xl">
            {article.title}
          </h1>
        </div>
      </div>

      <article className="mx-auto max-w-4xl p-8">
        <div className="flex flex-wrap gap-4 text-gray-400">
          <p>
            {article.createdAt.toLocaleDateString("fr-FR")}
          </p>

          <p>• Par {article.author}</p>
        </div>

        <p className="mt-4 text-sm tracking-widest text-yellow-500">
          TEMPS DE LECTURE : {article.readingTime}
        </p>

        <p className="mt-8 text-xl leading-relaxed text-gray-200">
          {article.description}
        </p>

        <div className="mt-10 whitespace-pre-line text-lg leading-relaxed text-gray-300">
          {article.content}
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6">
          <p className="text-gray-400">
            Article signé
          </p>

          <p className="mt-2 text-xl text-yellow-500">
            {article.author}
          </p>
        </div>
      </article>
    </main>
  );
}