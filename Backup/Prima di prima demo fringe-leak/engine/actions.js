export function discoverFact(characterId, factId) {
  return (world, engine) => {
    const knowledge = engine.getKnowledge(characterId);
    knowledge.learn(factId);
  };
}
