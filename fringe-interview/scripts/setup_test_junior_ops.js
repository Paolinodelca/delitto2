import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  "fixtures/test_junior_ops/cv_junior_ops.txt": `Marco Rinaldi
Junior Business Analyst / Operations Assistant

Profilo sintetico
Laureato in Economia aziendale, con circa 1 anno di esperienza tra stage e primo contratto in ambito operations, reporting e supporto ai team commerciali. Ha lavorato soprattutto su raccolta dati, aggiornamento dashboard, preparazione report settimanali e piccole attività di miglioramento operativo.

Esperienze

Operations & Reporting Intern — RetailTech S.r.l.
Milano | 8 mesi
- Raccolta e pulizia dati da file Excel provenienti da negozi e area vendite.
- Aggiornamento settimanale di report su vendite, giacenze e anomalie operative.
- Supporto al responsabile operations nella preparazione di sintesi per riunioni interne.
- Creazione di semplici dashboard Excel per monitorare ritardi di consegna e livelli di stock.
- Collaborazione con customer service e logistica per chiarire alcune discrepanze nei dati.
- Piccolo progetto interno: revisione del file di tracking delle consegne, riducendo errori manuali ricorrenti.

Junior Operations Assistant — NovaHome Marketplace
Torino | 5 mesi
- Supporto operativo al team marketplace.
- Verifica dati prodotto e aggiornamento schede su gestionale interno.
- Monitoraggio ticket aperti tra fornitori, customer care e logistica.
- Preparazione di brevi report sulle categorie prodotto con più reclami.
- Partecipazione a riunioni operative come supporto, senza responsabilità diretta di coordinamento.

Formazione
Laurea triennale in Economia aziendale — Università di Torino

Competenze
- Excel intermedio
- PowerPoint
- basi di SQL
- reporting operativo
- analisi dati descrittiva
- supporto operations
- comunicazione con team interni

Nota di profilo
Il candidato ha potenziale analitico e buona esposizione a dati operativi, ma esperienza ancora junior. Deve rendere più credibile il passaggio verso un ruolo Product Operations spiegando meglio responsabilità, contesto, impatto e apprendimento.
`,
  "fixtures/test_junior_ops/role_junior_product_ops.txt": `Ruolo target: Junior Product Operations Analyst

Descrizione sintetica
La persona supporterà il team Product Operations nel monitoraggio dei processi interni, nella preparazione di report operativi, nell'identificazione di problemi ricorrenti e nel coordinamento con team prodotto, customer care e operations.

Responsabilità principali
- Monitorare KPI operativi e segnalare anomalie.
- Preparare report periodici per il team Product e Operations.
- Supportare analisi su ticket, reclami, tempi di gestione e qualità dati.
- Collaborare con stakeholder interni per chiarire problemi operativi.
- Proporre piccoli miglioramenti di processo basati su evidenze.
- Documentare problemi, decisioni e follow-up.

Requisiti
- 0-2 anni di esperienza in operations, data analysis, business analysis o ruoli simili.
- Buona capacità di lavorare con dati e report.
- Excel buono, SQL base gradito.
- Capacità di comunicare in modo chiaro con team diversi.
- Attitudine analitica, precisione e voglia di apprendere.
`,
  "fixtures/test_junior_ops/answers_junior_ops.json": `{
  "candidateName": "Marco Rinaldi",
  "targetRole": "Junior Product Operations Analyst",
  "answers": [
    {
      "answerIndex": 1,
      "question": "Raccontami il tuo percorso professionale e perché pensi che sia coerente con questo ruolo.",
      "answer": "Ho fatto economia e poi ho avuto alcune esperienze in ambito operations e reporting. Mi sono occupato di dati, report e supporto ai team interni. Penso che questo ruolo sia coerente perché mi interessa lavorare sui processi e usare i dati per migliorare il modo in cui lavora il team."
    },
    {
      "answerIndex": 2,
      "question": "Fammi un esempio concreto di un problema operativo che hai contribuito a risolvere.",
      "answer": "Durante lo stage c'erano diversi file con dati non sempre allineati. Io aiutavo ad aggiornarli e a controllare che fossero corretti. Questo ha reso il lavoro più ordinato e ha aiutato il responsabile ad avere informazioni più chiare."
    },
    {
      "answerIndex": 3,
      "question": "Parlami di una situazione in cui hai dovuto collaborare con persone di team diversi.",
      "answer": "Mi è capitato di parlare con customer service e logistica quando alcuni dati non tornavano. Cercavo di capire dove fosse il problema e poi aggiornavo il file. Non avevo un ruolo di coordinamento, però cercavo di facilitare il passaggio di informazioni."
    },
    {
      "answerIndex": 4,
      "question": "Parlami di una decisione in cui non c’era una risposta chiaramente giusta. Quale trade-off hai scelto e perché?",
      "answer": "In generale penso che bisogna scegliere in base ai dati disponibili e alle priorità del momento. Nel mio caso, quando c'erano anomalie nei report, cercavo prima di sistemare quelle più evidenti e poi eventualmente passavo al resto. Credo sia importante essere pragmatici."
    },
    {
      "answerIndex": 5,
      "question": "Qual è oggi il tuo limite principale rispetto a questo ruolo?",
      "answer": "Sicuramente ho ancora poca esperienza e non ho gestito direttamente progetti grandi. Però sono motivato, imparo velocemente e penso di poter crescere molto se inserito in un team strutturato."
    },
    {
      "answerIndex": 6,
      "question": "Quale messaggio vuoi lasciare al selezionatore prima di chiudere?",
      "answer": "Vorrei dire che sono una persona precisa, motivata e interessata a crescere in ambito operations. Mi piace lavorare con i dati e aiutare i team a capire meglio i problemi. Credo che questo ruolo sia una buona occasione per sviluppare queste capacità."
    }
  ]
}`,
  "fixtures/test_junior_ops/test_meta.json": `{
  "id": "test_junior_ops",
  "candidateName": "Marco Rinaldi",
  "targetRole": "Junior Product Operations Analyst",
  "cvFile": "fixtures/test_junior_ops/cv_junior_ops.txt",
  "roleFile": "fixtures/test_junior_ops/role_junior_product_ops.txt",
  "answersFile": "fixtures/test_junior_ops/answers_junior_ops.json",
  "expectedReading": {
    "seniority": "junior",
    "shouldAvoid": [
      "pretendere leadership senior",
      "pretendere stakeholder management avanzato",
      "ripetere sempre gli stessi segnali CV"
    ],
    "shouldEmphasize": [
      "concretezza degli esempi",
      "responsabilità personale proporzionata al livello junior",
      "contesto operativo",
      "apprendimento",
      "passaggio CV -> ruolo target"
    ]
  }
}`
};

for (const [relativePath, content] of Object.entries(files)) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
  console.log("written:", relativePath);
}

console.log("");
console.log("Junior test fixture installed in fixtures/test_junior_ops/");
console.log("");
console.log("Next:");
console.log("1) Use cv_junior_ops.txt as CV.");
console.log("2) Use role_junior_product_ops.txt as JD / target role.");
console.log("3) Use answers_junior_ops.json as manual reference answers or to adapt your existing runtime test.");
