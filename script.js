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
async function sendMessage(text) {
const suspectSelect = document.getElementById("suspect");
const suspectId = suspectSelect.value;
const suspect = SUSPECTS[suspectId];


addToMemory("user", text);


try {
const res = await fetch("/api/chat", {
method: "POST",
headers: { "Content-Type": "application/json" },
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
