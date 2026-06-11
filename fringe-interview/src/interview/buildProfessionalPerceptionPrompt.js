import { loadProfessionalPerceptionSchema } from "./loadProfessionalPerceptionSchema.js";
import { getAppLocaleConfig } from "../i18n/getAppLocale.js";

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeJsonStringify(value) {
  return JSON.stringify(value, null, 2);
}

function getActiveLocale(localeKey) {
  if (typeof localeKey === "string" && localeKey.trim()) {
    return localeKey.trim();
  }

  const config = getAppLocaleConfig();

  if (typeof config?.defaultLocale === "string" && config.defaultLocale.trim()) {
    return config.defaultLocale.trim();
  }

  return "it";
}

function buildLanguageInstruction(locale) {
  if (locale === "it") {
    return [
      "Scrivi tutti i campi testuali dell'output in italiano.",
      "Mantieni i nomi delle chiavi JSON invariati."
    ].join(" ");
  }

  return [
    "Write all textual output fields in English.",
    "Keep JSON key names unchanged."
  ].join(" ");
}

function hasMeaningfulTargetRole({ roleTitle, rawInput = {}, overall = {} }) {
  const candidates = [
    roleTitle,
    rawInput?.targetRole,
    rawInput?.roleTitle,
    overall?.roleTitle
  ]
    .map(normalizeString)
    .filter(Boolean);

  if (candidates.length === 0) {
    return false;
  }

  const combined = candidates.join(" ").toLowerCase();

  const weakTargets = [
    "non so",
    "da definire",
    "qualsiasi",
    "generico",
    "open",
    "nessuno",
    "not sure",
    "any",
    "unknown",
    "undefined"
  ];

  return !weakTargets.some((item) => combined.includes(item));
}

