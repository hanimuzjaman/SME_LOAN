// server/src/middleware/uploadKYC.js
import multer from "multer";

const storage = multer.memoryStorage();

const pdfOnly = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files allowed"), false);
};

export const uploadKYC = multer({
  storage,
  fileFilter: pdfOnly,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});