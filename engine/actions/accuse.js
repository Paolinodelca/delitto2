export function accuse({ world, hypotheses, state }, payload) {
  if (state.phase !== "accusa") {
    throw new Error("Non puoi accusare in questa fase");
  }

  if (state.gameOver) {
    throw new Error("Il gioco è già concluso");
  }

  const { accused, motive, method, time } = payload;

  state.accusation = {
    accused,
    motive,
    method,
    time
  };

  state.gameOver = true;
  state.phase = "chiusura";


  // ===== TEST MANUALE =====
const testAccusation = {
  accused: "dario_rossi",
  motive: "gelosia",
  method: "avvelenamento",
  time: "21_00"
};

// Simulazione chiamata
// accuse({ state, world }, testAccusation);

  return { state };
}

