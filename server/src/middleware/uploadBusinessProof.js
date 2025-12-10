// src/middleware/uploadBusinessProof.js
import multer from "multer";

const storage = multer.memoryStorage();

export const uploadBusinessProof = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});