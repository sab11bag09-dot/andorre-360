import { describe, expect, it } from "vitest";

import { answerAutomaticQuestions } from "./fiveQuestions";

const SOURCE = {
  title: "El Comú d’Encamp inicia les obres de la instal·lació fotovoltaica",
  content:
    "El Comú d’Encamp ha iniciat aquest dilluns les obres de la instal·lació fotovoltaica del Complex esportiu. Els treballs duraran fins al mes de desembre.",
};

const GOOD = {
  title: "Encamp lance une installation solaire au Complexe sportif",
  description: "Le Comú d’Encamp a débuté lundi les travaux d’une installation photovoltaïque sur les toitures.",
  content: "Les travaux dureront jusqu’en décembre.\n\nLa commune prévoit de produire une partie de son électricité.",
};

function status(article: typeof GOOD, source = SOURCE) {
  return Object.fromEntries(answerAutomaticQuestions(article, source).map(({ key, status }) => [key, status]));
}

describe("qui, où, quand", () => {
  it("reconnaît un article qui répond aux trois questions", () => {
    expect(status(GOOD)).toEqual({ who: "répond", where: "répond", when: "répond" });
  });

  it("signale un début d’article qui ne nomme personne", () => {
    const vague = {
      title: "Une nouvelle installation solaire voit le jour",
      description: "Les travaux d’une installation photovoltaïque ont débuté lundi sur les toitures.",
      content: "Les travaux dureront jusqu’en décembre.\n\nLa production servira aux bâtiments d’Encamp.",
    };
    expect(status(vague).who).toBe("manque");
  });

  it("ne prend pas un article en tête de phrase pour un nom", () => {
    const vague = {
      title: "La chasse autorisée pour la saison",
      description: "Les recensements montrent une hausse des effectifs cette année.",
      content: "Le quota est relevé.",
    };
    expect(status(vague, { title: "La caça", content: "La caça s’obre aquest any." }).who).toBe("manque");
  });

  it("exige un lieu de la source, sous son nom français ou catalan", () => {
    const elsewhere = { ...GOOD, title: "Une installation solaire au Complexe sportif", description: "Les travaux ont débuté lundi.", content: "Ils dureront jusqu’en décembre." };
    const answer = answerAutomaticQuestions(elsewhere, SOURCE).find(({ key }) => key === "where");
    expect(answer).toMatchObject({ status: "manque", detail: "lieu de la source absent : Encamp" });

    const vella = { title: "Andorre-la-Vieille installe son Consell d’Infants", description: "Douze élèves ont prêté serment jeudi.", content: "Ils siégeront toute l’année." };
    expect(status(vella, { title: "Consell d’Infants", content: "El Comú d’Andorra la Vella ha constituït dijous el Consell d’Infants." }).where).toBe("répond");
  });

  it("exige une date dès que la source en donne une", () => {
    const undated = {
      title: "Encamp lance une installation solaire",
      description: "Le Comú d’Encamp a débuté les travaux d’une installation photovoltaïque.",
      content: "La commune prévoit de produire une partie de son électricité.",
    };
    expect(status(undated).when).toBe("manque");
    expect(status(undated, { title: SOURCE.title, content: "El Comú d’Encamp fa obres." }).when).toBe("sans objet");
  });

  it("met sans objet les questions auxquelles la source ne répond pas", () => {
    const source = { title: "Lectura fàcil", content: "La CASS adapta la llei al format de lectura fàcil." };
    const article = { title: "La CASS adapte la loi en lecture facile", description: "La CASS rend la loi plus lisible.", content: "Le texte est disponible." };
    expect(status(article, source)).toEqual({ who: "répond", where: "sans objet", when: "sans objet" });
  });
});
