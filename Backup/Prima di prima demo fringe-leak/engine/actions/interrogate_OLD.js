export function interrogate({ world, knowledge, state }, payload) {
  const { target, topic } = payload;

  if (!state.canInterrogate?.[target]) {
    throw new Error("Interrogatorio non consentito");
  }

  const targetKnowledge = knowledge.getKnowledgeOf(target);

  const testimony = targetKnowledge.filter(k =>
    k.topic === topic && k.expressed === true
  );

  knowledge.addFor("giocatore", {
    source: target,
    type: "testimonianza",
    topic,
    content: testimony.map(t => t.claim),
    truth: null
  });

  state.interrogated = state.interrogated || {};
  state.interrogated[target] = true;

  return { world, knowledge, state };
}
