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
let conversationMemory = [];
const MAX_MEMORY_MESSAGES = 12;


function addToMemory(role, content) {
conversationMemory.push({ role, content });
if (conversationMemory.length > MAX_MEMORY_MESSAGES) {
conversationMemory = conversationMemory.slice(-MAX_MEMORY_MESSAGES);
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

  console.log("Invio al backend...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        suspect: "Andrea"
      })
    });

    console.log("Risposta fetch ricevuta, status:", response.status);

    const text = await response.text();
    console.log("Risposta raw dal server:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Risposta NON JSON:", text);
      return;
    }

    console.log("Risposta JSON:", data);

  } catch (err) {
    console.error("Errore fetch:", err);
  }
}




/*async function sendMessage() {
  console.log("sendMessage chiamata");

  const input = document.getElementById("message");
  if (!input) {
    console.log("ERRORE: input non trovato");
    return;
  }

  const text = input.value;
  console.log("Testo letto:", text);

  if (!text || !text.trim()) {
    console.log("Testo vuoto, esco");
    return;
  }

  console.log("Invio al backend...");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        suspect: "maggiordomo"
      })
    });

    console.log("Risposta fetch ricevuta, status:", res.status);

   // const data = await res.json();
const text = await response.text();
console.log("Risposta raw dal server:", text);

let data;
try {
  data = JSON.parse(text);
} catch (e) {
  console.error("Risposta NON JSON:", text);
  return;
}

    

    
    console.log("Dati backend:", data);

  } catch (err) {
    console.error("Errore fetch:", err);
  }
}
*/

/*async function sendMessage(text) {
const suspectSelect = document.getElementById("suspect");
const suspectId = suspectSelect.value;
const suspect = SUSPECTS[suspectId];


addToMemory("user", text);


try {
const res = await fetch("/api/chat", {
method: "POST",
headers: { "Content-Type": "application/json" },
<script src="script.js"></script>
body: JSON.stringify({
message: text,
suspect,
memory: conversationMemory
})
});


if (!res.ok) throw new Error("Risposta non valida");


const data = await res.json();


addToMemory("assistant", data.reply);


showReply(data.reply);
speak(data.reply);


} catch (err) {
showReply("Errore di rete");
}
}
*/

/************************************************************
* UI + SINTESI VOCALE (minimale, non toccata ora)
************************************************************/
function showReply(text) {
const box = document.getElementById("reply");
box.textContent = text;
}


function speak(text) {
const utter = new SpeechSynthesisUtterance(text);
utter.lang = "it-IT";
utter.rate = 0.95;
speechSynthesis.speak(utter);
}
