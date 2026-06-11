const ROLE_FAMILY_NARRATIVE_PROFILES = {
  generic_professional: {
    it: {
      label: "profilo professionale generale",
      vocabulary: ["responsabilità", "continuità", "collaborazione", "metodo"],
      credibilityFocus: ["esperienza", "affidabilità", "contributo", "trasferibilità"],
      riskFocus: ["profilo troppo generico", "contributo poco visibile"],
      rewriteProfile:
      "Professionista con formazione psicologica e relazionale orientata ai servizi educativi, al sostegno della persona e ai contesti di aiuto.",

      rewriteSkills: [
      "Ascolto e relazione di aiuto",
      "Sostegno alla persona",
      "Collaborazione in contesti educativi",
      "Lavoro con famiglie e situazioni di fragilità",
      "Formazione continua e aggiornamento professionale"
      ],

      rewriteKeywords: [
      "educazione",
      "sostegno",
      "relazione",
      "famiglie",
      "fragilità"
      ],

      
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["ruoli coerenti con esperienza, competenze e contesto"]
      },
    en: {
      label: "general professional profile",
      vocabulary: ["responsibility", "continuity", "collaboration", "method"],
      credibilityFocus: ["experience", "reliability", "contribution", "transferability"],
      riskFocus: ["profile too generic", "contribution not visible enough"],
      rewriteProfile:
      "Professional with psychological and relational training, oriented towards educational services, personal support and helping contexts.",

      rewriteSkills: [
     "Listening and helping relationship",
     "Personal support",
     "Collaboration in educational settings",
     "Working with families and vulnerable situations",
     "Continuous professional development"
  ],

  rewriteKeywords: [

  "education",
  "support",
  "relationship",
  "families",
  "vulnerability"
  ],



      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["roles aligned with experience, skills and context"]
    }
  },

  operations_logistics_industrial: {
    it: {
      label: "operations, logistica e industria",
      vocabulary: ["processi", "priorità", "coordinamento", "logistica", "produzione", "dogane", "supply chain"],
      credibilityFocus: ["presidio operativo", "gestione delle priorità", "continuità esecutiva", "coordinamento"],
      riskFocus: ["impatto poco visibile", "responsabilità operative non esplicitate", "risultati non quantificati"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["operations", "logistica", "supply chain", "coordinamento operativo", "back office operativo"]
    },
    en: {
      label: "operations, logistics and industrial",
      vocabulary: ["processes", "priorities", "coordination", "logistics", "production", "customs", "supply chain"],
      credibilityFocus: ["operational ownership", "priority management", "execution continuity", "coordination"],
      riskFocus: ["impact not visible enough", "operational responsibility not explicit", "results not quantified"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["operations", "logistics", "supply chain", "operational coordination", "operational back office"]
    }
  },

  administration_finance_backoffice: {
    it: {
      label: "amministrazione, finanza e back office",
      vocabulary: ["amministrazione", "contabilità", "pratiche", "contratti", "precisione", "scadenze", "documentazione"],
      credibilityFocus: ["precisione", "affidabilità", "rispetto delle scadenze", "gestione documentale"],
      riskFocus: ["attività descritte ma poco valorizzate", "responsabilità non distinguibili", "impatto organizzativo poco visibile"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["amministrazione", "contabilità", "back office", "gestione pratiche", "servizi amministrativi"]
    },
    en: {
      label: "administration, finance and back office",
      vocabulary: ["administration", "accounting", "case handling", "contracts", "accuracy", "deadlines", "documentation"],
      credibilityFocus: ["accuracy", "reliability", "deadline management", "document handling"],
      riskFocus: ["activities described but not valued", "responsibilities not clearly distinguishable", "organizational impact not visible"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["administration", "accounting", "back office", "case handling", "administrative services"]
    }
  },

  analytical_business: {
    it: {
      label: "analisi, business e dati",
      vocabulary: ["analisi", "dati", "reporting", "indicatori", "dashboard", "decisioni", "metriche"],
      credibilityFocus: ["lettura dei dati", "supporto decisionale", "chiarezza informativa", "metodo analitico"],
      riskFocus: ["impatto delle analisi poco esplicitato", "decisioni influenzate non visibili", "contesto business poco chiaro"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["business analyst", "data analyst", "reporting", "controllo di gestione", "business intelligence"]
    },
    en: {
      label: "analytics, business and data",
      vocabulary: ["analysis", "data", "reporting", "indicators", "dashboards", "decisions", "metrics"],
      credibilityFocus: ["data interpretation", "decision support", "information clarity", "analytical method"],
      riskFocus: ["impact of analysis not explicit", "influenced decisions not visible", "business context unclear"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["business analyst", "data analyst", "reporting", "management control", "business intelligence"]
    }
  },

  sales_commercial_retail: {
    it: {
      label: "vendite, commerciale e retail",
      vocabulary: ["cliente", "vendita", "negoziazione", "obiettivi", "fiducia", "contratti", "retail"],
      credibilityFocus: ["relazione con il cliente", "capacità commerciale", "negoziazione", "orientamento al risultato"],
      riskFocus: ["risultati commerciali non evidenziati", "tipologia di vendita poco chiara", "valore della relazione cliente poco visibile"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["vendite", "retail", "account", "business development", "consulenza commerciale"]
    },
    en: {
      label: "sales, commercial and retail",
      vocabulary: ["customer", "sales", "negotiation", "targets", "trust", "contracts", "retail"],
      credibilityFocus: ["customer relationship", "commercial ability", "negotiation", "result orientation"],
      riskFocus: ["sales results not highlighted", "sales type unclear", "customer relationship value not visible"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["sales", "retail", "account management", "business development", "commercial consulting"]
    }
  },

  customer_service_success: {
    it: {
      label: "customer service e customer success",
      vocabulary: ["cliente", "assistenza", "richieste", "supporto", "continuità", "problemi", "servizio"],
      credibilityFocus: ["gestione della relazione cliente", "capacità di supporto", "continuità del servizio", "problem solving"],
      riskFocus: ["complessità gestita poco visibile", "impatto sulla soddisfazione cliente non esplicitato", "autonomia poco chiara"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["customer care", "customer service", "customer success", "supporto clienti", "front office"]
    },
    en: {
      label: "customer service and customer success",
      vocabulary: ["customer", "support", "requests", "assistance", "continuity", "issues", "service"],
      credibilityFocus: ["customer relationship management", "support ability", "service continuity", "problem solving"],
      riskFocus: ["managed complexity not visible", "customer satisfaction impact not explicit", "autonomy unclear"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["customer care", "customer service", "customer success", "customer support", "front office"]
    }
  },

  care_helping_professions: {
    it: {
      label: "relazione di aiuto, educazione e fragilità",
      vocabulary: ["ascolto", "sostegno", "famiglie", "giovani", "fragilità", "disabilità", "équipe", "relazione di aiuto"],
      credibilityFocus: ["presenza relazionale", "formazione continua", "ascolto", "lavoro in contesti delicati"],
      riskFocus: ["filo conduttore della transizione", "contesti concreti di applicazione", "ruolo professionale da chiarire"],
      riskNarrativeTemplates: {
      careerTransition:
      "Il percorso appare ricco e articolato, ma potrebbe non essere immediatamente evidente quale sia il legame tra le diverse esperienze maturate nel tempo. In assenza di un racconto più esplicito della transizione professionale, alcuni lettori potrebbero faticare a comprendere come formazione, esperienza e direzione futura si integrino in un progetto professionale coerente."
        },
        credibilityNarrativeTemplates: {
    primary:
    "Il profilo costruisce credibilità soprattutto attraverso la capacità di creare relazione, l'investimento continuo nella formazione e l'esperienza maturata in contesti dove ascolto, fiducia e attenzione alla persona assumono un ruolo centrale. Questi elementi possono trasmettere affidabilità, presenza relazionale e disponibilità a lavorare con persone e situazioni complesse."
    },

    rewriteProfile:
  "Professionista con formazione psicologica e relazionale orientata ai servizi educativi, al sostegno della persona e ai contesti di aiuto.",

  rewriteSkills: [
  "Ascolto e relazione di aiuto",
  "Sostegno alla persona",
  "Collaborazione in contesti educativi",
  "Lavoro con famiglie e situazioni di fragilità",
  "Formazione continua e aggiornamento professionale"
  ],

  rewriteKeywords: [
  "educazione",
  "sostegno",
  "relazione",
  "famiglie",
  "fragilità"
  ],

      discoveryDirections: ["servizi per famiglie", "sportelli di ascolto", "prevenzione giovani", "supporto educativo", "servizi per disabilità"]
    },
    en: {
      label: "helping, education and vulnerability support",
      vocabulary: ["listening", "support", "families", "young people", "vulnerability", "disability", "team", "helping relationship"],
      credibilityFocus: ["relational presence", "continuous learning", "listening ability", "work in sensitive contexts"],
      riskFocus: ["career transition storyline", "concrete application contexts", "professional role clarity"],
        riskNarrativeTemplates: {
        careerTransition:
         "The profile appears rich and multifaceted, but the connection between the different experiences may not be immediately clear. Without a more explicit career transition storyline, some readers may struggle to understand how education, experience and future direction come together into a coherent professional project."
        },

        credibilityNarrativeTemplates: {
    primary:
    "The profile builds credibility primarily through relational ability, continuous learning and experience gained in contexts where listening, trust and attention to people play a central role. These elements can convey reliability, relational presence and readiness to work with people and complex situations."
    },

    rewriteProfile:
  "Professional with psychological and relational training, oriented towards educational services, personal support and helping contexts.",

  rewriteSkills: [
  "Listening and helping relationship",
  "Personal support",
  "Collaboration in educational settings",
  "Working with families and vulnerable situations",
  "Continuous professional development"
  ],

  rewriteKeywords: [
  "education",
  "support",
  "relationship",
  "families",
  "vulnerability"
  ],

      discoveryDirections: ["family services", "listening desks", "youth prevention", "educational support", "disability services"]
    }
  },

  education_training: {
    it: {
      label: "educazione, formazione e orientamento",
      vocabulary: ["formazione", "apprendimento", "aula", "tutoraggio", "orientamento", "gruppi", "didattica"],
      credibilityFocus: ["capacità formativa", "gestione dell'apprendimento", "facilitazione", "progettazione didattica"],
      riskFocus: ["metodo formativo poco esplicitato", "target dei partecipanti poco chiaro", "risultati formativi non visibili"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["formazione", "tutoraggio", "orientamento", "docenza", "facilitazione di gruppi"]
    },
    en: {
      label: "education, training and guidance",
      vocabulary: ["training", "learning", "classroom", "tutoring", "guidance", "groups", "teaching"],
      credibilityFocus: ["training ability", "learning management", "facilitation", "instructional design"],
      riskFocus: ["training method not explicit", "participant target unclear", "learning outcomes not visible"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["training", "tutoring", "career guidance", "teaching", "group facilitation"]
    }
  },

  technical_engineering_it: {
    it: {
      label: "tecnico, ingegneria e IT",
      vocabulary: ["progettazione", "sviluppo", "qualità", "sistemi", "tecnico", "problem solving", "manutenzione"],
      credibilityFocus: ["competenza tecnica", "qualità della soluzione", "problem solving", "affidabilità tecnica"],
      riskFocus: ["impatto business poco visibile", "contesto tecnico non spiegato", "responsabilità progettuale poco chiara"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["ingegneria", "IT", "sviluppo software", "qualità", "progettazione tecnica", "manutenzione"]
    },
    en: {
      label: "technical, engineering and IT",
      vocabulary: ["design", "development", "quality", "systems", "technical", "problem solving", "maintenance"],
      credibilityFocus: ["technical competence", "solution quality", "problem solving", "technical reliability"],
      riskFocus: ["business impact not visible", "technical context not explained", "project responsibility unclear"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["engineering", "IT", "software development", "quality", "technical design", "maintenance"]
    }
  },

  creative_design_marketing: {
    it: {
      label: "creativo, design e marketing",
      vocabulary: ["concept", "brand", "contenuti", "linguaggio visivo", "campagne", "proposta", "brief"],
      credibilityFocus: ["capacità progettuale", "coerenza del linguaggio", "lettura del brief", "qualità della proposta"],
      riskFocus: ["impatto della proposta poco visibile", "processo creativo non raccontato", "risultati o pubblico non chiari"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["design", "comunicazione", "marketing", "content creation", "branding", "progettazione creativa"]
    },
    en: {
      label: "creative, design and marketing",
      vocabulary: ["concept", "brand", "content", "visual language", "campaigns", "proposal", "brief"],
      credibilityFocus: ["design ability", "language consistency", "brief interpretation", "proposal quality"],
      riskFocus: ["proposal impact not visible", "creative process not described", "results or audience unclear"],
      credibilityNarrativeTemplates: {
        primary: ""
        },
      discoveryDirections: ["design", "communication", "marketing", "content creation", "branding", "creative design"]
    }
  }
};

export function getRoleFamilyNarrativeProfile(roleFamily = "generic_professional", locale = "it") {
  const profile =
    ROLE_FAMILY_NARRATIVE_PROFILES[roleFamily] ||
    ROLE_FAMILY_NARRATIVE_PROFILES.generic_professional;

  return profile[locale] || profile.it || ROLE_FAMILY_NARRATIVE_PROFILES.generic_professional.it;
}

export default getRoleFamilyNarrativeProfile;