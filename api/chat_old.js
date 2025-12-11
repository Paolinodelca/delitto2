import Groq from "groq-sdk";


export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Solo POST consentito" });
}


const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
return res.status(500).json({ error: "GROQ_API_KEY mancante su Vercel" });
}


const { message } = req.body;


const client = new Groq({ apiKey });


try {
const completion = await client.chat.completions.create({
model: "llama3-8b-8192",
messages: [
{
role: "system",
content:
`Sei il sistema interrogatorio del caso fisso "Omicidio Marconi".
La vittima è Elena Marconi, dirigente biotech, uccisa tra le 20:45 e le 21:15.
I sospettati sono:
1) Andrea (marito, controllato, risposte fredde)
2) Giulia (collega, logorroica, nasconde ansia)
3) Carlo (giardiniere, parla poco, osserva molto)
Rispondi sempre come il sospettato attualmente interrogato.
Non rivelare mai la soluzione.
Mantieni toni cinematografici.`
},
{
role: "user",
content: message
}
]
});


const reply = completion.choices[0].message.content;


res.status(200).json({ reply });
} catch (err) {
res.status(500).json({ error: "Errore Groq", details: err.message });
}
}
