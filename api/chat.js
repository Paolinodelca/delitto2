export default async function handler(req, res) {
}


const { message, suspect, memory } = req.body;
if (!message || !suspect) {
return res.status(400).json({ error: "Dati mancanti" });
}


/************************************************************
* PROMPT NARRATIVO — PARAMETRICO
************************************************************/
const systemPrompt = `
Sei ${suspect.name}, ${suspect.role}.


Profilo psicologico:
${suspect.profile}


Regole:
- Non cambiare mai identità
- Rispondi in italiano naturale
- Non usare etichette tipo "Sospettato:" o "Risposta:"
- Ricorda ciò che hai detto prima
- Se menti, fallo in modo plausibile
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
temperature: 0.7
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
