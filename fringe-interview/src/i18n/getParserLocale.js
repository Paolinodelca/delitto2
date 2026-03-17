import { getActiveLocale, getFallbackLocale } from "./getAppLocale.js";
import { PARSER_LOCALES } from "./parserLocaleRegistry.js";

export function getParserLocale() {
  const activeLocale = getActiveLocale();
  const fallbackLocale = getFallbackLocale();

  return (
    PARSER_LOCALES[activeLocale] ||
    PARSER_LOCALES[fallbackLocale] ||
    PARSER_LOCALES.en
  );
}