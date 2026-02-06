import fs from "fs";
import path from "path";

export class World {
  constructor(basePath) {
    this.basePath = basePath;

    // carica i facts come MAPPA (oggetto)
    this.facts = this.loadJSON("data/game/facts.json");

    // carica eventuali verità oggettive (murderer, motive, ecc.)
    this.truths = this.loadJSON("data/world/truth.json");
  }

  loadJSON(relPath) {
    const fullPath = path.join(this.basePath, relPath);
    return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
  }

  /**
   * Restituisce un fact (da facts o truths) dato un id
   */
  getFactById(id) {
    if (this.truths && this.truths[id]) {
      return this.truths[id];
    }

    if (this.facts && this.facts[id]) {
      return this.facts[id];
    }

    return null;
  }

registerFact({ id, value, confidence = 1 }) {
  const fact = this.getFactById(id);
  if (fact) {
    fact.value = value;
    fact.confidence = confidence;
  } else {
    this.facts.push({
      id,
      value,
      confidence
    });
  }

}
}

