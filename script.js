console.log("SCRIPT VERSIONE 2026-01-01");

console.log("SCENA CARICATA");
let gameState = {
  scoperte: {
    fatti: ["F1", "F2"], // Riccardo + Elena noti all’inizio
    personaggi: [],
    indizi: []
  }
};


gameState.scoperte.fatti.push("F1");


/* =========================
   STATO DEL SOSPETTATO
========================= */

const suspect = {
  name: "Riccardo",
  pressure: 1,
  alibiFalse: true
};

/* =========================
   RICONOSCIMENTO VOCALE
========================= */

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "it-IT";
recognition.interimResults = false;

function startListening() {
  try {
    recognition.abort(); // chiude eventuali sessioni pendenti
  } catch (e) {}

  recognition.start();
}


recognition.onresult = (event) => {
  const text = event.results[0][0].transcript;
  document.getElementById("playerText").textContent = text;
  handlePlayerInput(text);
};

/* =========================
   INTERPRETAZIONE SEMPLICE
========================= */

function getIntent(text) {
  text = text.toLowerCase();
  if (text.includes("ieri") || text.includes("sera")) return "ALIBI";
  if (text.includes("soldi") || text.includes("azienda")) return "MOTIVO";
  return "GENERICA";
}

/* =========================
   LOGICA DELLA SCENA
========================= */
async function handlePlayerInput(playerText) {
  if (playerText === null || playerText === undefined) return;

  const text = playerText.toLowerCase().trim();

  // 🧠 GESTIONE LOCALE INCERTEZZA (boh, mah, silenzio)
  const uncertaintyWords = [
    "boh",
    "mah",
    "non so",
    "non lo so",
    "non ricordo",
    "non saprei",
    "non ne ho idea"
  ];

  if (text === "" || uncertaintyWords.includes(text)) {
    const reply = "Charles: Va bene. Prenditi pure un momento. Io sono qui.";
    speak(reply);
    document.getElementById("charlesComment").innerText = reply;
    return; // ⛔ stop totale, niente server
  }

  speak("Un momento, prego.");

  try {
    const response = await fetch("/api/charles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerText: playerText,
        gameState: gameState
      })
    });

    const rawResponse = await response.text();
    console.log("STATUS:", response.status);
    console.log("RAW RESPONSE:", rawResponse);

    if (!response.ok) {
      speak("C'è stato un problema nel sistema.");
      return;
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      speak("Il server ha risposto in modo inatteso.");
      return;
    }

    if (data.reply) {
      speak(data.reply);
      document.getElementById("charlesComment").innerText = data.reply;
    } else {
      speak("Non ho una risposta chiara al momento.");
    }

  } catch (error) {
    console.error("Errore client:", error);
    speak("Si è verificato un problema tecnico.");
  }
}





////////
// (codice rimosso – parsing JSON già gestito sopra)


/* =========================
   VOCE
========================= */

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "it-IT";
  utter.rate = 0.9;
  utter.pitch = 0.8;
  speechSynthesis.speak(utter);
}

/* =========================
   OUTPUT
========================= */

function showAndSpeak(reply, comment) {
  document.getElementById("suspectReply").textContent = reply;
  document.getElementById("charlesComment").textContent = comment;

  speak(reply);
  setTimeout(() => speak(comment), 1200);
}
