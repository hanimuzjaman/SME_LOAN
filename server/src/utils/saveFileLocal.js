// src/utils/saveFileLocal.js
import fs from "fs/promises";
import path from "path";

const DOC_ROOT = path.join(process.cwd(), "Documents");
const JSON_PATH = path.join(DOC_ROOT, "data.json");

// Load existing JSON (or empty object)
async function loadJson() {
  try {
    const txt = await fs.readFile(JSON_PATH, "utf8");
    return JSON.parse(txt);
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw err;
  }
}

async function saveJson(obj) {
  await fs.mkdir(DOC_ROOT, { recursive: true });
  await fs.writeFile(JSON_PATH, JSON.stringify(obj, null, 2), "utf8");
}

/**
 * Save a file to /Documents/<Applicant_ID>/<section>/... and
 * also record it inside Documents/data.json, nested as:
 * {
 *   "<Applicant_ID>": {
 *     "KYC": { ... },
 *     "Business_Proof": { ... },
 *     "Income_Proof": { ... }
 *   }
 * }
 */
export async function saveFileLocal({
  applicantId,
  section,
  label,
  buffer,
  originalName,
}) {
  const safeApplicant = String(applicantId).trim();
  const safeSection = String(section).trim() || "Misc";
  const safeLabel = String(label).trim() || "file";

  // 1) Ensure directory exists
  const dirPath = path.join(DOC_ROOT, safeApplicant, safeSection);
  await fs.mkdir(dirPath, { recursive: true });

  // 2) Build safe filename
  const timestamp = Date.now();
  const sanitized = originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const finalName = `${safeLabel}_${timestamp}_${sanitized}`;
  const filePath = path.join(dirPath, finalName);

  // 3) Write file
  await fs.writeFile(filePath, buffer);

  // Path relative to Documents/ (good for DB & UI)
  const relativePath = path
    .relative(DOC_ROOT, filePath)
    .replace(/\\/g, "/");

  // 4) Update JSON index
  const db = await loadJson();

  if (!db[safeApplicant]) db[safeApplicant] = {};
  if (!db[safeApplicant][safeSection]) db[safeApplicant][safeSection] = {};
  if (!db[safeApplicant][safeSection][safeLabel])
    db[safeApplicant][safeSection][safeLabel] = [];

  db[safeApplicant][safeSection][safeLabel].push({
    originalName,
    storedName: finalName,
    relativePath,
    uploadedAt: new Date().toISOString(),
  });

  await saveJson(db);

  // 5) 🔁 THIS WAS MISSING EARLIER – return something
  return {
    relativePath,
    storedName: finalName,
    absolutePath: filePath,
  };
}