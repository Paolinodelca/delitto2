console.log("SCENA CARICATA");
let gameState = {
  discoveredFacts: [],
  interviewed: [],
  unlockedActions: [],
  timePassed: 0
};


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
async function handlePlayerInput(text) {
  speak("Un momento, prego.");

  const response = await fetch("/api/charles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({
  playerText: text,
  gameState: gameState
})     

     
  /*   
     body: JSON.stringify({
      playerText: text,
      gameState: {} // per ora vuoto, lo useremo dopo
    })
   */  
  });

  const data = await response.json();
  speak(data.reply);
}

/*
function handlePlayerInput(text) {
  const intent = getIntent(text);
  let reply = "";
  let comment = "";

  if (intent === "ALIBI") {
    reply = "Dopo cena sono salito in camera mia. Non mi sentivo bene.";
    comment = "Risposta breve. Troppo controllata.";
    suspect.pressure++;
  } 
  else if (intent === "MOTIVO") {
    reply = "Mio padre ed io avevamo idee diverse. Succede in tutte le famiglie.";
    comment = "Ha evitato accuratamente di parlare di denaro.";
    suspect.pressure++;
  } 
  else {
    reply = "Non capisco dove voglia arrivare.";
    comment = "Sta guadagnando tempo.";
  }

  showAndSpeak(reply, comment);
}
*/
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
