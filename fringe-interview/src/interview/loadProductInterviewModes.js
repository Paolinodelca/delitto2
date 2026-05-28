import { readFileSync } from "fs";

export function loadProductInterviewModes() {
  const fileUrl = new URL(
    "../../config/product_interview_modes.json",
    import.meta.url
  );

  return JSON.parse(readFileSync(fileUrl, "utf8"));
}