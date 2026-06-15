import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import buildCvReviewReportV1 from "../src/report/buildCvReviewReportV1.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

const targets = [
  "servizi educativi individuali e di gruppo per persone con disabilità"
];

const originalCandidateProfile = {
  summary:
    "Professionista con laurea in Scienze Biologiche, lunga esperienza lavorativa part-time in ambito logistico e doganale, successiva formazione in counseling e laurea in Psicologia. Attualmente impegnata in Scuola di Psicoterapia e Master sullo spettro autistico.",
  currentPositioning:
  "Impiegata part-time nel settore logistico-doganale con recente percorso di formazione psicologica, counseling e psicoterapia.",
  senioritySignal: "mid",
  experienceSignals: {
    yearsDetected: "20+"
  },
  skills: {
    technical: [
      "psicologia",
      "counseling",
      "autismo",
      "sostegno alla persona",
      "relazione di aiuto",
      "logistica",
      "operazioni doganali"
    ],
    soft: [
      "ascolto",
      "mediazione",
      "collaborazione",
      "relazione",
      "adattabilità",
      "lavoro di gruppo",
      "attenzione all'altro"
    ],
    languages: ["Italiano", "Inglese", "Francese", "Spagnolo"]
  }
};

const optimizedDisabilityCandidateProfile = {
  summary:
    "Psicologa in formazione psicoterapeutica orientata ai servizi educativi e al sostegno alla persona. Il profilo valorizza counseling, tirocini psicologici ed educativi, attività psicoeducative con giovani adulti con disturbo dello spettro autistico, inclusione, autonomia e collaborazione con famiglie ed équipe multidisciplinari.",
  currentPositioning:
    "Psicologa in formazione psicoterapeutica nell’area educazione, inclusione e sostegno alla persona, con focus su disabilità, autismo, autonomia e servizi educativi.",
  senioritySignal: "mid",
  experienceSignals: {
    yearsDetected: "20+"
  },
  skills: {
    technical: [
      "psicologia",
      "counseling",
      "autismo",
      "sostegno educativo",
      "disabilità",
      "inclusione",
      "autonomia",
      "intervento psicoeducativo",
      "consultorio familiare",
      "servizi educativi"
    ],
    soft: [
      "ascolto",
      "relazione di aiuto",
      "collaborazione",
      "lavoro in équipe",
      "supporto relazionale",
      "mediazione",
      "attenzione alla persona"
    ],
    languages: ["Italiano", "Inglese", "Francese", "Spagnolo"]
  }
};

function buildReports(candidateProfile) {
  const discoveryReport = buildCvReviewReportV1({
    candidateProfile,
    roleFamily: "care_helping_professions",
    targetRole: ""
  });

  const targetReports = targets.map((targetRole) =>
    buildCvReviewReportV1({
      candidateProfile,
      roleFamily: "care_helping_professions",
      targetRole
    })
  );

  return [discoveryReport, ...targetReports];
}

async function main() {
  const outputDir = resolveProjectPath(
    "tmp",
    "cv-optimization-tests",
    "giulia",
    "comparison"
  );

  await mkdir(outputDir, { recursive: true });

  const originalReports = buildReports(originalCandidateProfile);
  const optimizedReports = buildReports(optimizedDisabilityCandidateProfile);

  const result = {
    case: "giulia_disability_before_after",
    original: {
      label: "CV originale",
      reports: originalReports
    },
    optimized: {
      label: "CV ottimizzato disabilità V2",
      reports: optimizedReports
    }
  };

  await writeFile(
    path.join(outputDir, "giulia_before_after.json"),
    JSON.stringify(result, null, 2),
    "utf8"
  );

  console.log("✅ Giulia before/after CV test built:");
  console.log(path.join(outputDir, "giulia_before_after.json"));
}

main().catch((error) => {
  console.error("test_cv_before_after_giulia failed.");
  console.error(error);
  process.exit(1);
});