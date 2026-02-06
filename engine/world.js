import fs from "fs";
import path from "path";

export class World {
  constructor(basePath) {
    this.basePath = basePath;

    const loaded = this.loadJSON("game/facts.json");

    // 🔧 NORMALIZZAZIONE
    if (Array.isArray(loaded)) {
      this.facts = loaded;
    } else if (loaded && typeof loaded === "object") {
      this.facts = Object.values(loaded);
    } else {
      this.facts = [];
    }
  }

  loadJSON(relativePath) {
    const fullPath = path.join(this.basePath, "data", relativePath);
    if (!fs.existsSync(fullPath)) return null;
    return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
  }

  saveJSON(relativePath, data) {
    const fullPath = path.join(this.basePath, "data", relativePath);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
  }

  saveState() {
    this.saveJSON("game/facts.json", this.facts);
  }

  getFactById(id) {
    return this.facts.find(f => f.id === id);
  }

  // 🔧 ADATTATORE FRINGE
  registerFact(fact) {
    const { id, value, confidence = 1 } = fact;

    const existing = this.getFactById(id);
    if (existing) {
      existing.value = value;
      existing.confidence = confidence;
    } else {
      this.facts.push({ id, value, confidence });
    }
  }
}
