const { applyHypotheses } = require("./hypotheses");

function computeHypothesisPressure(hypotheses) {
  let pressure = 0;

  for (const h of hypotheses) {
    // peso base dell’ipotesi
    const weight = h.weight || 1;

    // quanto è esposta nel tempo
    const exposure = h.exposure || 1;

    pressure += weight * exposure;
  }

  return pressure;
}

function applyHypothesisConsequences({ state, world }) {
  const hypotheses = state.hypotheses || [];
  const pressure = computeHypothesisPressure(hypotheses);

  // inizializziamo il contenitore se non esiste
  if (!world.socialClimate) {
    world.socialClimate = {
      tension: 0,
      trust: 1
    };
  }

  // la tensione cresce con la pressione
  world.socialClimate.tension = Math.min(
    1,
    world.socialClimate.tension + pressure * 0.05
  );

  // la fiducia cala lentamente
  world.socialClimate.trust = Math.max(
    0,
    world.socialClimate.trust - pressure * 0.03
  );

  // effetti emergenti (non binari)
  if (world.socialClimate.tension > 0.6) {
    world.flags = world.flags || {};
    world.flags.atmosphere = "tesa";
  }

  if (world.socialClimate.trust < 0.4) {
    world.flags = world.flags || {};
    world.flags.informationalFriction = true;
  }
}

function runEngine({ state, world, action }) {
  // applica l’azione
  const result = action({ state, world });

  // aggiorna le ipotesi
  applyHypotheses({ state, world });

  // 🔥 NUOVO LIVELLO: il mondo reagisce alle ipotesi
  applyHypothesisConsequences({ state, world });

  return result;
}

module.exports = {
  runEngine
};