export async function buildProfessionalPerceptionPrompt({
  finalCandidateReport = {},
  runtimeAnswers = [],
  rawInput = {},
  candidateProfile = {},
  roleFamily = "generic_professional",
  roleFamilyConfidence = 0,
  localeKey = "it"
}) {

  const schema = await loadProfessionalPerceptionSchema();
  const locale = getActiveLocale(localeKey);

  const overall = finalCandidateReport?.overall || {};
  const roleFit = finalCandidateReport?.roleFit || {};
  const questionQuality = finalCandidateReport?.questionQuality || {};
  const cvAdvice = finalCandidateReport?.cvAdvice || {};
  const runtimeRead = finalCandidateReport?.runtimeRead || {};

  const metrics = overall?.metrics || {};
  const roleTitle =
    normalizeString(overall?.roleTitle) ||
    normalizeString(metrics?.["Ruolo target"]) ||
    normalizeString(rawInput?.targetRole);

  const targetMode = hasMeaningfulTargetRole({
    roleTitle,
    rawInput,
    overall
  })
    ? "target_role"
    : "open_direction";

  const compactAnswers = ensureArray(runtimeAnswers)
    .slice(0, 8)
    .map((answer, index) => ({
      index: index + 1,


      question:
  normalizeString(answer?.questionText) ||
  normalizeString(answer?.questionPrompt) ||
  normalizeString(answer?.prompt) ||
  normalizeString(answer?.question?.text) ||
  normalizeString(answer?.question?.prompt) ||
  normalizeString(answer?.question?.label) ||
  normalizeString(answer?.currentStep?.questionText) ||
  normalizeString(answer?.currentStep?.prompt) ||
  normalizeString(answer?.step?.questionText) ||
  normalizeString(answer?.step?.prompt) ||
  normalizeString(answer?.label) ||
  "",

      answer:
        normalizeString(answer?.answerText) ||
        normalizeString(answer?.text) ||
        "",
      problematicAnswerType:
        answer?.problematicAnswerType ||
        answer?.answerAnalysis?.answerShapeAnalysis?.problematicAnswerType ||
        "none",
      strengths:
        answer?.answerAnalysis?.answerShapeAnalysis?.strengths ||
        answer?.annotations?.summary?.topStrength ||
        [],
      weaknesses:
        answer?.answerAnalysis?.answerShapeAnalysis?.weaknesses ||
        answer?.annotations?.summary?.topImprovementArea ||
        []
    }));

  const perceptionInput = {
    targetMode,
    roleFamily,
    roleFamilyConfidence,
    roleTitle,
    candidateSummary: normalizeString(overall?.candidateSummary),
    candidateProfile: {
  summary: normalizeString(candidateProfile?.summary),
  currentPositioning: normalizeString(candidateProfile?.currentPositioning),
  senioritySignal: normalizeString(candidateProfile?.senioritySignal),
  experienceSignals: candidateProfile?.experienceSignals || {},
  skills: candidateProfile?.skills || {},
  experiences: ensureArray(candidateProfile?.experiences).slice(0, 8),
  achievements: ensureArray(candidateProfile?.achievements).slice(0, 8)
    },
    perceivedSeniority: normalizeString(metrics?.["Seniority percepita candidato"]),
    targetSeniority: normalizeString(metrics?.["Seniority attesa dal ruolo"]),
    overallMetrics: metrics,
    roleFit: {
      strengths: ensureArray(roleFit?.strengths).slice(0, 8),
      transferableStrengths: ensureArray(roleFit?.transferableStrengths).slice(0, 8),
      matchedSkills: ensureArray(roleFit?.matchedSkills).slice(0, 8),
      risks: ensureArray(roleFit?.risks).slice(0, 8),
      missingSkills: ensureArray(roleFit?.missingSkills).slice(0, 8),
      clarificationsNeeded: ensureArray(roleFit?.clarificationsNeeded).slice(0, 8)
    },
    cvAdvice: {
      strengths: ensureArray(cvAdvice?.strengths).slice(0, 8),
      transferableStrengths: ensureArray(cvAdvice?.transferableStrengths).slice(0, 8),
      risks: ensureArray(cvAdvice?.risks).slice(0, 8),
      missingSkills: ensureArray(cvAdvice?.missingSkills).slice(0, 8),
      positioningHints: ensureArray(cvAdvice?.positioningHints).slice(0, 8),
      cvRewritePriorities: ensureArray(cvAdvice?.cvRewritePriorities).slice(0, 8),
      cvReadinessNarrative: normalizeString(cvAdvice?.cvReadinessNarrative)
    },
    questionQuality: {
      alignment: questionQuality?.alignment || {},
      motivationForChange: questionQuality?.motivationForChange || {}
    },
    runtimeRead,
    compactAnswers,
    rawInput: {
      targetRole: normalizeString(rawInput?.targetRole),
      jobDescription: normalizeString(rawInput?.jobDescription),
      cvText: normalizeString(rawInput?.cvText).slice(0, 6000)
    }
  };

    const systemPrompt = [
    "You are FRINGE, a professional perception analysis engine.",
    "Your task is not to judge the candidate and not to summarize the CV.",
    "Your task is to explain what professional substance becomes visible through the candidate's CV signals and interview answers.",
    "Produce exactly one JSON object matching the provided schema.",
    "Do not include markdown fences.",
    "Do not include explanations outside JSON.",

    "Core product rule:",
    "A credibility asset is not a skill label.",
    "A credibility asset is something in the candidate's history that makes other professional qualities believable.",
    "Do not write: 'the candidate has good reporting skills'.",
    "Prefer: 'the recurring presence of reporting and data reconstruction suggests that the candidate has often been asked to make complex operational information readable and usable'.",

    "Do not produce generic HR coaching.",
    "Avoid phrases such as: 'be more proactive', 'be more assertive', 'develop leadership skills', 'improve communication', unless they are directly grounded in the evidence.",
    "Avoid vague recommendations like 'focus on leadership' or 'gain more experience'.",
    "Avoid repeating the role title mechanically in every paragraph.",

    "The credibilityAssets section is especially important.",
    "credibilityAssets must not summarize generic strengths.",
    "It must connect 2-4 concrete pieces of evidence from the candidate profile to their professional meaning.",
    "Use this internal reasoning pattern for credibilityAssets: evidence -> interpretation -> professional meaning.",
    "Do not expose the words evidence, interpretation, or professional meaning in the output.",
    "Do not merely name what the candidate did; explain what that work makes believable about the candidate.",
    "Example: do not write 'the candidate worked on reporting'. Prefer: 'the recurring work on reporting suggests that others relied on the candidate to make operational information clearer, comparable, and usable for decisions'.",
    "Professional meaning is the core of FRINGE: explain why a concrete work signal matters.",

    "Write it as a warm professional reading, not as a competency assessment.",
    "Do not use vague phrases such as 'solid experience', 'projects complex', 'point of strength' unless you explain what concrete evidence makes them meaningful.",
    "It must recognize concrete professional substance: continuity, responsibility, operational weight, analytical discipline, reliability, ownership, craft, decision quality, ability to hold complexity, or other grounded signals.",
    "When evidence is strong, the tone may be warmly appreciative, but never flattering without evidence.",
    "The candidate should feel that real work, effort, years of experience, and professional commitment have been seen.",

    "The blindSpots section must not be a list of missing skills.",
    "Do not write blindSpots as 'the candidate may lack X' or 'should improve Y'.",
"A blind spot is a communication/perception dynamic: something the candidate may be doing that hides existing value.",
"Good blind spot examples: too much context hides ownership; technical detail hides business impact; describing activities hides decisions; sounding cautious hides seniority.",
    "It must describe a perception dynamic the candidate may not notice: for example, giving too much space to context, hiding ownership, sounding more junior than the CV suggests, or failing to make the strongest evidence visible.",

    "The attitudeShift section must not give generic self-improvement advice.",
    "It must suggest a concrete shift in how the candidate should present existing evidence.",
    "Prefer: 'make the decision visible', 'show what changed because of your contribution', 'connect the activity to the professional weight it had'.",

    "If targetMode is target_role, fill targetDistance and explain the perceived distance without turning it into generic advice.",
    "If targetMode is open_direction, fill professionalDirections and suggest plausible directions based on actual evidence.",
    "Do not invent facts, achievements, metrics, responsibilities, personality traits, or outcomes not supported by the input.",
    "You may interpret professional implications, but every implication must be grounded in CV signals, role fit signals, or interview answers.",

    "Use cautious but not weak language.",
    "Prefer: 'emerge', 'suggerisce', 'può essere letto come', 'rende credibile'.",
    "Avoid excessive conditionals such as 'potrebbe essere', repeated multiple times.",
    "Do not use empty motivational language.",
    "The tone must feel like a thoughtful expert reading the candidate, not like a template.",
    "Keep each narrative concise but sufficiently rich: usually 70-140 words per narrative block.",
    buildLanguageInstruction(locale)
  ].join(" ");

  const userPrompt = [
    "Return one JSON object matching this schema:",
    safeJsonStringify(schema),
    "",
    "Analyze this Professional Perception input:",
    safeJsonStringify({
      professionalPerceptionInput: perceptionInput
    }),
    "",
    "Important product intent:",
    "- 'Chi emerge' should describe the professional person who emerges from the CV and interview, not merely summarize the CV.",
    "- For credibilityAssets, use this logic: concrete evidence → what it suggests professionally → why it deserves recognition.",
    "- For blindSpots, describe what may be hiding the candidate's value during the interview, not what skill is missing.",
    "- 'Il tuo bagaglio di credibilità' should recognize concrete professional substance, experience, reliability, effort, continuity, responsibility, method, leadership, analytical ability, creativity, operational strength, or other grounded signals when present.",
    "- This section should feel like a thoughtful human reading, not a mechanical scoring system.",
    "- If a target role is present, explain the distance from that target in the targetDistance block.",
    "- If no meaningful target role is present, replace distance logic with plausible professional directions.",
    "- Recruiter memory should say what might remain in a recruiter's mind after the interview.",
    "- Blind spots should help the candidate see something important they may be underestimating.",
    "- Attitude shift should suggest a practical change in how to present themselves.",
    "",
    "Safety and grounding rules:",
    "- Do not claim psychological traits.",
    "- Do not infer private personal qualities.",
    "- Do not invent seniority, achievements, leadership, or impact.",
    "- Prefer: 'il percorso suggerisce', 'emerge', 'può essere letto come', 'potrebbe comunicare'.",
    "- Avoid: 'sei sicuramente', 'dimostra senza dubbio', 'hai certamente'."
  ].join("\n");

  return {
    professionalPerceptionPrompt: {
      task: "professionalPerception",
      locale,
      targetMode,
      roleFamily,
      roleFamilyConfidence,
      systemPrompt,
      userPrompt,
      input: perceptionInput
    }
  };
}

export default buildProfessionalPerceptionPrompt;