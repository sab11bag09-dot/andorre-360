"use client";

import BlockEditor from "./BlockEditor";

import {
  Input,
  SectionHeader,
  Select,
  Textarea,
} from "@/components/admin/ui";

import { CATEGORIES } from "@/components/admin/article/types";

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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-0"
            placeholder="Nom de l'auteur"
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
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          rows={5}
          className="mt-0"
          placeholder="Présentez le sujet en quelques phrases."
          required
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <label className="font-semibold text-zinc-200">
            Article
          </label>

          <div className="flex gap-4 text-xs text-zinc-500">
            <span>{wordCount} mots</span>
            <span>{readingTime} min</span>
          </div>
        </div>

        <BlockEditor
          content={content}
          onChange={setContent}
        />
      </div>
    </section>
  );
}