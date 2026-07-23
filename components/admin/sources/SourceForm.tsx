import {
  Button,
  Input,
  SectionHeader,
  Select,
  Textarea,
} from "@/components/admin/ui";

import {
  CHECK_INTERVALS,
  COLLECTION_MODES,
  ORGANIZATION_TYPES,
  PUBLICATION_MODES,
  TRUST_LEVELS,
} from "@/lib/sources/constants";

type SourceFormValues = {
  name?: string;
  description?: string | null;
  url?: string;
  organizationType?: string;
  collectionMode?: string;
  publicationMode?: string;
  trustLevel?: string;
  category?: string | null;
  checkIntervalMinutes?: number;
  active?: boolean;
};

type SourceFormProps = {
  action: (formData: FormData) => Promise<void>;
  mode: "create" | "update";
  initialValues?: SourceFormValues;
};

export default function SourceForm({
  action,
  mode,
  initialValues = {},
}: SourceFormProps) {
  return (
    <form action={action} className="mt-8 space-y-8">
      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <SectionHeader title="Informations générales" />

        <div className="grid gap-6 md:grid-cols-2">
          <label className="text-sm font-medium text-zinc-300">
            Nom
            <Input
              name="name"
              required
              defaultValue={initialValues.name ?? ""}
              placeholder="Gouvernement d’Andorre"
            />
          </label>

          <label className="text-sm font-medium text-zinc-300">
            URL
            <Input
              name="url"
              type="url"
              required
              defaultValue={initialValues.url ?? ""}
              placeholder="https://www.govern.ad"
            />
          </label>

          <label className="text-sm font-medium text-zinc-300 md:col-span-2">
            Description
            <Textarea
              name="description"
              rows={4}
              defaultValue={initialValues.description ?? ""}
              placeholder="Description facultative de la source."
            />
          </label>

          <label className="text-sm font-medium text-zinc-300">
            Type d’organisation
            <Select
              name="organizationType"
              defaultValue={
                initialValues.organizationType ?? "OTHER"
              }
            >
              {ORGANIZATION_TYPES.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="text-sm font-medium text-zinc-300">
            Catégorie éditoriale
            <Input
              name="category"
              defaultValue={initialValues.category ?? ""}
              placeholder="Politique, montagne, circulation…"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <SectionHeader title="Collecte et publication" />

        <div className="grid gap-6 md:grid-cols-2">
          <label className="text-sm font-medium text-zinc-300">
            Mode de collecte
            <Select
              name="collectionMode"
              defaultValue={
                initialValues.collectionMode ?? "RSS"
              }
            >
              {COLLECTION_MODES.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="text-sm font-medium text-zinc-300">
            Fréquence de contrôle
            <Select
              name="checkIntervalMinutes"
              defaultValue={
                initialValues.checkIntervalMinutes ?? 15
              }
            >
              {CHECK_INTERVALS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="text-sm font-medium text-zinc-300">
            Mode de publication
            <Select
              name="publicationMode"
              defaultValue={
                initialValues.publicationMode ?? "MANUAL"
              }
            >
              {PUBLICATION_MODES.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="text-sm font-medium text-zinc-300">
            Niveau de confiance
            <Select
              name="trustLevel"
              defaultValue={
                initialValues.trustLevel ?? "HIGH"
              }
            >
              {TRUST_LEVELS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <label className="mt-6 flex items-center gap-3 rounded-lg border border-zinc-800 bg-black px-4 py-4 text-sm text-zinc-300">
          <input
            name="active"
            type="checkbox"
            defaultChecked={initialValues.active ?? true}
            className="h-4 w-4 accent-yellow-500"
          />

          Source active
        </label>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:justify-end">
        <Button
          href="/admin/sources"
          variant="outline"
        >
          Annuler
        </Button>

        <Button type="submit">
          {mode === "create"
            ? "Créer la source"
            : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}