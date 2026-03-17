import { readFile } from "fs/promises";

export async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");

  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = [
      `Invalid JSON in file: ${filePath}`,
      `Original error: ${error.message}`
    ].join("\n");

    throw new Error(message);
  }
}