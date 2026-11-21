/**
 * Jeu de données déterministe du test de mise en page.
 *
 * Mêmes articles, mêmes dates et mêmes textes à chaque exécution : le test ne
 * dépend ni de `./dev.db` ni de l’heure. Chaque rubrique reçoit assez
 * d’articles pour remplir toutes ses zones ; les textes ont une longueur
 * réaliste et variée (titres d’une à trois lignes, chapô parfois absent), et
 * une partie des articles n’a pas de photo (image générique).
 */

export type LayoutArticle = {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  featured: boolean;
  filInfoFormat: "ALERT" | "BRIEF" | "ARTICLE";
  filInfoPinned: boolean;
  publishedAt: Date;
};

export type LayoutDatasetName = "complet" | "clairseme";

/**
 * Nombre d’articles publiés par rubrique (l’Actualité alimente aussi le Fil
 * info). `complet` remplit toutes les zones ; `clairseme` en laisse la plupart
 * vides, comme une rubrique qui n’a encore que quelques articles.
 */
export const LAYOUT_CATEGORY_COUNTS: Readonly<Record<LayoutDatasetName, Readonly<Record<string, number>>>> = {
  complet: {
    ACTUALITÉ: 34,
    POLITIQUE: 22,
    ÉCONOMIE: 22,
    SOCIÉTÉ: 22,
    INTERNATIONAL: 22,
    ILS_EN_PARLENT: 22,
    SPORTS: 22,
    CULTURE: 22,
    MONTAGNE: 26,
  },
  clairseme: {
    ACTUALITÉ: 4,
    POLITIQUE: 1,
    ÉCONOMIE: 2,
    SOCIÉTÉ: 1,
    INTERNATIONAL: 1,
    ILS_EN_PARLENT: 2,
    SPORTS: 1,
    CULTURE: 2,
    MONTAGNE: 1,
  },
};

const SUBJECTS = [
  "Le Conseil général",
  "Le gouvernement d’Andorre",
  "La commune d’Escaldes-Engordany",
  "Les stations de Grandvalira",
  "La Caisse andorrane de sécurité sociale",
  "Le ministère du Tourisme",
  "Les commerçants de la Massana",
  "L’hôpital Nostra Senyora de Meritxell",
  "Les agriculteurs de la vallée du Madriu",
  "La fédération andorrane de ski",
];

const ACTIONS = [
  "présente son budget",
  "annonce de nouvelles mesures pour le logement",
  "lance une consultation publique sur la mobilité dans les paroisses",
  "dévoile son plan",
  "prépare une réforme attendue depuis plusieurs années par les habitants",
  "fait le bilan",
  "ouvre un chantier",
  "signe un accord avec ses voisins espagnols et français pour la prochaine saison",
];

const DESCRIPTIONS = [
  "Les élus ont détaillé les principales lignes du projet lors d’une séance publique.",
  "",
  "Le texte doit encore être examiné en commission avant un vote prévu au printemps, après plusieurs mois de discussions avec les représentants des paroisses et les acteurs économiques du pays.",
  "Une décision qui concerne directement des milliers de résidents.",
  "Les premiers résultats seront présentés devant le Conseil général à la fin du mois.",
];

/** Date de référence fixe : aucun article n’est daté par rapport à l’heure courante. */
const REFERENCE_DATE = Date.UTC(2026, 10, 20, 12, 0, 0);

const SAMPLE_IMAGE = "/images/global/hero.jpg";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function filInfoFormat(index: number): LayoutArticle["filInfoFormat"] {
  if (index % 9 === 4) return "ALERT";
  if (index % 3 === 1) return "BRIEF";
  return "ARTICLE";
}

export function buildLayoutDataset(name: LayoutDatasetName): LayoutArticle[] {
  const articles: LayoutArticle[] = [];
  let sequence = 0;

  for (const [category, count] of Object.entries(LAYOUT_CATEGORY_COUNTS[name])) {
    for (let index = 0; index < count; index += 1) {
      const subject = SUBJECTS[(sequence + index) % SUBJECTS.length];
      const action = ACTIONS[(sequence * 3 + index) % ACTIONS.length];
      const title = `${subject} ${action}`;

      articles.push({
        slug: `essai-${slugify(category)}-${String(index + 1).padStart(2, "0")}`,
        title,
        category,
        description: DESCRIPTIONS[(sequence + index * 2) % DESCRIPTIONS.length],
        // Une photo sur quatre manque : la carte affiche alors l’image générique.
        image: index % 4 === 3 ? "" : SAMPLE_IMAGE,
        featured: index === 0,
        filInfoFormat: category === "ACTUALITÉ" ? filInfoFormat(index) : "ARTICLE",
        // Une information épinglée en tête du Fil info.
        filInfoPinned: category === "ACTUALITÉ" && index === 5,
        // Les articles s’intercalent entre rubriques, une toutes les 17 minutes.
        publishedAt: new Date(REFERENCE_DATE - (index * 9 + sequence) * 17 * 60_000),
      });
    }

    sequence += 1;
  }

  return articles;
}
