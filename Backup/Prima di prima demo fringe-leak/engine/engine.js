import { World } from "./world.js";
import { Knowledge } from "./knowledge.js";

export class Engine {
  constructor(basePath) {
    this.world = new World(basePath);
    this.knowledgeCache = {};
  }

  getKnowledge(characterId) {
    if (!this.knowledgeCache[characterId]) {
      this.knowledgeCache[characterId] =
        new Knowledge(this.world.basePath, characterId);
    }
    return this.knowledgeCache[characterId];
  }

  applyAction(actionFn) {
    actionFn(this.world, this);
    this.world.saveState();
    Object.values(this.knowledgeCache).forEach(k => k.save());
  }
}
