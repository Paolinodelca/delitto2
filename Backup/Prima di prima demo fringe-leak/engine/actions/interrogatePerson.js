export function interrogatePerson({ world, knowledge, state }, payload) {
  const { actor, target, statement } = payload;

  if (!actor || !target || !statement) {
    throw new Error("Payload interrogatePerson incompleto");
  }

  const { topic, content, truth } = statement;

  if (!topic || !content) {
    throw new Error("Statement non valido");
  }

  // Registra la testimonianza nella knowledge dell’attore
  knowledge.addFor(actor, {
    source: "testimonianza",
    from: target,
    topic,
    content,
    truth: truth ?? null // null = ignoto / non verificabile
  });

  // Traccia interrogatori già avvenuti (per gating futuro)
  state.interrogations = state.interrogations || [];
  state.interrogations.push({
    actor,
    target,
    topic
  });

  return { world, knowledge, state };
}
