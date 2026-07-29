import type { ComponentProps } from "react";

import EditorialSlot from "@/components/editorial/EditorialSlot";
import EditorialSocialCard from "@/components/editorial/EditorialSocialCard";
import {
  EDITORIAL_ZONES,
  EDITORIAL_ZONE_CONFIG,
} from "@/lib/editorial/zones";

type EditorialSlotProps = ComponentProps<typeof EditorialSlot>;
type EditorialArticle = EditorialSlotProps["article"];
type PublishedArticles = EditorialSlotProps["articles"];

type EditorialLayoutProps = {
  hero: EditorialArticle;
  feature: EditorialArticle;
  question: EditorialArticle;
  secondary: EditorialArticle[];
  goodToKnow: EditorialArticle[];
  briefs: EditorialArticle[];
  bottom: EditorialArticle;
  publishedArticles: PublishedArticles;
  facebookCount: number;
  whatsappCount: number;
  scheduledCount: number;
};

export default function EditorialLayout({
  hero,
  feature,
  question,
  secondary,
  goodToKnow,
  briefs,
  bottom,
  publishedArticles,
  facebookCount,
  whatsappCount,
  scheduledCount,
}: EditorialLayoutProps) {
  return (
    <>
      {/* COMPOSITION DU JOURNAL */}

      <section className="mt-7 grid gap-7 lg:grid-cols-3">
        {/* PARTIE PRINCIPALE */}

        <div className="space-y-7 lg:col-span-2">
          {/* UNE PRINCIPALE */}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
                  Zone prioritaire
                </p>

                <h3 className="mt-1 font-serif text-2xl">
                  Une principale
                </h3>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                ACTIF
              </span>
            </div>

            <EditorialSlot
              title={
                EDITORIAL_ZONE_CONFIG.hero.title ??
                "⭐ Une principale"
              }
              article={hero}
              editionKey="home"
              zone={EDITORIAL_ZONES.HERO}
              articles={publishedArticles}
            />
          </div>

          {/* GRANDE CARTE */}

          <div>
            <div className="mb-3">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
                Zone centrale
              </p>

              <h3 className="mt-1 font-serif text-2xl">
                Grande carte
              </h3>
            </div>

            <EditorialSlot
              title={
                EDITORIAL_ZONE_CONFIG.feature.title ??
                "🟨 Grande carte"
              }
              article={feature}
              editionKey="home"
              zone={EDITORIAL_ZONES.MAIN}
              articles={publishedArticles}
            />
          </div>

          {/* BRÈVES */}

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
                  Lecture rapide
                </p>

                <h3 className="mt-1 font-serif text-2xl">
                  Brèves
                </h3>
              </div>

              <span className="text-sm text-gray-500">
                {briefs.filter(Boolean).length}/
                {EDITORIAL_ZONE_CONFIG.brief.slots} occupées
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {Array.from({
                length: EDITORIAL_ZONE_CONFIG.brief.slots,
              }).map((_, index) => (
                <EditorialSlot
                  key={`brief-${index}`}
                  title={`${
                    EDITORIAL_ZONE_CONFIG.brief.title ?? "Brève"
                  } ${index + 1}`}
                  article={briefs[index] ?? null}
                  editionKey="home"
                  zone={EDITORIAL_ZONES.BRIEF}
                  compact={EDITORIAL_ZONE_CONFIG.brief.compact}
                  articles={publishedArticles}
                />
              ))}
            </div>
          </section>
        </div>

        {/* COLONNE DROITE */}

        <aside className="space-y-7">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="border-b border-gray-200 pb-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
                Zone verticale
              </p>

              <div className="mt-1 flex items-center justify-between">
                <h3 className="font-serif text-2xl">
                  Zones éditoriales
                </h3>
              </div>
            </div>

            <div className="mt-6 space-y-8">
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-yellow-700">
                  🎙 Question à…
                </h4>

                <EditorialSlot
                  title={
                    EDITORIAL_ZONE_CONFIG.question.title ??
                    "Question à…"
                  }
                  article={question}
                  editionKey="home"
                  zone={EDITORIAL_ZONES.QUESTION}
                  compact={EDITORIAL_ZONE_CONFIG.question.compact}
                  articles={publishedArticles}
                />
              </div>

              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-yellow-700">
                  ⭐ Sélection
                </h4>

                <div className="space-y-4">
                  {Array.from({
                    length:
                      EDITORIAL_ZONE_CONFIG.secondary.slots,
                  }).map((_, index) => (
                    <EditorialSlot
                      key={`selection-${index}`}
                      title={`${
                        EDITORIAL_ZONE_CONFIG.secondary.title ??
                        "Sélection"
                      } ${index + 1}`}
                      article={secondary[index] ?? null}
                      editionKey="home"
                      zone={EDITORIAL_ZONES.SECONDARY}
                      compact={
                        EDITORIAL_ZONE_CONFIG.secondary.compact
                      }
                      articles={publishedArticles}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-yellow-700">
                  💡 Bon à savoir
                </h4>

                <div className="space-y-4">
                  {Array.from({
                    length:
                      EDITORIAL_ZONE_CONFIG["good-to-know"].slots,
                  }).map((_, index) => (
                    <EditorialSlot
                      key={`gtk-${index}`}
                      title={`${
                        EDITORIAL_ZONE_CONFIG["good-to-know"]
                          .title ?? "Bon à savoir"
                      } ${index + 1}`}
                      article={goodToKnow[index] ?? null}
                      editionKey="home"
                      zone={EDITORIAL_ZONES.GOOD_TO_KNOW}
                      compact={
                        EDITORIAL_ZONE_CONFIG["good-to-know"]
                          .compact
                      }
                      articles={publishedArticles}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ACTIVITÉ SOCIALE */}

          <EditorialSocialCard
            facebookCount={facebookCount}
            whatsappCount={whatsappCount}
            scheduledCount={scheduledCount}
          />
        </aside>
      </section>

      {/* PIED DE PAGE ÉDITORIAL */}

      <section className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-col gap-3 border-b border-gray-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
              Dernière mise en avant
            </p>

            <h3 className="mt-1 font-serif text-2xl">
              Carte de bas de page
            </h3>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            CYCLE ÉDITORIAL
          </span>
        </div>

        <div className="mx-auto max-w-4xl">
          <EditorialSlot
            title={
              EDITORIAL_ZONE_CONFIG["grand-format"].title ??
              "📍 Bas de page"
            }
            article={bottom}
            editionKey="home"
            zone={EDITORIAL_ZONES.GRAND_FORMAT}
            articles={publishedArticles}
          />
        </div>
      </section>
    </>
  );
}