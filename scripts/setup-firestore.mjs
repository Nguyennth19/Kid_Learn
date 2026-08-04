import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_PROJECT_ID = "kidlearn-dev-2026";
const DATABASE_ID = "(default)";
const LOCATION = "asia-southeast1";
const DRY_RUN_MODE = "DRY_RUN";
const APPLY_MODE = "APPLY";
const APPLY_CONFIRMATION = "WRITE_12_DEV_DOCUMENTS";
const EXPECTED_DOCUMENT_COUNT = 12;
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

const mode = process.env.KIDLEARN_SETUP_MODE || DRY_RUN_MODE;
const projectId =
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.FIREBASE_PROJECT ||
  EXPECTED_PROJECT_ID;

if (![DRY_RUN_MODE, APPLY_MODE].includes(mode)) {
  throw new Error("KIDLEARN_SETUP_MODE must be DRY_RUN or APPLY.");
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
  if (
    !item.path ||
    item.path.split("/").length % 2 !== 0 ||
    !item.data ||
    typeof item.data !== "object" ||
    Array.isArray(item.data)
  ) {
    throw new Error(`Invalid Firestore seed document: ${item.path || "<empty>"}`);
  }
}

if (documents.length !== EXPECTED_DOCUMENT_COUNT) {
  throw new Error(
    `Seed count guard failed: expected ${EXPECTED_DOCUMENT_COUNT}, received ${documents.length}.`
  );
}

if (mode === DRY_RUN_MODE) {
  console.log(JSON.stringify({
    success: true,
    phase: "5I-C",
    mode,
    projectId,
    databaseId: DATABASE_ID,
    location: LOCATION,
    plannedDocumentCount: documents.length,
    plannedPaths: paths,
    actualFirestoreWritePerformed: false,
    actualAuthenticationWritePerformed: false
  }, null, 2));
  process.exit(0);
}

if (process.env.KIDLEARN_CONFIRM_PROJECT !== EXPECTED_PROJECT_ID) {
  throw new Error(
    `Apply guard failed: KIDLEARN_CONFIRM_PROJECT must equal ${EXPECTED_PROJECT_ID}.`
  );
}

if (process.env.KIDLEARN_CONFIRM_WRITE !== APPLY_CONFIRMATION) {
  throw new Error(
    `Apply guard failed: KIDLEARN_CONFIRM_WRITE must equal ${APPLY_CONFIRMATION}.`
  );
}

const { applicationDefault, getApps, initializeApp } = await import("firebase-admin/app");
const { getFirestore } = await import("firebase-admin/firestore");

const appName = "kidlearn-phase-5i-c-seed";
const adminApp =
  getApps().find((app) => app.name === appName) ||
  initializeApp(
    {
      credential: applicationDefault(),
      projectId: EXPECTED_PROJECT_ID
    },
    appName
  );
const db = getFirestore(adminApp, DATABASE_ID);
const refs = documents.map((item) => db.doc(item.path));
const beforeSnapshots = await db.getAll(...refs);
const existingDocumentCount = beforeSnapshots.filter((snapshot) => snapshot.exists).length;

const batch = db.batch();
documents.forEach((item, index) => {
  batch.set(refs[index], item.data, { merge: true });
});
await batch.commit();

const afterSnapshots = await db.getAll(...refs);
const missingPaths = afterSnapshots
  .filter((snapshot) => !snapshot.exists)
  .map((snapshot) => snapshot.ref.path);

if (missingPaths.length) {
  throw new Error(`Post-write verification failed for: ${missingPaths.join(", ")}`);
}

console.log(JSON.stringify({
  success: true,
  phase: "5I-C",
  mode,
  projectId,
  databaseId: DATABASE_ID,
  location: LOCATION,
  plannedDocumentCount: documents.length,
  verifiedDocumentCount: afterSnapshots.length,
  createdDocumentCount: documents.length - existingDocumentCount,
  mergedExistingDocumentCount: existingDocumentCount,
  writtenPaths: paths,
  actualFirestoreWritePerformed: true,
  actualAuthenticationWritePerformed: false
}, null, 2));
