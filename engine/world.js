import fs from "fs";
import path from "path";

export class World {
  constructor(basePath) {
    this.basePath = basePath;
    this.world = this.loadJSON("data/world/world.json");
    this.timeline = this.loadJSON("data/world/timeline.json");
    this.facts = this.loadJSON("data/game/facts.json");
    this.state = this.loadJSON("data/game/state.json");
  }

  loadJSON(relPath) {
    const fullPath = path.join(this.basePath, relPath);
    return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
  }

  saveState() {
    const fullPath = path.join(this.basePath, "data/game/state.json");
    fs.writeFileSync(fullPath, JSON.stringify(this.state, null, 2));
  }

  getFact(id) {
    return this.facts[id];
  }

  setFact(id, value) {
    this.facts[id] = value;
  }

  advanceTime(marker) {
    this.state.time = marker;
  }
}
