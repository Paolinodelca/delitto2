import { loadProfessionalPerceptionSchema } from "../src/interview/loadProfessionalPerceptionSchema.js";

async function main() {
  const schema = await loadProfessionalPerceptionSchema();

  if (!schema || typeof schema !== "object") {
    throw new Error("Schema Professional Perception mancante o non valido.");
  }

  if (!schema.properties?.whoEmerges) {
    throw new Error("Schema Professional Perception: manca whoEmerges.");
  }

  if (!schema.properties?.credibilityAssets) {
    throw new Error("Schema Professional Perception: manca credibilityAssets.");
  }

  console.log("✅ Professional Perception schema loaded correctly.");
}

main().catch((error) => {
  console.error("test_load_professional_perception_schema failed.");
  console.error(error);
  process.exit(1);
});