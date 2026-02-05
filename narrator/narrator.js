function narrate({ state, world }) {
  const lines = [];

  const climate = world.socialClimate || {};
  const tension = climate.tension || 0;
  const trust = climate.trust ?? 1;

  // livello base
  lines.push("L’osservazione prosegue.");

  // TENSIONE
  if (tension > 0.7) {
    lines.push(
      "L’ambiente si irrigidisce.",
      "Le parole vengono trattenute più del necessario."
    );
  } else if (tension > 0.4) {
    lines.push(
      "L’attenzione aumenta.",
      "Ogni risposta sembra avere un peso inaspettato."
    );
  } else {
    lines.push(
      "Il contesto rimane composto.",
      "Le interazioni scorrono senza attrito evidente."
    );
  }

  // FIDUCIA
  if (trust < 0.3) {
    lines.push(
      "La fiducia si è assottigliata.",
      "Le informazioni circolano con cautela, se circolano."
    );
  } else if (trust < 0.6) {
    lines.push(
      "La fiducia non è data per scontata.",
      "Ogni affermazione viene mentalmente verificata."
    );
  }

  // FLAGS EMERGENTI
  if (world.flags?.informationalFriction) {
    lines.push(
      "Le domande non cercano chiarimenti.",
      "Cercano conferme."
    );
  }

  if (world.flags?.atmosphere === "tesa") {
    lines.push(
      "Il silenzio tra una risposta e l’altra si allunga."
    );
  }

  return lines.join(" ");
}

module.exports = {
  narrate
};
