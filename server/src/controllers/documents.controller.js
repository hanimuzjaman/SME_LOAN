// server/src/controllers/documents.controller.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const documentsDir = path.join(__dirname, "..", "..", "Documents");
const dataFilePath = path.join(documentsDir, "data.json");

function loadJSON() {
  if (!fs.existsSync(dataFilePath)) return {};
  const raw = fs.readFileSync(dataFilePath, "utf8") || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// GET /api/documents/:applicantId
export function getApplicantDocuments(req, res) {
  const applicantId = req.params.applicantId?.trim();
  if (!applicantId) {
    return res.status(400).json({ message: "Applicant ID required" });
  }

  const data = loadJSON();
  const applicantData = data[applicantId];

  if (!applicantData) {
    return res.status(404).json({ message: "No documents found for this applicant" });
  }

  // Transform nested structure into a flat list with label and section
  const documents = [];

  Object.entries(applicantData).forEach(([section, sectionData]) => {
    if (typeof sectionData === "object" && sectionData !== null) {
      Object.entries(sectionData).forEach(([label, fileArray]) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => {
            documents.push({
              label,
              section,
              originalName: file.originalName,
              storedName: file.storedName,
              relativePath: file.relativePath,
              uploadedAt: file.uploadedAt,
            });
          });
        }
      });
    }
  });

  return res.json({ applicantId, documents });
}