import { readFileSync } from "fs";

export function loadInterviewStyles() {
  const fileUrl = new URL("../../config/interview_styles.json", import.meta.url);

  return JSON.parse(readFileSync(fileUrl, "utf8"));
}