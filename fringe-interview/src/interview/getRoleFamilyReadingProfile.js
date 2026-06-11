function buildGenericProfile() {
  return {
    familyKey: "generic_professional",
    labels: {
      roleFit: "coerenza con il ruolo",
      ownership: "ownership personale",
      decision: "qualità della decisione",
      pressure: "tenuta sotto pressione",
      context: "contesto di lavoro preferito"
    },
    prompts: {
      opening:
         "Questa domanda serviva a capire subito come il candidato prova a posizionarsi rispetto a un ruolo di coordinamento operativo, esecuzione operativa e gestione delle priorità.",
      roleFit:
        "Questa domanda cercava il collegamento reale tra esperienza pregressa e ruolo target: non solo esperienza, ma trasferibilità credibile.",
      pressure:
        "Questa domanda cercava segnali di tenuta sotto pressione: attrito, resistenza, vincoli e posizione presa dal candidato.",
      ownership:
        "Questa domanda cercava ownership personale: che cosa dipendeva davvero dal candidato e che cosa invece apparteneva al team o al contesto.",
      context:
        "Questa domanda cercava di capire in quale ambiente operativo il candidato rende meglio: livello di autonomia, struttura, ambiguità e tipo di collaborazione."
    },
    readings: {
      contextGood:
        "La risposta è chiara e coerente: emerge un contesto di lavoro preferito con buon livello di autonomia e struttura.",
      contextImprove:
        "Puoi rafforzarla aggiungendo un esempio concreto di contesto reale in cui hai lavorato in questo modo.",
      ownershipGood:
        "La risposta distingue abbastanza bene ciò che dipendeva direttamente dal candidato da ciò che apparteneva al team o al contesto.",
      ownershipImprove:
        "Puoi rafforzarla ancora rendendo più netto il confine tra responsabilità personale, scelta diretta ed esito finale.",
      ownershipFollowup:
        "Il sistema approfondirebbe ancora per verificare quanto questa responsabilità personale si traducesse davvero in decisioni, priorità ed effetti concreti."
    }
  };
}

function buildOperationsProfile() {
  return {
    familyKey: "operations_industrial",
    labels: {
      roleFit: "trasferibilità operativa",
      ownership: "ownership operativa",
      decision: "priorità e trade-off",
      pressure: "tenuta su tempi, vincoli e priorità",
      context: "contesto operativo preferito"
    },
    prompts: {
      opening:
        "Questa domanda serviva a capire subito come il candidato prova a posizionarsi rispetto a un ruolo di coordinamento operativo, esecuzione operativa e gestione delle priorità.",
      roleFit:
        "Questa domanda cercava il collegamento reale tra esperienza pregressa e ruolo target: trasferibilità nella gestione operativa, nel coordinamento e nelle priorità.",
      pressure:
        "Questa domanda cercava segnali di tenuta su priorità, tempi, vincoli e confronto operativo con altri interlocutori.",
      ownership:
        "Questa domanda cercava ownership operativa: che cosa dipendeva davvero dal candidato nella gestione del lavoro e che cosa invece apparteneva al team o al contesto.",
      context:
        "Questa domanda cercava di capire in quale ambiente operativo il candidato rende meglio: livello di autonomia, coordinamento, esecuzione operativa e chiarezza delle priorità."
    },
    readings: {
      contextGood:
        "La risposta è chiara e coerente: emerge un contesto operativo preferito con buon livello di autonomia, ordine e coordinamento.",
      contextImprove:
        "Puoi rafforzarla aggiungendo un esempio concreto di ambiente operativo in cui hai gestito bene priorità, esecuzione operativa o coordinamento.",
      ownershipGood:
        "La risposta distingue abbastanza bene ciò che dipendeva direttamente dal candidato nella gestione operativa da ciò che apparteneva al team o al contesto.",
      ownershipImprove:
        "Puoi rafforzarla ancora rendendo più netto il confine tra responsabilità operativa personale, scelta diretta ed esito finale.",
      ownershipFollowup:
        "Il sistema approfondirebbe ancora per verificare quanto questa ownership operativa si traducesse davvero in priorità, decisioni ed effetti concreti."
    }
  };
}

