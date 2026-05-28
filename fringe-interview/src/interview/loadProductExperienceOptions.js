import { readFileSync } from "fs";

export function loadProductExperienceOptions() {
  const fileUrl = new URL(
    "../../config/product_experience_options.json",
    import.meta.url
  );

  return JSON.parse(readFileSync(fileUrl, "utf8"));
}