import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const ROOT = process.cwd();
const WRITE_MODE = process.argv.includes("--write");

const SEARCH_DIRECTORIES = ["app", "components"];

const EXCLUDED_DIRECTORIES = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".tsx",
  ".jsx",
]);

const SAFE_IMAGE_IMPORT =
  'import SafeImage from "@/components/SafeImage";';

const SAFE_IMAGE_FILE = path.resolve(
  ROOT,
  "components",
  "SafeImage.tsx",
);

let scannedFiles = 0;
let matchingFiles = 0;
let modifiedFiles = 0;
let replacedTags = 0;

function collectFiles(directory, files = []) {
  if (!fs.existsSync(directory)) {
    return files;
  }

  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (
      entry.isDirectory() &&
      EXCLUDED_DIRECTORIES.has(entry.name)
    ) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
      continue;
    }

    if (!ALLOWED_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    if (path.resolve(fullPath) === SAFE_IMAGE_FILE) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function getScriptKind(filePath) {
  return path.extname(filePath) === ".jsx"
    ? ts.ScriptKind.JSX
    : ts.ScriptKind.TSX;
}

function findNextImageImport(sourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue;
    }

    if (
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== "next/image"
    ) {
      continue;
    }

    const importClause = statement.importClause;

    if (!importClause?.name) {
      continue;
    }

    return {
      statement,
      importClause,
      imageIdentifier: importClause.name.text,
    };
  }

  return null;
}

function hasSafeImageImport(sourceFile) {
  return sourceFile.statements.some((statement) => {
    if (!ts.isImportDeclaration(statement)) {
      return false;
    }

    return (
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text ===
        "@/components/SafeImage"
    );
  });
}

function collectTagReplacements(
  sourceFile,
  imageIdentifier,
) {
  const replacements = [];

  function visit(node) {
    if (
      ts.isJsxSelfClosingElement(node) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === imageIdentifier
    ) {
      replacements.push({
        start: node.tagName.getStart(sourceFile),
        end: node.tagName.getEnd(),
        text: "SafeImage",
      });
    }

    if (
      ts.isJsxOpeningElement(node) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === imageIdentifier
    ) {
      replacements.push({
        start: node.tagName.getStart(sourceFile),
        end: node.tagName.getEnd(),
        text: "SafeImage",
      });
    }

    if (
      ts.isJsxClosingElement(node) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === imageIdentifier
    ) {
      replacements.push({
        start: node.tagName.getStart(sourceFile),
        end: node.tagName.getEnd(),
        text: "SafeImage",
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return replacements;
}

function buildImportReplacement(
  sourceFile,
  importInfo,
  safeImageAlreadyImported,
) {
  const {
    statement,
    importClause,
  } = importInfo;

  const namedBindings = importClause.namedBindings;

  if (!namedBindings) {
    return {
      start: statement.getStart(sourceFile),
      end: statement.getEnd(),
      text: safeImageAlreadyImported
        ? ""
        : SAFE_IMAGE_IMPORT,
    };
  }

  const originalModuleSpecifier =
    statement.moduleSpecifier.getText(sourceFile);

  const preservedImport = `import ${namedBindings.getText(
    sourceFile,
  )} from ${originalModuleSpecifier};`;

  return {
    start: statement.getStart(sourceFile),
    end: statement.getEnd(),
    text: safeImageAlreadyImported
      ? preservedImport
      : `${preservedImport}\n${SAFE_IMAGE_IMPORT}`,
  };
}

function applyReplacements(content, replacements) {
  const ordered = [...replacements].sort(
    (a, b) => b.start - a.start,
  );

  let updatedContent = content;

  for (const replacement of ordered) {
    updatedContent =
      updatedContent.slice(0, replacement.start) +
      replacement.text +
      updatedContent.slice(replacement.end);
  }

  return updatedContent;
}

function processFile(filePath) {
  scannedFiles += 1;

  const content = fs.readFileSync(filePath, "utf8");

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath),
  );

  const importInfo = findNextImageImport(sourceFile);

  if (!importInfo) {
    return;
  }

  const tagReplacements = collectTagReplacements(
    sourceFile,
    importInfo.imageIdentifier,
  );

  if (tagReplacements.length === 0) {
    return;
  }

  matchingFiles += 1;

  const importReplacement = buildImportReplacement(
    sourceFile,
    importInfo,
    hasSafeImageImport(sourceFile),
  );

  const replacements = [
    importReplacement,
    ...tagReplacements,
  ];

  const updatedContent = applyReplacements(
    content,
    replacements,
  );

  const relativePath = path.relative(ROOT, filePath);

  console.log(
    `${WRITE_MODE ? "✓" : "•"} ${relativePath} — ${
      tagReplacements.length
    } balise(s)`,
  );

  replacedTags += tagReplacements.length;

  if (WRITE_MODE && updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent, "utf8");
    modifiedFiles += 1;
  }
}

const files = SEARCH_DIRECTORIES.flatMap((directory) =>
  collectFiles(path.join(ROOT, directory)),
);

for (const file of files) {
  processFile(file);
}

console.log("");

if (WRITE_MODE) {
  console.log("Transformation terminée.");
  console.log(`${modifiedFiles} fichier(s) modifié(s).`);
} else {
  console.log("Simulation terminée : aucun fichier modifié.");
  console.log(`${matchingFiles} fichier(s) seraient modifiés.`);
}

console.log(`${replacedTags} balise(s) Image détectée(s).`);

if (!WRITE_MODE && matchingFiles > 0) {
  console.log("");
  console.log(
    "Pour appliquer les changements : node scripts/replace-next-image.mjs --write",
  );
}