function buildAnalyticalProfile() {
  return {
    familyKey: "analytical_business",
    labels: {
      roleFit: "trasferibilità analitica",
      ownership: "ownership analitica",
      decision: "criterio decisionale",
      pressure: "tenuta nel confronto sui dati",
      context: "contesto analitico preferito"
    },
    prompts: {
      opening:
        "Questa domanda serviva a capire subito come il candidato prova a posizionarsi rispetto a un ruolo analitico, di reporting o supporto decisionale.",
      roleFit:
        "Questa domanda cercava il collegamento reale tra esperienza pregressa e ruolo target: trasferibilità in analisi, reporting, metriche e lettura dei dati.",
      pressure:
        "Questa domanda cercava segnali di tenuta nel confronto su analisi, metriche, priorità informative e possibili obiezioni agli output prodotti.",
      ownership:
        "Questa domanda cercava ownership analitica: che cosa dipendeva davvero dal candidato nell'analisi o nell'impostazione del reporting e che cosa invece da altri.",
      context:
        "Questa domanda cercava di capire in quale ambiente il candidato rende meglio quando deve analizzare dati, costruire reporting e supportare decisioni."
    },
    readings: {
      contextGood:
        "La risposta è chiara e coerente: emerge un contesto analitico preferito con buon equilibrio tra autonomia, struttura e qualità della lettura.",
      contextImprove:
        "Puoi rafforzarla aggiungendo un esempio concreto di contesto in cui hai lavorato bene con dati, reporting o criteri decisionali.",
      ownershipGood:
        "La risposta distingue abbastanza bene ciò che dipendeva direttamente dal candidato nell'analisi o nell'impostazione del reporting da ciò che apparteneva ad altri.",
      ownershipImprove:
        "Puoi rafforzarla ancora rendendo più netto il confine tra responsabilità analitica personale, criterio usato ed esito finale.",
      ownershipFollowup:
        "Il sistema approfondirebbe ancora per verificare quanto questa ownership analitica si traducesse davvero in criteri, scelte informative ed effetti decisionali."
    }
  };
}

function buildCreativeProfile() {
  return {
    familyKey: "creative_design",
    labels: {
      roleFit: "trasferibilità creativa",
      ownership: "ownership progettuale",
      decision: "scelta progettuale",
      pressure: "tenuta su proposta e confronto",
      context: "contesto creativo preferito"
    },
    prompts: {
      opening:
        "Questa domanda serviva a capire subito come il candidato prova a posizionarsi rispetto a un ruolo creativo, progettuale o di linguaggio visivo.",
      roleFit:
        "Questa domanda cercava il collegamento reale tra esperienza pregressa e ruolo target: trasferibilità creativa, progettuale o di linguaggio.",
      pressure:
        "Questa domanda cercava segnali di tenuta nel confronto su proposta, direzione, feedback o resistenza verso una scelta creativa.",
      ownership:
        "Questa domanda cercava ownership progettuale: quale parte della proposta o della decisione creativa dipendeva davvero dal candidato e quale invece dal contesto o dagli altri.",
      context:
        "Questa domanda cercava di capire in quale ambiente il candidato rende meglio quando deve sviluppare idee, linguaggio e proposta."
    },
    readings: {
      contextGood:
        "La risposta è chiara e coerente: emerge un contesto creativo preferito con buon equilibrio tra autonomia, confronto e sviluppo della proposta.",
      contextImprove:
        "Puoi rafforzarla aggiungendo un esempio concreto di contesto in cui hai lavorato bene sul piano creativo o progettuale.",
      ownershipGood:
        "La risposta distingue abbastanza bene quale parte della proposta dipendeva direttamente dal candidato e quale invece dal contesto o dagli altri.",
      ownershipImprove:
        "Puoi rafforzarla ancora rendendo più netto il confine tra responsabilità progettuale personale, scelta difesa ed esito finale.",
      ownershipFollowup:
        "Il sistema approfondirebbe ancora per verificare quanto questa ownership progettuale si traducesse davvero in scelte, compromessi ed effetti sulla proposta."
    }
  };
}

export function getRoleFamilyReadingProfile(roleFamily = "generic_professional") {
  if (roleFamily === "operations_industrial") {
    return buildOperationsProfile();
  }

  if (roleFamily === "analytical_business") {
    return buildAnalyticalProfile();
  }

  if (roleFamily === "creative_design") {
    return buildCreativeProfile();
  }

  return buildGenericProfile();
}

export default getRoleFamilyReadingProfile;