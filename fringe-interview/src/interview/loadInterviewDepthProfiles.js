import { readFileSync } from "fs";

export function loadInterviewDepthProfiles() {
  const fileUrl = new URL("../../config/interview_depth_profiles.json", import.meta.url);

  return JSON.parse(readFileSync(fileUrl, "utf8"));
}