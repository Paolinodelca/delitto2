function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function deriveAnswerAnnotationProviderSchema(canonicalSchema) {
  const providerSchema = deepClone(canonicalSchema);
  const annotationItems = providerSchema?.properties?.answerAnnotation?.properties?.annotations?.items;
  if (!annotationItems || annotationItems.type !== "object" || !annotationItems.properties) {
    throw new Error("deriveAnswerAnnotationProviderSchema: canonical annotations schema is unavailable.");
  }
  delete annotationItems.properties.start;
  delete annotationItems.properties.end;
  annotationItems.required = (annotationItems.required || []).filter((field) => field !== "start" && field !== "end");
  return providerSchema;
}
