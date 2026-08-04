import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_PROJECT_ID = "kidlearn-dev-2026";
const ALLOWED_MODE = "DRY_RUN";
const FORBIDDEN_KEYS = /password|pin|credential|secret|token|privatekey/i;
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function assertSafeValue(value, trail = "root") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafeValue(item, `${trail}[${index}]`));
    return;
  }

  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.test(key)) {
      throw new Error(`Forbidden credential-like field at ${trail}.${key}`);
    }
    assertSafeValue(child, `${trail}.${key}`);
  }
}

async function loadSeed(relativePath) {
  const filePath = resolve(rootDir, relativePath);
  const parsed = JSON.parse(await readFile(filePath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error(`${relativePath} must contain a JSON array.`);
  }
  return parsed;
}

const mode = process.env.KIDLEARN_SETUP_MODE || ALLOWED_MODE;
const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT || EXPECTED_PROJECT_ID;

if (mode !== ALLOWED_MODE) {
  throw new Error("Phase 5I-B only permits KIDLEARN_SETUP_MODE=DRY_RUN.");
}

if (projectId !== EXPECTED_PROJECT_ID) {
  throw new Error(`Project guard failed: expected ${EXPECTED_PROJECT_ID}, received ${projectId}.`);
}

const documents = [
  ...(await loadSeed("scripts/seed/system.seed.json")),
  ...(await loadSeed("scripts/seed/subjects.seed.json")),
  ...(await loadSeed("scripts/seed/courses.seed.json")),
  ...(await loadSeed("scripts/seed/lessons.seed.json")),
  ...(await loadSeed("scripts/seed/lesson-blocks.seed.json"))
];

assertSafeValue(documents);

const paths = documents.map((item) => item.path);
const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
if (duplicates.length) {
  throw new Error(`Duplicate document paths: ${[...new Set(duplicates)].join(", ")}`);
}

for (const item of documents) {
  if (!item.path || item.path.split("/").length % 2 !== 0) {
    throw new Error(`Invalid Firestore document path: ${item.path || "<empty>"}`);
  }
}

console.log(JSON.stringify({
  success: true,
  phase: "5I-B",
  mode,
  projectId,
  databaseId: "(default)",
  location: "asia-southeast1",
  plannedDocumentCount: documents.length,
  plannedPaths: paths,
  actualFirestoreWritePerformed: false,
  actualAuthenticationWritePerformed: false
}, null, 2));
