import { describe, expect, it } from "vitest";

import { checkFactFidelity, describeFactFidelity } from "./factFidelity";

const FACTS = [
  "Le Comú d’Andorra la Vella a tenu le 19 novembre 2026 la séance du 11e Consell d’Infants.",
  "Deux navettes partent de Santa Coloma à 19.30 heures.",
  "Le budget atteint 1 200 000 euros, soit une hausse de 4,7 %.",
];

function check(content: string, title = "Titre", description = "Chapô") {
  return checkFactFidelity({
    article: { title, description, content },
    facts: FACTS,
    sourceName: "Govern d’Andorra",
    contextDates: [new Date("2026-11-17T18:29:44.000Z")],
  });
}

describe("checkFactFidelity — chiffres", () => {
  it("accepte des chiffres présents dans les faits, quelle que soit leur écriture", () => {
    expect(
      check(
        "Le 19 novembre 2026, le 11e Consell d’Infants s’est réuni. Départ à 19 h 30. " +
          "Le budget atteint 1 200 000 euros (+4,7 %). 2 navettes sont prévues.",
      ).unsupportedNumbers,
    ).toEqual([]);
  });

  it("reconnaît le point de milliers des sources catalanes et espagnoles", () => {
    expect(
      checkFactFidelity({
        article: { title: "Le Gouvernement accorde 14 400 euros", description: "Chapô", content: "Chaque bourse coûte 2 200 euros." },
        facts: ["El Govern aporta 14.400 euros. El cost de cada beca és de 2.200 euros."],
        sourceName: "Govern d’Andorra",
        contextDates: [],
      }).unsupportedNumbers,
    ).toEqual([]);
  });

  it("accepte les dates fournies au rédacteur comme contexte", () => {
    expect(
      check("Selon les informations communiquées le 17 novembre 2026.").unsupportedNumbers,
    ).toEqual([]);
  });

  it("accepte les dates déduites d’un mot relatif ou d’une date sans année", () => {
    // Contexte : 17 novembre 2026. « Ce samedi », « la semaine dernière », « le 11 mars ».
    expect(
      check(
        "Le samedi 14 novembre 2026, puis entre le 8 et le 15 novembre 2026, et du 20 au 24 novembre. " +
          "Les propositions seront présentées en mars 2027.",
      ).unsupportedNumbers,
    ).toEqual([]);
  });

  it("refuse un jour éloigné du contexte ou une année sans rapport", () => {
    expect(check("La séance aura lieu le 3 février 2026.").unsupportedNumbers).toEqual(["3"]);
    expect(check("Comme le 2 novembre 2019.").unsupportedNumbers).toEqual(["2019"]);
    expect(check("Il y a 16 conseillers.").unsupportedNumbers).toEqual(["16"]);
  });

  it("signale un chiffre absent des faits, y compris dans le titre et le chapô", () => {
    expect(
      check("Le budget atteint 1 500 000 euros.", "Un plan à 75 millions", "Hausse de 9 %")
        .unsupportedNumbers,
    ).toEqual(["75", "9", "1500000"]);
  });

  it("ne signale qu’une fois un même chiffre", () => {
    expect(check("Il y a 42 places. Les 42 places sont gratuites.").unsupportedNumbers).toEqual([
      "42",
    ]);
  });
});

describe("checkFactFidelity — noms propres", () => {
  it("accepte les noms présents dans les faits ou dans le nom de la source", () => {
    expect(
      check(
        "Selon le Govern d’Andorra, le Comú d’Andorra la Vella a réuni le Consell d’Infants à Santa Coloma.",
      ).namesToCheck,
    ).toEqual([]);
  });

  it("accepte les noms français usuels des lieux andorrans", () => {
    expect(
      check("La séance a eu lieu à Andorre-la-Vieille, en Andorre.").namesToCheck,
    ).toEqual([]);
  });

  it("ne tient pas compte du premier mot d’une phrase", () => {
    expect(check("Bonne nouvelle. Ensuite, la séance a eu lieu.").namesToCheck).toEqual([]);
  });

  it("signale à vérifier un nom absent des faits", () => {
    expect(
      check("La séance a réuni la ministre Imma Tor et l’Organisation mondiale de la santé.")
        .namesToCheck,
    ).toEqual(["Imma", "Tor", "Organisation"]);
  });
});

describe("describeFactFidelity", () => {
  it("résume les chiffres absents", () => {
    expect(
      describeFactFidelity({ unsupportedNumbers: ["30", "9"], namesToCheck: ["Tor"] }),
    ).toBe("chiffres absents de la liste de faits : 30, 9");
  });
});
