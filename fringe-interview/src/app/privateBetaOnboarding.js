const STEP_DEFINITIONS = Object.freeze({
  identity_state: Object.freeze({
    id: "identity_state",
    title: "La tua Professional Identity",
    prompt: "Come vuoi iniziare?",
    choices: Object.freeze([
      Object.freeze({ id: "create", label: "Crea una nuova Professional Identity" }),
      Object.freeze({ id: "recover", label: "Recupera una Professional Identity esistente" })
    ]),
    help: "La Professional Identity appartiene sempre alla persona che rappresenta."
  }),
  working_mode: Object.freeze({
    id: "working_mode",
    title: "Modalità di lavoro",
    prompt: "Come vuoi lavorare?",
    choices: Object.freeze([
      Object.freeze({ id: "independent", label: "Lavora autonomamente" }),
      Object.freeze({ id: "with_tutor", label: "Lavora con un Tutor" })
    ]),
    help: "La scelta del Tutor non concede accesso. Le autorizzazioni saranno richieste separatamente quando disponibili."
  })
});

const GOALS_BY_MODE = Object.freeze({
  independent: Object.freeze([
    Object.freeze({ id: "understand_professional_impression", label: "Capire come appaio professionalmente" }),
    Object.freeze({ id: "prepare_interview", label: "Prepararmi a un colloquio" }),
    Object.freeze({ id: "improve_cv", label: "Migliorare o creare il mio CV" })
  ]),
  with_tutor: Object.freeze([
    Object.freeze({ id: "organize_candidate_information", label: "Organizzare le informazioni professionali" }),
    Object.freeze({ id: "build_professional_narrative", label: "Costruire una narrazione professionale chiara" }),
    Object.freeze({ id: "prepare_candidate", label: "Preparare il percorso del candidato" })
  ])
});

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function freeze(value) {
  if (Array.isArray(value)) {
    value.forEach(freeze);
    return Object.freeze(value);
  }
  if (isObject(value)) {
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }
  return value;
}

function buildGoalStep(mode) {
  return freeze({
    id: "immediate_goal",
    title: "Obiettivo immediato",
    prompt: mode === "with_tutor" ? "Qual è l'obiettivo del supporto?" : "Da quale obiettivo vuoi partire?",
    choices: GOALS_BY_MODE[mode],
    help: "Scegli l'obiettivo più utile adesso. Potrai affrontare gli altri in seguito."
  });
}

function buildState({ identityState = null, workingMode = null, immediateGoal = null } = {}) {
  const selections = { identityState, workingMode, immediateGoal };
  const completed = Boolean(identityState && workingMode && immediateGoal);
  const currentStep = completed
    ? null
    : !identityState
      ? "identity_state"
      : !workingMode
        ? "working_mode"
        : "immediate_goal";

  const step = currentStep === "immediate_goal"
    ? buildGoalStep(workingMode)
    : currentStep
      ? STEP_DEFINITIONS[currentStep]
      : null;

  return freeze({
    version: "1.0",
    status: completed ? "completed" : "in_progress",
    completed,
    currentStep,
    selections,
    step,
    resumeToken: freeze({ version: "1.0", selections })
  });
}

function allowedChoiceIds(state) {
  return new Set((state.step?.choices || []).map((choice) => choice.id));
}

function assertValidState(state) {
  if (!isObject(state) || state.version !== "1.0" || !isObject(state.selections)) {
    throw new Error("PRIVATE_BETA_ONBOARDING_INVALID_STATE");
  }
  return state;
}

export function startPrivateBetaOnboarding() {
  return buildState();
}

export function advancePrivateBetaOnboarding(state, choiceId) {
  assertValidState(state);

  if (state.completed === true || state.currentStep === null) {
    throw new Error("PRIVATE_BETA_ONBOARDING_ALREADY_COMPLETED");
  }
  if (typeof choiceId !== "string" || !allowedChoiceIds(state).has(choiceId)) {
    throw new Error(`PRIVATE_BETA_ONBOARDING_INVALID_CHOICE: ${state.currentStep}`);
  }

  const next = { ...state.selections };
  if (state.currentStep === "identity_state") next.identityState = choiceId;
  if (state.currentStep === "working_mode") next.workingMode = choiceId;
  if (state.currentStep === "immediate_goal") next.immediateGoal = choiceId;

  return buildState(next);
}

export function resumePrivateBetaOnboarding(resumeToken) {
  if (!isObject(resumeToken) || resumeToken.version !== "1.0" || !isObject(resumeToken.selections)) {
    throw new Error("PRIVATE_BETA_ONBOARDING_INVALID_RESUME_TOKEN");
  }

  const { identityState = null, workingMode = null, immediateGoal = null } = resumeToken.selections;
  if (identityState !== null && !STEP_DEFINITIONS.identity_state.choices.some((choice) => choice.id === identityState)) {
    throw new Error("PRIVATE_BETA_ONBOARDING_INVALID_RESUME_TOKEN");
  }
  if (workingMode !== null && !STEP_DEFINITIONS.working_mode.choices.some((choice) => choice.id === workingMode)) {
    throw new Error("PRIVATE_BETA_ONBOARDING_INVALID_RESUME_TOKEN");
  }
  if (immediateGoal !== null) {
    if (!workingMode || !GOALS_BY_MODE[workingMode]?.some((choice) => choice.id === immediateGoal)) {
      throw new Error("PRIVATE_BETA_ONBOARDING_INVALID_RESUME_TOKEN");
    }
  }
  if (workingMode !== null && identityState === null) {
    throw new Error("PRIVATE_BETA_ONBOARDING_INVALID_RESUME_TOKEN");
  }
  if (immediateGoal !== null && workingMode === null) {
    throw new Error("PRIVATE_BETA_ONBOARDING_INVALID_RESUME_TOKEN");
  }

  return buildState({ identityState, workingMode, immediateGoal });
}

export default startPrivateBetaOnboarding;
