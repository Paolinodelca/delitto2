# FRINGE_DATA_MODEL.md

## Scopo

Definire gli oggetti dati principali di FRINGE.

Questo documento impedisce la proliferazione di oggetti duplicati come:
- competencies
- skills
- roleSignals
- targetCapabilities
- expectedSignals

Ogni nuovo concetto di dominio deve trovare posto qui prima di entrare nel codice.

---

# Principio base

FRINGE confronta due mappe.

1. Role Credibility Map  
   cosa il ruolo richiede per risultare credibili.

2. Observed Evidence Map  
   cosa il candidato ha realmente reso osservabile.

Il report nasce dal delta tra queste due mappe.

---

# 1. Candidate Context

Descrive il candidato prima del colloquio.

Non valuta.

Raccoglie contesto.

```js
candidateContext = {
  profileSummary,
  senioritySignals,
  cvSignals,
  experienceAreas,
  careerDirection,
  constraints,
  rawCvEvidence,
  extensions
}
2. Target Context

Descrive il target.

targetContext = {
  targetRole,
  seniorityExpected,
  industry,
  companyContext,
  jobDescriptionQuality,
  availableSources,
  uncertaintyFlags,
  extensions
}
3. Role Credibility Map

Descrive cosa deve emergere per quel ruolo.

roleCredibilityMap = {
  roleTitle,
  seniority,
  confidence,
  sourceSummary,

  stablePillars: [
    "narrative_credibility",
    "professional_maturity",
    "potential",
    "fit"
  ],

  roleSpecificSignals: [
    {
      key,
      label,
      category,
      importance,
      source,
      confidence,
      whatMustEmerge,
      evidenceExpected,
      extensions
    }
  ],

  extensions
}
4. Observed Evidence Map

Descrive ciò che è emerso.

observedEvidenceMap = {
  evidenceItems: [
    {
      id,
      sourceType,
      sourceRef,
      pillar,
      signalKey,
      text,
      strength,
      confidence,
      observedStatus,
      extensions
    }
  ],

  notObserved: [
    {
      signalKey,
      reason,
      confidence,
      extensions
    }
  ],

  extensions
}

Valori ammessi per observedStatus:

observed
inferred
hypothesized
not_observed
5. Visibility Map

Non chiamarla solo Gap Map.

Descrive cosa arriva e cosa non arriva ancora.

visibilityMap = {
  visibleStrengths,
  underVisibleSignals,
  unsupportedRoleRequirements,
  recoverableSignals,
  overClaimRisk,
  priorityOpportunities,
  extensions
}
6. Action Plan

Trasforma la lettura in azione.

actionPlan = {
  priorities,
  answerStrategy,
  cvStrategy,
  checklist,
  nextBestActions,
  extensions
}
7. Report View

È la forma leggibile del report.

Non deve contenere nuova logica di valutazione.

reportView = {
  overview,
  professionalPerception,
  answers,
  cv,
  checklist,
  premiumTeasers,
  extensions
}
Regola extensions

Ogni oggetto principale può avere extensions.

extensions serve per:

esperimenti;
beta;
feature temporanee;
dati non ancora stabilizzati.

Regole:

extensions non deve essere necessario al core.
extensions non deve essere usato come scorciatoia permanente.
ogni chiave deve avere owner e purpose.
se una chiave viene usata stabilmente in più parti del sistema, deve essere promossa nello schema ufficiale.
Regola finale

Il renderer non interpreta il candidato.

Il renderer mostra il reportView.

La logica vive prima:
Role Credibility Map
+
Observed Evidence Map
+
Visibility Map
+
Action Plan