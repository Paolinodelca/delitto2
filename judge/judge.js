export function judgeGame({ world, state }) {
  if (!state.accusation) {
    throw new Error("Nessuna accusa da giudicare");
  }

  const accusation = state.accusation;

  const truth = {
    accused: world.getFactById("murderer")?.value,
    motive: world.getFactById("motive")?.value,
    method: world.getFactById("method")?.value,
    time: world.getFactById("time")?.value
  };

  const weights = {
    accused: 50,
    motive: 20,
    method: 20,
    time: 10
  };

  let score = 0;
  const breakdown = {};

  Object.keys(weights).forEach(key => {
    const correct = accusation[key] === truth[key];
    breakdown[key] = correct;
    if (correct) score += weights[key];
  });

  return {
    status: "completed",
    success: breakdown.accused === true,
    score,
    breakdown,
    accusation,
    truth
  };
}


