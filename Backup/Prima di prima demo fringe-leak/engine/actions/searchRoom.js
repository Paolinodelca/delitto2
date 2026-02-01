export function searchRoom({ world, knowledge, state }, payload) {
  const { room, actor } = payload;

  // Inizializza lo stato se serve
  state.searchedRooms = state.searchedRooms || {};

  // Se la stanza è già stata perquisita, non succede nulla
  if (state.searchedRooms[room]) {
    return { world, knowledge, state };
  }

  // Recupera i facts oggettivi legati alla stanza
  const roomFacts = world.getFactsByLocation(room);

  // Trasferisce nella knowledge SOLO facts osservabili
  roomFacts.forEach(fact => {
    if (!fact.observable) return;

    knowledge.addFor(actor, {
      factId: fact.id,
      believedTrue: true,
      source: "observation"
    });
  });

  // Aggiorna lo stato
  state.searchedRooms[room] = true;

  return { world, knowledge, state };
}
