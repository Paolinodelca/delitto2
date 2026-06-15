import loadRoleTargetNarrativeData from "./loadRoleTargetNarrativeData.js";

const ROLE_TARGET_NARRATIVE_PROFILES = {
  care_helping_professions: {
    family_support: {
      it: {
        label: "infanzia, famiglie e genitorialità",
        focus: ["famiglie", "genitorialità", "relazione educativa", "home visiting", "sostegno familiare"],
        skillLabels: [
          "Lavoro con famiglie e contesti educativi",
          "Sostegno alla genitorialità",
          "Relazione educativa",
          "Home visiting e supporto domiciliare",
          "Sostegno familiare"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "childhood, families and parenting support",
        focus: ["families", "parenting", "educational relationship", "home visiting", "family support"],
        skillLabels: [
          "Working with families and educational contexts",
          "Parenting support",
          "Educational relationship building",
          "Home visiting and family outreach",
          "Family support services"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    },

    youth_prevention: {
      it: {
        label: "giovani, ascolto e prevenzione",
        focus: ["giovani", "prevenzione", "sportelli di ascolto", "educazione affettiva", "dipendenze"],
        skillLabels: [
          "Ascolto e supporto a giovani e adolescenti",
          "Prevenzione e promozione del benessere",
          "Sportelli di ascolto",
          "Educazione affettiva e relazionale",
          "Prevenzione delle dipendenze"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "youth, listening and prevention",
        focus: ["young people", "prevention", "listening desks", "affective education", "addictions"],
        skillLabels: [
          "Listening and support for young people and adolescents",
          "Prevention and wellbeing promotion",
          "Youth counselling and listening services",
          "Emotional and relationship education",
          "Addiction prevention"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    },

    disability_support: {
      it: {
        label: "disabilità e sostegno educativo",
        focus: ["disabilità", "sostegno educativo", "autonomia", "inclusione", "progetto educativo"],
        skillLabels: [
          "Sostegno educativo a persone con disabilità",
          "Supporto all’autonomia",
          "Inclusione e partecipazione",
          "Progettazione educativa",
          "Collaborazione con équipe e famiglie"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: [],
        rewriteOutput: {
  professionalProfile:
    "Professionista con formazione psicologica e relazionale, orientata a disabilità e sostegno educativo. Ha sviluppato nel tempo competenze di ascolto, collaborazione e sostegno alla persona attraverso formazione continua, counseling, tirocini e percorsi di specializzazione.",

  trainingOrdering: [
    "Specializzazioni e formazione professionale",
    "Tirocini e attività formative rilevanti",
    "Formazione universitaria",
    "Altra formazione"
    ],

  experienceOrdering: [
    "Esperienze direttamente collegate al target",
    "Esperienze con competenze trasferibili",
    "Esperienze meno rilevanti ma utili come credibilità"
    ]
    }
      },
      en: {
        label: "disability and educational support",
        focus: ["disability", "educational support", "autonomy", "inclusion", "educational project"],
        skillLabels: [
          "Educational support for people with disabilities",
          "Autonomy and independent living support",
          "Inclusion and participation",
          "Educational planning and intervention",
          "Collaboration with families and multidisciplinary teams"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: [],
        rewriteOutput: {
    professionalProfile:
    "Professional with psychological and relational training, oriented towards disability support and educational services. Over time, she has developed listening, collaboration and personal support skills through continuous training, counselling, internships and specialist learning paths.",

    trainingOrdering: [
    "Specialist and professional training",
    "Relevant internships and practical training",
    "University education",
    "Other training"
    ],

    experienceOrdering: [
    "Experiences directly connected to the target",
    "Experiences with transferable skills",
    "Less relevant experiences kept as credibility signals"
    ]
    }
      }
    }
  },

  administration_finance_backoffice: {
    accounting_bookkeeping: {
      it: {
        label: "contabilità e amministrazione",
        focus: ["contabilità", "registrazioni", "scadenze", "precisione", "documentazione"],
        skillLabels: [
          "Gestione contabile e amministrativa",
          "Precisione nella documentazione",
          "Rispetto delle scadenze",
          "Registrazioni e pratiche amministrative",
          "Affidabilità operativa"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "accounting and bookkeeping",
        focus: ["accounting", "bookkeeping entries", "deadlines", "accuracy", "documentation"],
        skillLabels: [
          "Accounting and administrative management",
          "Document accuracy",
          "Deadline management",
          "Bookkeeping entries and administrative procedures",
          "Operational reliability"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    },

    administrative_assistant: {
      it: {
        label: "segreteria e supporto amministrativo",
        focus: ["organizzazione", "pratiche", "agenda", "documentazione", "supporto operativo"],
        skillLabels: [
          "Organizzazione e supporto operativo",
          "Gestione pratiche e documentazione",
          "Supporto amministrativo",
          "Gestione agenda e priorità",
          "Precisione e continuità operativa"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "administrative assistance",
        focus: ["organization", "case handling", "agenda", "documentation", "operational support"],
        skillLabels: [
          "Organization and operational support",
          "Case handling and documentation",
          "Administrative support",
          "Agenda and priority management",
          "Accuracy and operational continuity"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    },

    payroll_hr_admin: {
      it: {
        label: "payroll e amministrazione HR",
        focus: ["paghe", "presenze", "contratti", "scadenze", "amministrazione del personale"],
        skillLabels: [
          "Amministrazione del personale",
          "Gestione presenze e scadenze",
          "Supporto payroll",
          "Documentazione contrattuale",
          "Precisione nella gestione HR amministrativa"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "payroll and HR administration",
        focus: ["payroll", "attendance", "contracts", "deadlines", "HR administration"],
        skillLabels: [
          "HR administration",
          "Attendance and deadline management",
          "Payroll support",
          "Contract documentation",
          "Accuracy in HR administrative processes"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    }
  },

  sales_commercial_retail: {
    retail_sales: {
      it: {
        label: "vendita retail e negozio",
        focus: ["cliente", "vendita assistita", "negozio", "obiettivi", "fidelizzazione"],
        skillLabels: [
          "Relazione con il cliente",
          "Vendita assistita",
          "Gestione del punto vendita",
          "Orientamento agli obiettivi",
          "Fidelizzazione del cliente"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "retail and store sales",
        focus: ["customer", "assisted sales", "store", "targets", "loyalty"],
        skillLabels: [
          "Customer relationship",
          "Assisted sales",
          "Store operations",
          "Target orientation",
          "Customer loyalty"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    },

    b2b_sales: {
      it: {
        label: "vendita B2B e sviluppo commerciale",
        focus: ["clienti business", "sviluppo commerciale", "negoziazione", "relazione", "obiettivi"],
        skillLabels: [
          "Sviluppo commerciale",
          "Gestione clienti business",
          "Negoziazione",
          "Costruzione della relazione commerciale",
          "Orientamento agli obiettivi"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "B2B sales and business development",
        focus: ["business clients", "business development", "negotiation", "relationship", "targets"],
        skillLabels: [
          "Business development",
          "Business client management",
          "Negotiation",
          "Commercial relationship building",
          "Target orientation"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    },

    insurance_financial_sales: {
      it: {
        label: "vendita assicurativa e finanziaria",
        focus: ["polizze", "consulenza", "contratti", "fiducia", "cliente"],
        skillLabels: [
          "Consulenza al cliente",
          "Vendita di polizze e servizi finanziari",
          "Gestione contratti",
          "Costruzione della fiducia",
          "Analisi delle esigenze del cliente"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "insurance and financial sales",
        focus: ["insurance policies", "consulting", "contracts", "trust", "customer"],
        skillLabels: [
          "Customer consulting",
          "Insurance and financial product sales",
          "Contract management",
          "Trust building",
          "Customer needs analysis"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    }
  },

  technical_engineering_it: {
    software_development: {
      it: {
        label: "sviluppo software",
        focus: ["codice", "sviluppo", "architettura", "debug", "qualità"],
        skillLabels: [
          "Sviluppo software",
          "Qualità del codice",
          "Problem solving tecnico",
          "Debug e manutenzione",
          "Collaborazione su architetture e soluzioni"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "software development",
        focus: ["code", "development", "architecture", "debugging", "quality"],
        skillLabels: [
          "Software development",
          "Code quality",
          "Technical problem solving",
          "Debugging and maintenance",
          "Collaboration on architectures and solutions"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    },

    it_support_systems: {
      it: {
        label: "supporto IT e sistemi",
        focus: ["supporto tecnico", "sistemi", "ticket", "continuità", "risoluzione problemi"],
        skillLabels: [
          "Supporto tecnico",
          "Gestione ticket",
          "Risoluzione problemi",
          "Continuità operativa dei sistemi",
          "Assistenza agli utenti"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "IT support and systems",
        focus: ["technical support", "systems", "tickets", "continuity", "troubleshooting"],
        skillLabels: [
          "Technical support",
          "Ticket management",
          "Troubleshooting",
          "System operational continuity",
          "User assistance"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    },

    industrial_engineering: {
      it: {
        label: "ingegneria industriale e tecnica",
        focus: ["processi", "progettazione", "qualità", "impianti", "miglioramento"],
        skillLabels: [
          "Progettazione tecnica",
          "Miglioramento dei processi",
          "Qualità e controllo tecnico",
          "Gestione impianti o sistemi",
          "Problem solving ingegneristico"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "industrial and technical engineering",
        focus: ["processes", "design", "quality", "plants", "improvement"],
        skillLabels: [
          "Technical design",
          "Process improvement",
          "Quality and technical control",
          "Plant or system management",
          "Engineering problem solving"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    }
  },

  analytical_business: {
    business_analysis: {
      it: {
        label: "business analysis",
        focus: ["analisi", "processi", "requisiti", "stakeholder", "decisioni"],
        skillLabels: [
          "Analisi dei processi",
          "Raccolta e lettura dei requisiti",
          "Interazione con stakeholder",
          "Supporto alle decisioni",
          "Traduzione dei bisogni in azioni operative"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "business analysis",
        focus: ["analysis", "processes", "requirements", "stakeholders", "decisions"],
        skillLabels: [
          "Process analysis",
          "Requirements gathering and interpretation",
          "Stakeholder interaction",
          "Decision support",
          "Translation of needs into operational actions"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    },

    data_reporting: {
      it: {
        label: "data reporting e business intelligence",
        focus: ["dati", "reporting", "dashboard", "indicatori", "lettura dei risultati"],
        skillLabels: [
          "Analisi dati",
          "Reporting e dashboard",
          "Lettura degli indicatori",
          "Business intelligence",
          "Sintesi dei risultati"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "data reporting and business intelligence",
        focus: ["data", "reporting", "dashboards", "indicators", "result interpretation"],
        skillLabels: [
          "Data analysis",
          "Reporting and dashboards",
          "Indicator interpretation",
          "Business intelligence",
          "Result synthesis"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    },

    project_operations: {
      it: {
        label: "project operations",
        focus: ["coordinamento", "priorità", "delivery", "processi", "stakeholder"],
        skillLabels: [
          "Coordinamento operativo",
          "Gestione priorità",
          "Supporto alla delivery",
          "Presidio dei processi",
          "Interazione con stakeholder"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      },
      en: {
        label: "project operations",
        focus: ["coordination", "priorities", "delivery", "processes", "stakeholders"],
        skillLabels: [
          "Operational coordination",
          "Priority management",
          "Delivery support",
          "Process ownership",
          "Stakeholder interaction"
        ],
        credibilityHints: [],
        riskHints: [],
        openingKeywords: []
      }
    }
  }
};

export function getRoleTargetNarrativeProfile({
  roleFamily = "generic_professional",
  roleTarget = "",
  locale = "it"
} = {}) {
  const dataProfile = loadRoleTargetNarrativeData({
    roleFamily,
    roleTarget,
    locale
  });

  if (dataProfile) {
    return dataProfile;
  }

  const familyTargets = ROLE_TARGET_NARRATIVE_PROFILES[roleFamily] || {};
  const targetProfile = familyTargets[roleTarget] || null;

  if (!targetProfile) {
    return null;
  }

  return targetProfile[locale] || targetProfile.it || null;
}

export { ROLE_TARGET_NARRATIVE_PROFILES };
export default getRoleTargetNarrativeProfile;