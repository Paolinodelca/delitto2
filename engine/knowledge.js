import fs from "fs";
import path from "path";

export class Knowledge {
  constructor(basePath, characterId) {
    this.basePath = basePath;
    this.characterId = characterId;
    this.knowledge = this.loadJSON(`knowledge/${characterId}.json`);
  }

  loadJSON(relPath) {
    const fullPath = path.join(this.basePath, relPath);
    return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
  }

  knows(factId) {
    return this.knowledge.facts?.includes(factId);
  }

  believes(factId) {
    return this.knowledge.beliefs?.[factId];
  }

  learn(factId) {
    if (!this.knowledge.facts.includes(factId)) {
      this.knowledge.facts.push(factId);
    }
  }

  save() {
    const fullPath = path.join(
      this.basePath,
      `knowledge/${this.characterId}.json`
    );
    fs.writeFileSync(fullPath, JSON.stringify(this.knowledge, null, 2));
  }
}
