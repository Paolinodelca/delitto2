export const PARSER_LOCALES = {
  en: {
    code: "en",
    outputLanguageLabel: "English",
    promptInstruction:
      "Return all free-text JSON values in English. Keep enum values and schema keys exactly as defined.",
    notesInstruction:
      "Do not translate enum values, schema keys, or technical field names. Translate only human-readable descriptive strings.",
    examplesInstruction:
      "If the source text is in another language, still produce the JSON content in English."
  },
  it: {
    code: "it",
    outputLanguageLabel: "Italian",
    promptInstruction:
      "Restituisci tutti i valori testuali leggibili del JSON in italiano. Mantieni esattamente invariati enum, chiavi dello schema e nomi tecnici dei campi.",
    notesInstruction:
      "Non tradurre enum, chiavi dello schema o nomi tecnici dei campi. Traduci solo le stringhe descrittive leggibili da una persona.",
    examplesInstruction:
      "Se il testo sorgente è in un’altra lingua, restituisci comunque il contenuto del JSON in italiano."
  }
};