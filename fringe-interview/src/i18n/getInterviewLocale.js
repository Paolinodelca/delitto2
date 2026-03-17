import { getActiveLocale, getFallbackLocale } from "./getAppLocale.js";
import { INTERVIEW_LOCALES } from "./interviewLocaleRegistry.js";

export function getInterviewLocale() {
  const activeLocale = getActiveLocale();
  const fallbackLocale = getFallbackLocale();

  return (
    INTERVIEW_LOCALES[activeLocale] ||
    INTERVIEW_LOCALES[fallbackLocale] ||
    INTERVIEW_LOCALES.en
  );
}