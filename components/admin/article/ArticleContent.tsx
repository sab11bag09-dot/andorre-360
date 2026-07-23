"use client";

import {
  Input,
  SectionHeader,
  Select,
  Textarea,
} from "@/components/admin/ui";

import { CATEGORIES } from "./types";

type Props = {
  title: string;
  setTitle: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;

  author: string;
  setAuthor: (value: string) => void;

  description: string;
  setDescription: (value: string) => void;

  content: string;
  setContent: (value: string) => void;

  wordCount: number;
  readingTime: number;
};

export default function ArticleContent({
  title,
  setTitle,
  category,
  setCategory,
  author,
  setAuthor,
  description,
  setDescription,
  content,
  setContent,
  wordCount,
  readingTime,
}: Props) {
  return (
    <section className="space-y-7 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <SectionHeader
        eyebrow="Contenu"
        title="Informations principales"
      />

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="title"
            className="font-semibold text-zinc-200"
          >
            Titre
          </label>

          <span
            className={`text-xs ${
              title.length > 100
                ? "text-red-400"
                : "text-zinc-500"
            }`}
          >
            {title.length} caractères
          </span>
        </div>

        <Input
          id="title"
          name="title"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          className="mt-0 py-4 text-lg"
          placeholder="Titre de la publication"
          required
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="category"
            className="mb-2 block font-semibold text-zinc-200"
          >
            Rubrique
          </label>

          <Select
            id="category"
            name="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="mt-0"
          >
            {CATEGORIES.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label
            htmlFor="author"
            className="mb-2 block font-semibold text-zinc-200"
          >
            Auteur
          </label>

          <Input
            id="author"
            name="author"
            value={author}
            onChange={(event) =>
              setAuthor(event.target.value)
            }
            className="mt-0"
            placeholder="Nom de l’auteur"
            required
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="description"
            className="font-semibold text-zinc-200"
          >
            Chapô
          </label>

          <span
            className={`text-xs ${
              description.length > 320
                ? "text-red-400"
                : "text-zinc-500"
            }`}
          >
            {description.length} caractères
          </span>
        </div>

        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          rows={5}
          className="mt-0"
          placeholder="Présentez le sujet en quelques phrases claires."
          required
        />
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="content"
            className="font-semibold text-zinc-200"
          >
            Article
          </label>

          <div className="flex gap-4 text-xs text-zinc-500">
            <span>{wordCount} mots</span>
            <span>{readingTime} min de lecture</span>
          </div>
        </div>

        <Textarea
          id="content"
          name="content"
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          rows={22}
          className="mt-0 leading-relaxed"
          placeholder="Rédigez ici le contenu complet…"
          required
        />
      </div>
    </section>
  );
}