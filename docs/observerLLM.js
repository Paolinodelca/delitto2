import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/*
  Analisi input: classifica le risposte
*/
function classifyInputs(answers) {
  let qualities = [];

  for (const a of answers) {
    if (!a || a.trim() === "") {
      qualities.push("blank");
    } else if (a.length < 10) {
      qualities.push("nonsense");
    } else if (/idiot|stupid|fuck|cazzo|merda/i.test(a)) {
      qualities.push("hostile");
    } else {
      qualities.push("valid");
    }
  }

  return qualities;
}

/*
  Fallback testuale forte (non generico)
*/
function fallbackObservations(inputQualities) {
  const valid = inputQualities.filter(q => q === "valid").length;

  let baseText =
    valid === 0
      ? "L’assenza di risposte articolate impedisce qualsiasi attribuzione narrativa. Il silenzio diventa l’elemento dominante."
      : "Le risposte consentono una lettura parziale. Il quadro resta coerente ma incompleto.";

  return {
    fringe: baseText,
    psicologico:
      "Assumendo che le risposte riflettano una posizione autentica, emerge una strategia di contenimento: esposizione minima, rischio emotivo controllato.",
    amplificato:
      "Se le risposte fossero una messa in scena o una compilazione casuale, il profilo risultante suggerisce distacco e disimpegno deliberato."
  };
}

/*
  OSSERVAZIONE CON LLM
*/
export async function observeWithLLM(payload) {
  const { pressureLevel, playerModel, answers } = payload;

  const inputQualities = classifyInputs(answers);

  // sicurezza assoluta: se non c'è materiale → fallback
  if (!answers || answers.length === 0) {
    return { osservazioni: fallbackObservations(inputQualities) };
  }

  const prompt = `
Sei un osservatore esterno incaricato di valutare risposte fornite durante
una audizione interna a un'azienda ad alta sicurezza.

Non stabilire cosa è vero.
Valuta come le risposte costruiscono una versione accettabile dei fatti.

Risposte:
${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}

Fornisci tre analisi distinte:

1) FRINGE: lettura istituzionale, prudente.
2) PSICOLOGICO: assumendo che le risposte siano sincere.
3) AMPLIFICATO: assumendo che le risposte siano una messa in scena o casuali.

Ogni risposta deve essere di massimo 3 frasi.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    });

    const text = completion.choices[0].message.content;

    // parsing semplice e robusto
    const parts = text.split(/\n\s*\n/);

    return {
      osservazioni: {
        fringe: parts[0] || "Lettura istituzionale non determinata.",
        psicologico: parts[1] || "Profilo psicologico non determinato.",
        amplificato: parts[2] || "Profilo amplificato non determinato."
      }
    };
  } catch (err) {
    console.error("LLM ERROR:", err);
    return { osservazioni: fallbackObservations(inputQualities) };
  }
}
