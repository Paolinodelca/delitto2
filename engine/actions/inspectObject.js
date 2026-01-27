export function inspectObject({ world, knowledge, state }, payload) {
  const { actor, objectId } = payload;

  const object = world.getFact(objectId);

  if (!object) {
    throw new Error("Oggetto inesistente nel world");
  }

  if (!object.inspectable) {
    throw new Error("Oggetto non ispezionabile");
  }

  // Evita ispezioni ripetute inutili
  state.inspectedObjects = state.inspectedObjects || {};
  if (state.inspectedObjects[actor]?.includes(objectId)) {
    throw new Error("Oggetto già ispezionato da questo attore");
  }

  // Registra le proprietà osservabili
  (object.properties || []).forEach(prop => {
    if (prop.observable === true) {
      knowledge.addFor(actor, {
        source: "osservazione",
        type: "ispezione",
        topic: objectId,
        content: prop.key,
        truth: true
      });
    }
  });

  // Aggiorna stato
  state.inspectedObjects[actor] = state.inspectedObjects[actor] || [];
  state.inspectedObjects[actor].push(objectId);

  return { world, knowledge, state };
}
