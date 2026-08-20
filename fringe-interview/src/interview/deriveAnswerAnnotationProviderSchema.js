function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

const IDENTITY_FIELDS = ["answerId", "questionLabel", "questionPrompt", "answerText", "reviewMode"];
const COACHING_FIELDS = ["summary", "tags", "strengths", "weaknesses", "coachTip", "upgradeSuggestion", "improvedAnswerDraft"];
const ANNOTATION_FIELDS = ["annotations"];

function projectCanonicalSchema(canonicalSchema, selectedFields) {
  const providerSchema = deepClone(canonicalSchema);
  const answer = providerSchema?.properties?.answerAnnotation;
  if (!answer || answer.type !== "object" || !answer.properties) {
    throw new Error("deriveAnswerAnnotationProviderSchema: canonical answerAnnotation schema is unavailable.");
  }
  const keep = new Set([...IDENTITY_FIELDS, ...selectedFields]);
  answer.properties = Object.fromEntries(Object.entries(answer.properties).filter(([key]) => keep.has(key)));
  answer.required = (answer.required || []).filter((field) => keep.has(field));
  return providerSchema;
}

function removeAnnotationOffsets(providerSchema) {
  const annotationItems = providerSchema?.properties?.answerAnnotation?.properties?.annotations?.items;
  if (!annotationItems) return providerSchema;
  delete annotationItems.properties.start;
  delete annotationItems.properties.end;
  annotationItems.required = (annotationItems.required || []).filter((field) => field !== "start" && field !== "end");
  return providerSchema;
}

export function deriveAnswerAnnotationProviderSchema(canonicalSchema) {
  return removeAnnotationOffsets(deepClone(canonicalSchema));
}

export function deriveAnswerAnnotationCoachingProviderSchema(canonicalSchema) {
  return projectCanonicalSchema(canonicalSchema, COACHING_FIELDS);
}

export function deriveAnswerAnnotationAnnotationsProviderSchema(canonicalSchema) {
  return removeAnnotationOffsets(projectCanonicalSchema(canonicalSchema, ANNOTATION_FIELDS));
}
