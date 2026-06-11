import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import buildCvReviewReportV1 from "../src/report/buildCvReviewReportV1.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function main() {
  const outputDir = resolveProjectPath("tmp", "cv-review-giulia");
  await mkdir(outputDir, { recursive: true });

  const candidateProfile = {
    summary:
      "Professionista con solida formazione scientifica e psicologica, esperienza continuativa in ambito logistico-amministrativo e recente forte orientamento verso psicologia, counseling, sostegno alla persona, autismo e contesti educativi. Include anche un’esperienza Erasmus presso University of St Andrews in Scozia.",
    currentPositioning:
      "Psicologa in formazione psicoterapeutica, con esperienza in counseling, tirocini in ambito psicologico/educativo e lunga esperienza lavorativa part-time.",
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

  const targets = [
    "servizi educativi per infanzia e famiglie",
    "sportelli di ascolto e prevenzione per giovani",
    "servizi educativi individuali e di gruppo per persone con disabilità"
  ];

  const discoveryReport = buildCvReviewReportV1({
  candidateProfile,
  roleFamily: "care_helping_professions",
  targetRole: ""
});

const reports = [
  discoveryReport,
  ...targets.map((targetRole) =>
    buildCvReviewReportV1({
      candidateProfile,
      roleFamily: "care_helping_professions",
      targetRole
    })
  )
];

  await writeFile(
    path.join(outputDir, "cv_review_giulia.json"),
    JSON.stringify({ reports }, null, 2),
    "utf8"
  );

  console.log("✅ CV Review Giulia built:");
  console.log(path.join(outputDir, "cv_review_giulia.json"));
}

main().catch((error) => {
  console.error("test_build_cv_review_giulia failed.");
  console.error(error);
  process.exit(1);
});