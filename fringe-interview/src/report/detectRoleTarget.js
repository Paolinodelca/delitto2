export default function detectRoleTarget({
  roleFamily = "",
  targetRole = ""
} = {}) {
  const text = String(targetRole || "").toLowerCase();

  if (roleFamily === "care_helping_professions") {
    if (
      text.includes("disabil") ||
      text.includes("autismo")
    ) {
      return "disability_support";
    }

    if (
      text.includes("giovani") ||
      text.includes("prevenzione") ||
      text.includes("ascolto")
    ) {
      return "youth_prevention";
    }

    if (
      text.includes("famiglie") ||
      text.includes("genitorialità") ||
      text.includes("infanzia")
    ) {
      return "family_support";
    }
  }

  return "";
}