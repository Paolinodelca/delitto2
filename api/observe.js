module.exports = async function handler(req, res) {
//export default async function handler(req, res) {
try {
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY mancante");
}

console.log("API CHAT AVVIATA");
if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });

}
console.log("BODY RICEVUTO:", req.body);

const { message, suspect, memory } = req.body;
if (!message || !suspect) {
return res.status(400).json({ error: "Dati mancanti" });
}


/************************************************************
* PROMPT NARRATIVO — PARAMETRICO
************************************************************/

const systemPrompt = `
Sei un osservatore cognitivo.

Non giudichi la verità.
Non dai consigli.
Non interpreti intenzioni morali.

Osservi solo come una persona ragiona sotto pressione.

Dato questo scambio di risposte, restituisci SOLO un JSON valido con:

- coerenza: alta | media | bassa
- postura: difensiva | assertiva | evasiva | esplorativa
- segnali_stress: elenco tra
  contraddizione, esitazione, sovragiustificazione, evitamento

Risposte:
1) {{answer1}}
2) {{answer2}}

Restituisci SOLO il JSON.

`;



const messages = [
{ role: "system", content: systemPrompt },
...(memory || []),
{ role: "user", content: message }
];


const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": "Bearer " + apiKey
},
body: JSON.stringify({
model: "llama-3.1-8b-instant",
messages,
temperature: 0.2
})
});


const data = await groqResponse.json();


if (!groqResponse.ok) {
return res.status(500).json({ error: "Errore Groq", details: data });
}


return res.status(200).json({ reply: data.choices[0].message.content });


} catch (err) {
return res.status(500).json({ error: "Errore server", details: err.toString() });
}
}
