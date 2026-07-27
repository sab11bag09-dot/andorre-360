import {
  parseContent,
} from "@/components/admin/article-v5/content";
import SafeImage from "@/components/SafeImage";

type Props = {
  content: string;
};

export default function ArticleRenderer({
  content,
}: Props) {
  const document = parseContent(content);

  if (document.blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-7">
      {document.blocks.map((block) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={block.id}
                className="whitespace-pre-line text-lg leading-relaxed text-gray-300"
              >
                {block.text}
              </p>
            );

          case "heading":
            if (block.level === 3) {
              return (
                <h3
                  key={block.id}
                  className="pt-3 font-serif text-2xl font-semibold text-white"
                >
                  {block.text}
                </h3>
              );
            }

            return (
              <h2
                key={block.id}
                className="pt-5 font-serif text-3xl font-semibold text-white"
              >
                {block.text}
              </h2>
            );

          case "quote":
            return (
              <blockquote
                key={block.id}
                className="border-l-4 border-yellow-500 bg-zinc-950 px-6 py-5"
              >
                <p className="font-serif text-xl italic leading-relaxed text-gray-200">
                  {block.text}
                </p>

                {block.author && (
                  <footer className="mt-4 text-sm font-semibold text-yellow-500">
                    — {block.author}
                  </footer>
                )}
              </blockquote>
            );

          case "divider":
            return (
              <hr
                key={block.id}
                className="my-10 border-0 border-t border-gray-800"
              />
            );
case "image":
  if (!block.src.trim()) {
    return null;
  }

  return (
    <figure
      key={block.id}
      className="overflow-hidden rounded-2xl border border-gray-800 bg-zinc-950"
    >
      <div className="relative aspect-video w-full">
        <SafeImage
          src={block.src}
          alt={block.alt || block.caption || "Illustration de l’article"}
          fill
          sizes="(max-width: 896px) 100vw, 896px"
          className="object-cover"
        />
      </div>

      {(block.caption || block.credit) && (
        <figcaption className="space-y-1 border-t border-gray-800 px-5 py-4 text-sm text-gray-400">
          {block.caption && (
            <p className="text-gray-300">
              {block.caption}
            </p>
          )}

          {block.credit && (
            <p className="text-xs">
              Crédit : {block.credit}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
          default:
            return null;
        }
      })}
    </div>
  );
}