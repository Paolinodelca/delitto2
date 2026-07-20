const {
  validateGenerationPlan,
} = require("./validateGenerationPlan");

const {
  validateGenerationWritePreflight,
} = require("./validateGenerationWritePreflight");

const {
  buildGenerationWriteReport,
} = require("./buildGenerationWriteReport");

function safeIdentity(
  value
) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  )
    ? value
    : "unavailable";
}

function buildGuardFailure({
  generationPlan,
  writePreflightReport,
  code,
  message,
}) {
  return buildGenerationWriteReport({
    status: "failed",

    planIdentity:
      safeIdentity(
        generationPlan &&
        generationPlan.planIdentity
      ),

    preflightIdentity:
      safeIdentity(
        writePreflightReport &&
        writePreflightReport.planIdentity
      ),

    fileResults: [],

    errors: [
      {
        code,
        message,
      },
    ],

    warnings: [],

    metadata: {
      writerId:
        "imago-generation-plan-writer",

      mode:
        "read_only_guard",
    },
  });
}

function writeGenerationPlan({
  generationPlan,
  writePreflightReport,
} = {}) {
  const planValidation =
    validateGenerationPlan(
      generationPlan
    );

  if (
    planValidation.isValid !==
    true
  ) {
    return buildGuardFailure({
      generationPlan,
      writePreflightReport,
      code:
        "generation_plan_invalid",
      message:
        "GenerationPlan validation failed.",
    });
  }

  const preflightValidation =
    validateGenerationWritePreflight(
      writePreflightReport
    );

  if (
    preflightValidation.isValid !==
    true
  ) {
    return buildGuardFailure({
      generationPlan,
      writePreflightReport,
      code:
        "write_preflight_invalid",
      message:
        "WritePreflightReport validation failed.",
    });
  }

  if (
    generationPlan.planIdentity !==
    writePreflightReport.planIdentity
  ) {
    return buildGuardFailure({
      generationPlan,
      writePreflightReport,
      code:
        "plan_preflight_mismatch",
      message:
        "GenerationPlan and WritePreflightReport identities do not match.",
    });
  }

  if (
    writePreflightReport.preflightStatus !==
    "ready"
  ) {
    return buildGuardFailure({
      generationPlan,
      writePreflightReport,
      code:
        "preflight_not_ready",
      message:
        "WritePreflightReport is not ready.",
    });
  }

  return buildGuardFailure({
    generationPlan,
    writePreflightReport,
    code:
      "writer_not_implemented",
    message:
      "Filesystem mutation is not implemented in this writer phase.",
  });
}

module.exports = {
  writeGenerationPlan,
};
