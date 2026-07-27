import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const EXCLUDED_DIRECTORIES = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
]);

const ALLOWED_EXTENSIONS = new Set([".tsx", ".jsx"]);

let modifiedFiles = 0;
let replacedImages = 0;

function walk(directory) {
  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (EXCLUDED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!ALLOWED_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    if (
      fullPath.endsWith(
        path.join("components", "SafeImage.tsx"),
      )
    ) {
      continue;
    }

    updateFile(fullPath);
  }
}

function updateFile(filePath) {
  const originalContent = fs.readFileSync(filePath, "utf8");

  const defaultImageImport =
    /import\s+([A-Za-z_$][\w$]*)\s+from\s+["']next\/image["'];?/;

  const defaultAndNamedImageImport =
    /import\s+([A-Za-z_$][\w$]*)\s*,\s*(\{[\s\S]*?\})\s+from\s+["']next\/image["'];?/;

  let content = originalContent;
  let imageIdentifier = null;

  const combinedImportMatch = content.match(
    defaultAndNamedImageImport,
  );

  if (combinedImportMatch) {
    imageIdentifier = combinedImportMatch[1];
    const namedImports = combinedImportMatch[2];

    content = content.replace(
      combinedImportMatch[0],
      `import ${namedImports} from "next/image";\nimport SafeImage from "@/components/SafeImage";`,
    );
  } else {
    const defaultImportMatch = content.match(
      defaultImageImport,
    );

    if (!defaultImportMatch) {
      return;
    }

    imageIdentifier = defaultImportMatch[1];

    content = content.replace(
      defaultImportMatch[0],
      `import SafeImage from "@/components/SafeImage";`,
    );
  }

  const escapedIdentifier = imageIdentifier.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  const openingTag = new RegExp(
    `<${escapedIdentifier}(?=[\\s/>])`,
    "g",
  );

  const closingTag = new RegExp(
    `</${escapedIdentifier}>`,
    "g",
  );

  const openingMatches = content.match(openingTag) ?? [];
  const closingMatches = content.match(closingTag) ?? [];

  content = content
    .replace(openingTag, "<SafeImage")
    .replace(closingTag, "</SafeImage>");

  const replacements =
    openingMatches.length + closingMatches.length;

  if (content === originalContent) {
    return;
  }

  fs.writeFileSync(filePath, content, "utf8");

  modifiedFiles += 1;
  replacedImages += replacements;

  console.log(
    `✓ ${path.relative(ROOT, filePath)} — ${replacements} balise(s) remplacée(s)`,
  );
}

walk(ROOT);

console.log("");
console.log(`Terminé.`);
console.log(`${modifiedFiles} fichier(s) modifié(s).`);
console.log(`${replacedImages} balise(s) Image remplacée(s).`);
