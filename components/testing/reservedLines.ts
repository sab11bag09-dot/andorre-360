/**
 * Règle de mise en page : un texte limité à N lignes (`line-clamp-N`) doit
 * aussi réserver N lignes (`min-h-[Nlh]`), au même point de rupture. Un titre
 * d’une ligne occupe alors la même place qu’un titre de trois : les cartes,
 * les colonnes et les photos ne bougent pas selon la longueur des textes.
 *
 * Renvoie les classes fautives d’un rendu HTML, ou d’un source TSX
 * (`className="…"` ou gabarit `className={`…`}`) ; vide si la règle est tenue.
 */
export function unreservedLineClamps(markup: string): string[] {
  const violations: string[] = [];
  const attributes = markup.matchAll(/class(?:Name)?=(?:"([^"]*)"|\{`([^`]*)`\})/g);

  for (const [, quoted, template] of attributes) {
    const classAttribute = quoted ?? template;
    const tokens = classAttribute.split(/\s+/);

    for (const token of tokens) {
      const clamp = /^((?:[a-z0-9]+:)*)line-clamp-(\d+)$/.exec(token);
      if (!clamp) continue;

      const [, prefix, lines] = clamp;
      if (!tokens.includes(`${prefix}min-h-[${lines}lh]`)) {
        violations.push(`${token} sans ${prefix}min-h-[${lines}lh] : ${classAttribute}`);
      }
    }
  }

  return violations;
}
