// server/src/utils/pdfCheck.js
import { PDFExtract } from "pdf.js-extract";

const pdfExtract = new PDFExtract();

export async function analyzePdfBuffer(buffer) {
  try {
    const data = await pdfExtract.extractBuffer(buffer, {});

    let text = "";
    for (const page of data.pages) {
      for (const item of page.content) {
        if (item.str) text += item.str + " ";
      }
    }

    text = text.replace(/\s+/g, " ").trim();

    // PAN pattern
    const panRegex = /([A-Z]{5}[0-9]{4}[A-Z])/i;
    const panMatch = text.match(panRegex);
    const panFound = panMatch ? panMatch[0].toUpperCase() : null;

    // Aadhaar pattern
    const aadhaarRegex = /([0-9]{4}\s?[0-9]{4}\s?[0-9]{4})/;
    const aadhaarMatch = text.match(aadhaarRegex);
    const aadhaarFound = aadhaarMatch
      ? aadhaarMatch[0].replace(/\s/g, "")
      : null;

    // Expiry detection
    const expiryRegex =
      /(Expiry|Valid Upto|Valid Until|Valid Till|Valid Thru)[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i;

    const expiryMatch = text.match(expiryRegex);
    let expiryFound = null;

    if (expiryMatch && expiryMatch[2]) {
      const parsed = Date.parse(expiryMatch[2].replace(/-/g, "/"));
      if (!isNaN(parsed)) expiryFound = new Date(parsed);
    }

    return { text, panFound, aadhaarFound, expiryFound };
  } catch (err) {
    console.error("PDF Extract error:", err);
    throw new Error("Unable to read PDF");
  }
}