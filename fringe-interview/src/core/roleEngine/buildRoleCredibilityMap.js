/**
 * FRINGE Role Engine
 *
 * Costruisce una prima Role Credibility Map.
 *
 * Nota importante:
 * nel Core Model il "RoleModel" è sempre un Interview Role Model:
 * non descrive un ruolo astratto, ma ciò che deve emergere
 * in quello specifico colloquio.
 */

const STABLE_DIMENSIONS = [
  {
    id: "narrative_credibility",
    label: "Credibilità narrativa",
    description:
      "Quanto la candidatura riesce a diventare concreta, coerente e credibile attraverso esempi osservabili.",
    importance: "high",
    confidence: 0.9,
    signals: [
      {
        id: "concrete_examples",
        label: "Esempi concreti",
        category: "stable",
        description: "Presenza di episodi reali, non solo dichiarazioni generali.",
        whyItMatters:
          "Un selezionatore ha bisogno di vedere situazioni, responsabilità e risultati.",
        importance: "high",
        confidence: 0.9,
        observableEvidence: [
          {
            evidenceType: "concrete_episode",
            description: "Episodio con contesto, azione personale e risultato.",
            sourcePreference: "answer",
            strengthWeight: 0.9
          }
        ],
        minimumEvidenceCount: 2,
        followupStrategy: "Chiedere un episodio specifico se la risposta resta generale.",
        stopCondition: "Emergono contesto, contributo personale e risultato.",
        source: "fringe_core_model",
        extensions: {}
      }
    ]
  },
  {
    id: "professional_maturity",
    label: "Maturità professionale",
    description:
      "Quanto la risposta rende visibile il modo in cui il candidato ragiona, decide e gestisce complessità.",
    importance: "high",
    confidence: 0.9,
    signals: [
      {
        id: "decision_making",
        label: "Decisione e trade-off",
        category: "stable",
        description: "Capacità di spiegare scelte, criteri e conseguenze.",
        whyItMatters:
          "Nei ruoli mid/senior conta non solo cosa è stato fatto, ma come sono state prese le decisioni.",
        importance: "high",
        confidence: 0.9,
        observableEvidence: [
          {
            evidenceType: "decision",
            description: "Decisione presa con alternative, criterio e conseguenza.",
            sourcePreference: "answer",
            strengthWeight: 1
          }
        ],
        minimumEvidenceCount: 1,
        followupStrategy: "Chiedere quali alternative c'erano e perché è stata scelta una strada.",
        stopCondition: "È chiaro il criterio decisionale e l'effetto della scelta.",
        source: "fringe_core_model",
        extensions: {}
      }
    ]
  },
  {
    id: "role_specific_competence",
    label: "Competenze specifiche del ruolo",
    description:
      "Segnali specifici richiesti dal ruolo target e dal contesto del colloquio.",
    importance: "high",
    confidence: 0.75,
    signals: []
  },
  {
    id: "fit",
    label: "Fit con il contesto",
    description:
      "Quanto la candidatura appare coerente con contesto, seniority, ambiente e aspettative del ruolo.",
    importance: "medium",
    confidence: 0.75,
    signals: []
  },
  {
    id: "potential",
    label: "Potenziale",
    description:
      "Quanto emergono segnali di apprendimento, adattabilità e possibilità di crescita.",
    importance: "medium",
    confidence: 0.75,
    signals: []
  }
];

