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
  if (recognition.state === "listening") {
    console.log("🎙️ Riconoscimento già attivo");
    return;
  }
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
  // ❗ NON blocchiamo stringhe vuote o incerte
  if (playerText === null || playerText === undefined) return;

  const normalizedText = playerText.toLowerCase().trim();

  // 🧠 PRE-FILTRO CONVERSAZIONALE (boh, mah, silenzio, ecc.)
  // Questo intercetta SEMPRE l’input, anche se il server non risponde
  if (window.ConversationCore) {
    const localReply = ConversationCore.preProcess(normalizedText);

    if (localReply) {
      console.log("🧠 Risposta locale ConversationCore:", localReply);
      speak(localReply);
      document.getElementById("charlesComment").innerText = localReply;
      return; // ⛔ non andiamo al server
    }
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
      console.error("Risposta non valida dal server");
      speak("Si è verificato un problema sul server.");
      return;
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (e) {
      console.error("Errore parsing JSON:", e);
      speak("Il server ha risposto in modo inatteso.");
      return;
    }

    if (data.reply) {
      // 📌 gestione fatti scoperti (se presenti)
      if (Array.isArray(data.usedFacts)) {
        data.usedFacts.forEach(id => {
          if (!gameState.scoperte.fatti.includes(id)) {
            gameState.scoperte.fatti.push(id);
            console.log("📌 Fatto scoperto:", id);
          }
        });
      }

      speak(data.reply);
      document.getElementById("charlesComment").innerText = data.reply;
    } else {
      speak("Temo che qualcosa non abbia funzionato.");
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
