console.log("SCRIPT JS CARICATO");
/************************************************************
* CAST FISSO — PARAMETRICO
************************************************************/
const SUSPECTS = {
mario: {
id: "mario",
name: "Mario Conti",
role: "custode notturno del teatro",
profile: "uomo nervoso, risposte secche, evita lo sguardo, sembra sapere più di quanto dica"
},
lucia: {
id: "lucia",
name: "Lucia Ferri",
role: "attrice protagonista",
profile: "affascinante, intelligente, tende a manipolare l'interlocutore"
}
};


/************************************************************
* MEMORIA DI SESSIONE — PARAMETRICA
************************************************************/
//let conversationMemory = [];
let conversationMemory = {};

const MAX_MEMORY_MESSAGES = 12;

/*
function addToMemory(role, content) {
conversationMemory.push({ role, content });
if (conversationMemory.length > MAX_MEMORY_MESSAGES) {
conversationMemory = conversationMemory.slice(-MAX_MEMORY_MESSAGES);
}
}
*/
function getMemoryFor(suspectId) {
  if (!conversationMemory[suspectId]) {
    conversationMemory[suspectId] = [];
  }
  return conversationMemory[suspectId];
}

function addToMemory(suspectId, role, content) {
  const memory = getMemoryFor(suspectId);
  memory.push({ role, content });

  if (memory.length > MAX_MEMORY_MESSAGES) {
    conversationMemory[suspectId] = memory.slice(-MAX_MEMORY_MESSAGES);
  }
}



/************************************************************
* INVIO MESSAGGIO — CUORE (GIÀ FUNZIONANTE)
************************************************************/
async function sendMessage() {
  console.log("sendMessage chiamata");

  const input = document.getElementById("message");
  if (!input) {
    console.error("ERRORE: input non trovato");
    return;
  }

  const message = input.value.trim();
  console.log("Testo letto:", message);
  if (!message) return;

  //const suspect = SUSPECTS.mario; // 👈 scegli qui il personaggio
  const suspectId = document.getElementById("suspectSelect").value;
  const suspect = SUSPECTS[suspectId];
  const memory = getMemoryFor(suspectId);

  

  console.log("Invio al backend...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
     /* 
      body: JSON.stringify({
        message,
        suspect,
        memory: conversationMemory
      })
*/
    body: JSON.stringify({
    message,
    suspect,
    memory
    }) //paura per il punto e virgola
 
    });

    console.log("Risposta fetch ricevuta, status:", response.status);

    const data = await response.json();
    console.log("Risposta JSON:", data);
    /*
    addToMemory("user", message);
    addToMemory("assistant", data.reply);
    */
    addToMemory(suspectId, "user", message);
    addToMemory(suspectId, "assistant", data.reply);

    
    /*
    showReply(data.reply);
    speak(data.reply);
*/
   showReply(data.reply);

 //  const spokenText = cleanForSpeech(data.reply);
 //  speak(spokenText);
    
  const spokenText = adaptToSpokenItalian(
  cleanForSpeech(data.reply)
  );

  speak(spokenText);

    
    input.value = "";

  } catch (err) {
    console.error("Errore fetch:", err);
  }
}


/************************************************************
* UI + SINTESI VOCALE (minimale, non toccata ora)
************************************************************/
function showReply(text) {
  const box = document.getElementById("reply");
  if (!box) {
    console.error("Elemento #reply non trovato nel DOM");
    return;
  }
  box.textContent = text;
}


function cleanForSpeech(text) {
  return text
    .replace(/\([^)]*\)/g, "")       // rimuove (pausa), (sospira), ecc.
    .replace(/\[.*?\]/g, "")         // rimuove eventuali [note]
    .replace(/\s+/g, " ")             // spazi doppi
    .trim();
}
function adaptToSpokenItalian(text) {
  return text
    // spezza frasi troppo lunghe
    .replace(/,\s+(che|mentre|quando|perché|dove)/gi, ". ")
    // riduce incisi
    .replace(/;\s*/g, ". ")
    // rende l'intonazione più naturale
    .replace(/\s+e\s+/gi, ", e ")
    .trim();
}



/*
function speak(text) {
const utter = new SpeechSynthesisUtterance(text);
utter.lang = "it-IT";
utter.rate = 0.95;
speechSynthesis.speak(utter);
}
*/
function speak(text) {
  if (!text) return;

  speechSynthesis.cancel(); // evita sovrapposizioni

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "it-IT";
 // utter.rate = 0.9;          // più lento = più credibile
 // utter.pitch = 0.95;        // leggermente più grave
  utter.rate = 0.85;          // più lento = più credibile
  utter.pitch = 0.9;        // leggermente più grave
  utter.volume = 1;

  // Pausa naturale su punti e frasi lunghe
 /*
  utter.text = text
    .replace(/\.\s/g, ".  ")
    .replace(/\?\s/g, "?  ");
*/
  utter.text = text
  .replace(/\.\s*/g, ".   ")
  .replace(/\?\s*/g, "?   ")
  .replace(/!\s*/g, "!   ");

  utter.text = "… " + utter.text;
  
  speechSynthesis.speak(utter);
}

