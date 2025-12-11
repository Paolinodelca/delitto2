const API_URL = "/api/chat";
const output = document.getElementById("output");


function appendMessage(text) {
output.innerHTML += "\n\n" + text;
output.scrollTop = output.scrollHeight;
speak(text); // Sintesi vocale
}


async function sendMessage() {
const msg = document.getElementById("message").value.trim();
if (!msg) return;


appendMessage("Tu: " + msg);
document.getElementById("message").value = "";


try {
const res = await fetch(API_URL, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ message: msg })
});


const data = await res.json();


if (data.error) {
appendMessage("Errore: " + data.error);
return;
}


appendMessage("Sospettato: " + data.reply);
} catch (err) {
appendMessage("Errore di rete.");
}
}


// --- SINTESI VOCALE ---
function speak(text) {
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = "it-IT";
utterance.rate = 1.0;
utterance.pitch = 1.0;
speechSynthesis.speak(utterance);
}