const OPERATIONS_SIGNALS = [
  {
    id: "stakeholder_alignment",
    label: "Allineamento stakeholder",
    category: "role_specific",
    description:
      "Capacità di coordinare persone o funzioni con priorità diverse.",
    whyItMatters:
      "Nei ruoli operations/project/process la credibilità passa spesso dalla capacità di far convergere attori diversi verso una priorità operativa.",
    importance: "high",
    confidence: 0.85,
    observableEvidence: [
      {
        evidenceType: "stakeholder_context",
        description: "Episodio con interlocutori, attrito iniziale, criterio di allineamento e risultato.",
        sourcePreference: "answer",
        strengthWeight: 1
      }
    ],
    minimumEvidenceCount: 1,
    followupStrategy:
      "Se la risposta resta generica, chiedere chi erano gli interlocutori, quale attrito esisteva e cosa è cambiato dopo.",
    stopCondition:
      "Emergono contesto, ruolo personale, attrito e risultato.",
    source: "operations_prototype",
    extensions: {}
  },
  {
    id: "operational_decision",
    label: "Decisione operativa",
    category: "role_specific",
    description:
      "Capacità di scegliere tra alternative operative spiegando vincoli, priorità e conseguenze.",
    whyItMatters:
      "Un ruolo operativo credibile deve mostrare capacità di decidere sotto vincoli reali.",
    importance: "high",
    confidence: 0.85,
    observableEvidence: [
      {
        evidenceType: "tradeoff",
        description: "Trade-off con alternative, criterio di scelta, rischio accettato ed effetto finale.",
        sourcePreference: "answer",
        strengthWeight: 1
      }
    ],
    minimumEvidenceCount: 1,
    followupStrategy:
      "Chiedere quali alternative c'erano, perché è stata scelta quella strada e quale rischio è stato accettato.",
    stopCondition:
      "È chiara una scelta personale con criterio e conseguenza.",
    source: "operations_prototype",
    extensions: {}
  },
  {
    id: "process_improvement",
    label: "Miglioramento di processo",
    category: "role_specific",
    description:
      "Capacità di leggere un processo, individuare inefficienze e migliorarlo.",
    whyItMatters:
      "La credibilità operations nasce spesso dalla capacità di trasformare problemi ricorrenti in processi migliori.",
    importance: "medium_high",
    confidence: 0.8,
    observableEvidence: [
      {
        evidenceType: "measurable_result",
        description: "Problema iniziale, intervento, metrica o effetto osservabile.",
        sourcePreference: "answer",
        strengthWeight: 0.9
      }
    ],
    minimumEvidenceCount: 1,
    followupStrategy:
      "Chiedere qual era il problema iniziale, quale intervento è stato fatto e cosa è migliorato.",
    stopCondition:
      "Emergono problema, intervento e risultato osservabile.",
    source: "operations_prototype",
    extensions: {}
  },
  {
    id: "kpi_reporting",
    label: "KPI e reporting",
    category: "role_specific",
    description:
      "Capacità di usare dati e report per orientare decisioni operative.",
    whyItMatters:
      "Nei ruoli operations i dati non devono solo descrivere, ma aiutare a decidere.",
    importance: "medium",
    confidence: 0.75,
    observableEvidence: [
      {
        evidenceType: "cv_signal",
        description: "Dato monitorato, decisione supportata, impatto operativo.",
        sourcePreference: "cv_or_answer",
        strengthWeight: 0.8
      }
    ],
    minimumEvidenceCount: 1,
    followupStrategy:
      "Chiedere quale dato veniva monitorato e quale decisione ha supportato.",
    stopCondition:
      "Il dato è collegato a una decisione o a un impatto operativo.",
    source: "operations_prototype",
    extensions: {}
  },
  {
    id: "ownership",
    label: "Responsabilità personale",
    category: "role_specific",
    description:
      "Chiarezza su cosa dipendeva direttamente dal candidato.",
    whyItMatters:
      "Senza ownership il selezionatore fatica a distinguere esposizione, collaborazione e contributo personale.",
    importance: "high",
    confidence: 0.9,
    observableEvidence: [
      {
        evidenceType: "personal_contribution",
        description: "Attività seguita in prima persona, decisione o contributo diretto, risultato riconducibile.",
        sourcePreference: "answer",
        strengthWeight: 1
      }
    ],
    minimumEvidenceCount: 2,
    followupStrategy:
      "Chiedere quale parte dipendeva direttamente dal candidato.",
    stopCondition:
      "È chiaro il contributo personale rispetto al lavoro del team.",
    source: "fringe_core_model",
    extensions: {}
  }
];

function normalizeRoleFamily(value = "") {
  return String(value || "").trim().toLowerCase();
}

function buildRoleSpecificSignals({ roleFamily = "" } = {}) {
  const cleanRoleFamily = normalizeRoleFamily(roleFamily);

  if (
    cleanRoleFamily === "operations_industrial" ||
    cleanRoleFamily === "operations" ||
    cleanRoleFamily === "product_operations"
  ) {
    return OPERATIONS_SIGNALS;
  }

  return [];
}

export function buildRoleCredibilityMap({
  roleUnderstanding = {},
  candidateContext = {},
  targetContext = {}
} = {}) {
  const roleFamily =
    targetContext?.roleFamily ||
    roleUnderstanding?.roleFamily ||
    "generic_professional";

  const roleSpecificSignals = buildRoleSpecificSignals({ roleFamily });

  const dimensions = STABLE_DIMENSIONS.map((dimension) => {
    if (dimension.id !== "role_specific_competence") {
      return dimension;
    }

    return {
      ...dimension,
      signals: roleSpecificSignals
    };
  });

  return {
    roleTitle:
      targetContext?.targetRole ||
      roleUnderstanding?.targetRole ||
      "",

    seniority:
      targetContext?.seniorityExpected ||
      roleUnderstanding?.seniority ||
      "",

    confidence:
      roleSpecificSignals.length > 0 ? 0.82 : 0.55,

    sourceSummary: {
      roleFamily,
      candidateContextAvailable: Object.keys(candidateContext || {}).length > 0,
      targetContextAvailable: Object.keys(targetContext || {}).length > 0
    },

    dimensions,

    extensions: {}
  };
}

export default buildRoleCredibilityMap;