// server/src/middleware/uploadIncomeProof.js
import multer from "multer";

const storage = multer.memoryStorage();

export const uploadIncomeProof = multer({ storage }).fields([
  { name: "pl_fy1", maxCount: 1 },
  { name: "pl_fy2", maxCount: 1 },
  { name: "pl_fy3", maxCount: 1 },

  { name: "bs_fy1", maxCount: 1 },
  { name: "bs_fy2", maxCount: 1 },
  { name: "bs_fy3", maxCount: 1 },

  { name: "itr_fy1", maxCount: 1 },
  { name: "itr_fy2", maxCount: 1 },
  { name: "itr_fy3", maxCount: 1 },

  { name: "bankStatementFile", maxCount: 1 },
]);