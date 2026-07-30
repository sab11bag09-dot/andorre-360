import type { ComponentProps, ReactNode } from "react";

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

type CompositionSectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
  status?: ReactNode;
  children: ReactNode;
};

function CompositionSection({
  eyebrow,
  title,
  description,
  status,
  children,
}: CompositionSectionProps) {
  return (
    <section className="border-b border-gray-200 px-6 py-7 last:border-b-0 md:px-8">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-700">
            {eyebrow}
          </p>

          <h3 className="mt-1 font-serif text-2xl text-gray-950">
            {title}
          </h3>

          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              {description}
            </p>
          ) : null}
        </div>

        {status}
      </div>

      {children}
    </section>
  );
}

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
  const occupiedBriefs = briefs.filter(Boolean).length;

  return (
    <>
      {/* STUDIO DE COMPOSITION */}

      <div className="mt-7 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        {/* UNE PRINCIPALE */}

        <CompositionSection
          eyebrow="Décision prioritaire"
          title="Une principale"
          description="Le sujet qui porte l’édition et bénéficie de la visibilité maximale."
          status={
            <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              ACTIF
            </span>
          }
        >
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
        </CompositionSection>

        {/* GRANDE CARTE */}

        <CompositionSection
          eyebrow="Mise en avant"
          title="Grande carte"
          description="Le second sujet fort de l’édition, présenté après la Une principale."
        >
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
        </CompositionSection>

        {/* QUESTION À */}

        <CompositionSection
          eyebrow="Entretien"
          title="Question à…"
          description="Une personnalité, un témoin ou un acteur lié à l’actualité."
        >
          <div className="max-w-3xl">
            <EditorialSlot
              title={
                EDITORIAL_ZONE_CONFIG.question.title ??
                "Question à…"
              }
              article={question}
              editionKey="home"
              zone={EDITORIAL_ZONES.QUESTION}
              compact
              articles={publishedArticles}
            />
          </div>
        </CompositionSection>

        {/* SÉLECTION */}

        <CompositionSection
          eyebrow="Choix de la rédaction"
          title="Sélection"
          description="Des contenus complémentaires choisis pour prolonger la lecture."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({
              length: EDITORIAL_ZONE_CONFIG.secondary.slots,
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
                compact
                articles={publishedArticles}
              />
            ))}
          </div>
        </CompositionSection>

        {/* BRÈVES */}

        <CompositionSection
          eyebrow="Lecture rapide"
          title="Brèves"
          description="Trois informations courtes accessibles immédiatement."
          status={
            <span className="text-sm font-medium text-gray-500">
              {occupiedBriefs}/
              {EDITORIAL_ZONE_CONFIG.brief.slots} occupées
            </span>
          }
        >
          <div className="grid gap-4 lg:grid-cols-3">
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
                compact
                articles={publishedArticles}
              />
            ))}
          </div>
        </CompositionSection>

        {/* BON À SAVOIR */}

        <CompositionSection
          eyebrow="Informations utiles"
          title="Bon à savoir"
          description="Des informations pratiques, des repères et des contenus de service."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({
              length:
                EDITORIAL_ZONE_CONFIG["good-to-know"].slots,
            }).map((_, index) => (
              <EditorialSlot
                key={`good-to-know-${index}`}
                title={`${
                  EDITORIAL_ZONE_CONFIG["good-to-know"].title ??
                  "Bon à savoir"
                } ${index + 1}`}
                article={goodToKnow[index] ?? null}
                editionKey="home"
                zone={EDITORIAL_ZONES.GOOD_TO_KNOW}
                compact
                articles={publishedArticles}
              />
            ))}
          </div>
        </CompositionSection>

        {/* BAS DE PAGE */}

        <CompositionSection
          eyebrow="Dernière mise en avant"
          title="Carte de bas de page"
          description="Le contenu qui clôt le cycle de lecture de la page d’accueil."
          status={
            <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              CYCLE ÉDITORIAL
            </span>
          }
        >
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
        </CompositionSection>
      </div>

      {/* DIFFUSION SOCIALE */}

      <section className="mt-7">
        <EditorialSocialCard
          facebookCount={facebookCount}
          whatsappCount={whatsappCount}
          scheduledCount={scheduledCount}
        />
      </section>
    </>
  );
}