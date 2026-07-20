#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const COMMAND_NAME =
  "imago-builder-write";

const EXIT_CODES = {
  success: 0,
  inputError: 1,
  preflightBlocked: 2,
  writeFailed: 3,
  writePartial: 4,
  reportOutputFailed: 5,
};

const FLAG_DEFINITIONS = {
  "--plan": {
    key: "planPath",
    takesValue: true,
  },
  "--target-root": {
    key: "targetRoot",
    takesValue: true,
  },
  "--write": {
    key: "write",
    takesValue: false,
  },
  "--allow-overwrite": {
    key: "allowOverwrite",
    takesValue: false,
  },
  "--json": {
    key: "json",
    takesValue: false,
  },
  "--report": {
    key: "reportPath",
    takesValue: true,
  },
  "--overwrite-report": {
    key: "overwriteReport",
    takesValue: false,
  },
  "--help": {
    key: "help",
    takesValue: false,
  },
  "-h": {
    key: "help",
    takesValue: false,
  },
  "--version": {
    key: "version",
    takesValue: false,
  },
  "-v": {
    key: "version",
    takesValue: false,
  },
};

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function cliError(
  code,
  message,
  details = null
) {
  return {
    code,
    message,
    details,
  };
}

function parseCliArguments(
  argv = []
) {
  const options = {
    planPath: null,
    targetRoot: null,
    write: false,
    allowOverwrite: false,
    json: false,
    reportPath: null,
    overwriteReport: false,
    help: false,
    version: false,
  };

  const seenKeys =
    new Set();

  for (
    let index = 0;
    index < argv.length;
    index += 1
  ) {
    const token =
      argv[index];

    const definition =
      FLAG_DEFINITIONS[token];

    if (!definition) {
      return {
        valid: false,
        options,
        error:
          cliError(
            "cli_arguments_invalid",
            `Unknown argument: ${token}`
          ),
      };
    }

    if (
      seenKeys.has(
        definition.key
      )
    ) {
      return {
        valid: false,
        options,
        error:
          cliError(
            "cli_arguments_invalid",
            `Duplicate argument: ${token}`
          ),
      };
    }

    seenKeys.add(
      definition.key
    );

    if (
      definition.takesValue
    ) {
      const value =
        argv[index + 1];

      if (
        typeof value !== "string" ||
        value.length === 0 ||
        value.startsWith("-")
      ) {
        return {
          valid: false,
          options,
          error:
            cliError(
              "cli_arguments_invalid",
              `Missing value for ${token}.`
            ),
        };
      }

      options[
        definition.key
      ] = value;

      index += 1;
    } else {
      options[
        definition.key
      ] = true;
    }
  }

  if (
    options.overwriteReport &&
    !options.reportPath
  ) {
    return {
      valid: false,
      options,
      error:
        cliError(
          "cli_arguments_invalid",
          "--overwrite-report requires --report."
        ),
    };
  }

  if (
    !options.help &&
    !options.version
  ) {
    if (!options.planPath) {
      return {
        valid: false,
        options,
        error:
          cliError(
            "cli_arguments_invalid",
            "--plan is required."
          ),
      };
    }

    if (!options.targetRoot) {
      return {
        valid: false,
        options,
        error:
          cliError(
            "cli_arguments_invalid",
            "--target-root is required."
          ),
      };
    }
  }

  return {
    valid: true,
    options,
    error: null,
  };
}

function findPackageVersion({
  startDirectory,
  fsOps = fs,
} = {}) {
  let current =
    path.resolve(
      startDirectory ||
      __dirname
    );

  while (true) {
    const packagePath =
      path.join(
        current,
        "package.json"
      );

    try {
      const packageJson =
        JSON.parse(
          fsOps.readFileSync(
            packagePath,
            "utf8"
          )
        );

      if (
        typeof packageJson.version ===
          "string" &&
        packageJson.version.trim()
          .length > 0
      ) {
        return packageJson.version;
      }
    } catch (error) {
      // Continue searching upward.
    }

    const parent =
      path.dirname(current);

    if (parent === current) {
      return "unknown";
    }

    current = parent;
  }
}

function buildHelpText() {
  return [
    "IMAGO Builder — Safe Generation Writer CLI",
    "",
    "Usage:",
    "  node tools/imago-builder/cli/write-generation-plan.js --plan <path> --target-root <path> [options]",
    "",
    "Required:",
    "  --plan <path>            GenerationPlan JSON file.",
    "  --target-root <path>     Root passed to the real write preflight.",
    "",
    "Options:",
    "  --write                  Execute only when preflight is ready.",
    "  --allow-overwrite        Authorize overwrite in the real preflight.",
    "  --json                   Emit one JSON envelope on stdout.",
    "  --report <path>          Save the final JSON envelope.",
    "  --overwrite-report       Allow replacing an existing report file.",
    "  --help, -h               Show help.",
    "  --version, -v            Show repository package version.",
    "",
    "Default mode is preflight-only. It does not call the Writer.",
    "",
    "Exit codes:",
    "  0 success or ready preflight",
    "  1 invalid CLI input, plan or JSON",
    "  2 blocked preflight",
    "  3 failed write",
    "  4 partial write",
    "  5 report output failure",
    "",
    "Preflight example:",
    "  node tools/imago-builder/cli/write-generation-plan.js --plan ./tmp/generation-plan.json --target-root ./generated",
    "",
    "Write example:",
    "  node tools/imago-builder/cli/write-generation-plan.js --plan ./tmp/generation-plan.json --target-root ./generated --write",
  ].join("\n");
}

function buildErrorEnvelope({
  mode,
  error,
}) {
  return {
    command:
      COMMAND_NAME,
    mode,
    success: false,
    error,
    preflightReport: null,
    writeReport: null,
  };
}

function formatHumanPreflight({
  planPath,
  targetRoot,
  envelope,
}) {
  const report =
    envelope.preflightReport;

  const lines = [
    "IMAGO Builder — Generation Write Preflight",
    "",
    `Plan: ${planPath}`,
    `Target root: ${targetRoot}`,
    `Plan identity: ${report.planIdentity}`,
    `Status: ${String(report.preflightStatus).toUpperCase()}`,
    "",
    "Files:",
  ];

  for (
    const file
    of report.files
  ) {
    lines.push(
      `  ${String(file.action || "blocked").toUpperCase().padEnd(10)} ${file.relativePath}`
    );
  }

  lines.push(
    "",
    "Summary:",
    `  Total: ${report.summary.totalFiles}`,
    `  Create: ${report.summary.createFiles}`,
    `  Overwrite: ${report.summary.overwriteFiles}`,
    `  Blocked: ${report.summary.blockedFiles}`,
    "",
    "No files were written."
  );

  if (
    report.preflightStatus ===
    "ready"
  ) {
    lines.push(
      "Use --write to execute this ready plan."
    );
  }

  if (
    Array.isArray(report.errors) &&
    report.errors.length > 0
  ) {
    lines.push(
      "",
      `Error: ${String(report.errors[0])}`
    );
  }

  return lines.join("\n");
}

function formatHumanWrite({
  envelope,
}) {
  const report =
    envelope.writeReport;

  const lines = [
    "IMAGO Builder — Generation Write",
    "",
    `Status: ${String(report.status).toUpperCase()}`,
    "",
    "Files:",
  ];

  for (
    const result
    of report.fileResults
  ) {
    lines.push(
      `  ${result.status.toUpperCase().padEnd(8)} ${result.action.toUpperCase().padEnd(10)} ${result.relativePath}`
    );
  }

  lines.push(
    "",
    "Summary:",
    `  Successful: ${report.summary.successfulFiles}`,
    `  Failed: ${report.summary.failedFiles}`,
    `  Skipped: ${report.summary.skippedFiles}`,
    "",
    `Atomic per file: ${report.metadata.atomicPerFile === true ? "yes" : "no"}`,
    `Transactional plan: ${report.metadata.transactionalPlan === true ? "yes" : "no"}`
  );

  if (
    report.errors.length > 0
  ) {
    lines.push(
      "",
      `First error: ${report.errors[0].code} — ${report.errors[0].message}`
    );
  }

  if (
    report.status ===
    "partial"
  ) {
    lines.push(
      "No global rollback was attempted."
    );
  }

  return lines.join("\n");
}

function writeReportFile({
  reportPath,
  overwriteReport,
  envelope,
  cwd,
  fsOps,
}) {
  const resolvedPath =
    path.resolve(
      cwd,
      reportPath
    );

  const parent =
    path.dirname(
      resolvedPath
    );

  let parentStat;

  try {
    parentStat =
      fsOps.statSync(
        parent
      );
  } catch (error) {
    throw cliError(
      "report_parent_missing",
      "Report parent directory does not exist.",
      {
        reportPath:
          resolvedPath,
      }
    );
  }

  if (
    !parentStat.isDirectory()
  ) {
    throw cliError(
      "report_parent_not_directory",
      "Report parent path is not a directory.",
      {
        reportPath:
          resolvedPath,
      }
    );
  }

  if (
    fsOps.existsSync(
      resolvedPath
    ) &&
    !overwriteReport
  ) {
    throw cliError(
      "report_already_exists",
      "Report file already exists. Use --overwrite-report to replace it.",
      {
        reportPath:
          resolvedPath,
      }
    );
  }

  try {
    fsOps.writeFileSync(
      resolvedPath,
      `${JSON.stringify(envelope, null, 2)}\n`,
      {
        encoding: "utf8",
        flag:
          overwriteReport
            ? "w"
            : "wx",
      }
    );
  } catch (error) {
    if (
      isObject(error) &&
      typeof error.code ===
        "string"
    ) {
      throw cliError(
        "report_write_failed",
        "CLI report could not be written.",
        {
          reportPath:
            resolvedPath,
          filesystemCode:
            error.code,
        }
      );
    }

    throw error;
  }

  return resolvedPath;
}

function createGenerationWriterCli({
  fsOps = fs,
  stdout = process.stdout,
  stderr = process.stderr,
  cwd = process.cwd(),
  builderApi =
    require("../index"),
  version =
    findPackageVersion({
      startDirectory:
        __dirname,
      fsOps,
    }),
} = {}) {
  function emit({
    options,
    envelope,
    humanText,
  }) {
    if (options.json) {
      stdout.write(
        `${JSON.stringify(envelope)}\n`
      );
      return;
    }

    stdout.write(
      `${humanText}\n`
    );
  }

  function run(argv = []) {
    const parsed =
      parseCliArguments(
        argv
      );

    const requestedMode =
      parsed.options.write
        ? "write"
        : "preflight";

    if (!parsed.valid) {
      const envelope =
        buildErrorEnvelope({
          mode:
            requestedMode,
          error:
            parsed.error,
        });

      emit({
        options:
          parsed.options,
        envelope,
        humanText:
          `IMAGO Builder — Error\n\n${parsed.error.code}: ${parsed.error.message}`,
      });

      return {
        exitCode:
          EXIT_CODES.inputError,
        envelope,
      };
    }

    const options =
      parsed.options;

    if (options.help) {
      stdout.write(
        `${buildHelpText()}\n`
      );

      return {
        exitCode:
          EXIT_CODES.success,
        envelope: null,
      };
    }

    if (options.version) {
      stdout.write(
        `${version}\n`
      );

      return {
        exitCode:
          EXIT_CODES.success,
        envelope: null,
      };
    }

    const mode =
      options.write
        ? "write"
        : "preflight";

    const resolvedPlanPath =
      path.resolve(
        cwd,
        options.planPath
      );

    const resolvedTargetRoot =
      path.resolve(
        cwd,
        options.targetRoot
      );

    let planStat;

    try {
      planStat =
        fsOps.statSync(
          resolvedPlanPath
        );
    } catch (error) {
      const envelope =
        buildErrorEnvelope({
          mode,
          error:
            cliError(
              "plan_file_missing",
              "GenerationPlan file does not exist.",
              {
                planPath:
                  resolvedPlanPath,
              }
            ),
        });

      emit({
        options,
        envelope,
        humanText:
          `IMAGO Builder — Error\n\n${envelope.error.code}: ${envelope.error.message}`,
      });

      return {
        exitCode:
          EXIT_CODES.inputError,
        envelope,
      };
    }

    if (
      !planStat.isFile()
    ) {
      const envelope =
        buildErrorEnvelope({
          mode,
          error:
            cliError(
              "plan_path_not_file",
              "GenerationPlan path is not a regular file.",
              {
                planPath:
                  resolvedPlanPath,
              }
            ),
        });

      emit({
        options,
        envelope,
        humanText:
          `IMAGO Builder — Error\n\n${envelope.error.code}: ${envelope.error.message}`,
      });

      return {
        exitCode:
          EXIT_CODES.inputError,
        envelope,
      };
    }

    let planText;

    try {
      planText =
        fsOps.readFileSync(
          resolvedPlanPath,
          "utf8"
        );
    } catch (error) {
      const envelope =
        buildErrorEnvelope({
          mode,
          error:
            cliError(
              "plan_file_read_failed",
              "GenerationPlan file could not be read.",
              {
                planPath:
                  resolvedPlanPath,
              }
            ),
        });

      emit({
        options,
        envelope,
        humanText:
          `IMAGO Builder — Error\n\n${envelope.error.code}: ${envelope.error.message}`,
      });

      return {
        exitCode:
          EXIT_CODES.inputError,
        envelope,
      };
    }

    let generationPlan;

    try {
      generationPlan =
        JSON.parse(
          planText
        );
    } catch (error) {
      const envelope =
        buildErrorEnvelope({
          mode,
          error:
            cliError(
              "plan_json_invalid",
              "GenerationPlan file contains invalid JSON."
            ),
        });

      emit({
        options,
        envelope,
        humanText:
          `IMAGO Builder — Error\n\n${envelope.error.code}: ${envelope.error.message}`,
      });

      return {
        exitCode:
          EXIT_CODES.inputError,
        envelope,
      };
    }

    const planValidation =
      builderApi
        .validateGenerationPlan(
          generationPlan
        );

    if (
      planValidation.isValid !==
      true
    ) {
      const envelope =
        buildErrorEnvelope({
          mode,
          error:
            cliError(
              "generation_plan_invalid",
              "GenerationPlan validation failed.",
              {
                errors:
                  planValidation.errors,
                warnings:
                  planValidation.warnings,
              }
            ),
        });

      emit({
        options,
        envelope,
        humanText:
          `IMAGO Builder — Error\n\n${envelope.error.code}: ${envelope.error.message}`,
      });

      return {
        exitCode:
          EXIT_CODES.inputError,
        envelope,
      };
    }

    const writePreflightReport =
      builderApi
        .buildGenerationWritePreflight({
          plan:
            generationPlan,
          rootDirectory:
            resolvedTargetRoot,
          allowOverwrite:
            options.allowOverwrite,
        });

    const preflightValidation =
      builderApi
        .validateGenerationWritePreflight(
          writePreflightReport
        );

    if (
      preflightValidation.isValid !==
      true
    ) {
      const envelope =
        buildErrorEnvelope({
          mode,
          error:
            cliError(
              "write_preflight_invalid",
              "WritePreflightReport validation failed.",
              {
                errors:
                  preflightValidation.errors,
                warnings:
                  preflightValidation.warnings,
              }
            ),
        });

      emit({
        options,
        envelope,
        humanText:
          `IMAGO Builder — Error\n\n${envelope.error.code}: ${envelope.error.message}`,
      });

      return {
        exitCode:
          EXIT_CODES.inputError,
        envelope,
      };
    }

    let envelope;
    let exitCode;

    if (!options.write) {
      const ready =
        writePreflightReport
          .preflightStatus ===
          "ready";

      envelope = {
        command:
          COMMAND_NAME,
        mode: "preflight",
        success:
          ready,
        error:
          ready
            ? null
            : cliError(
                "preflight_not_ready",
                "Write preflight is not ready."
              ),
        preflightReport:
          writePreflightReport,
        writeReport: null,
      };

      exitCode =
        ready
          ? EXIT_CODES.success
          : EXIT_CODES.preflightBlocked;
    } else if (
      writePreflightReport
        .preflightStatus !==
      "ready"
    ) {
      envelope = {
        command:
          COMMAND_NAME,
        mode: "write",
        success: false,
        error:
          cliError(
            "preflight_not_ready",
            "Write preflight is not ready."
          ),
        preflightReport:
          writePreflightReport,
        writeReport: null,
      };

      exitCode =
        EXIT_CODES.preflightBlocked;
    } else {
      const writeReport =
        builderApi
          .writeGenerationPlan({
            generationPlan,
            writePreflightReport,
          });

      const writeValidation =
        builderApi
          .validateGenerationWriteReport(
            writeReport
          );

      if (
        writeValidation.isValid !==
        true
      ) {
        envelope = {
          command:
            COMMAND_NAME,
          mode: "write",
          success: false,
          error:
            cliError(
              "generation_write_report_invalid",
              "GenerationWriteReport validation failed.",
              {
                errors:
                  writeValidation.errors,
              }
            ),
          preflightReport:
            writePreflightReport,
          writeReport,
        };

        exitCode =
          EXIT_CODES.writeFailed;
      } else {
        const success =
          writeReport.status ===
          "completed";

        const primaryError =
          writeReport.errors.length > 0
            ? writeReport.errors[0]
            : null;

        envelope = {
          command:
            COMMAND_NAME,
          mode: "write",
          success,
          error:
            success
              ? null
              : primaryError || cliError(
                  "generation_write_failed",
                  `Generation write ended with status ${writeReport.status}.`
                ),
          preflightReport:
            writePreflightReport,
          writeReport,
        };

        exitCode =
          writeReport.status ===
            "completed"
            ? EXIT_CODES.success
            : writeReport.status ===
                "partial"
              ? EXIT_CODES.writePartial
              : EXIT_CODES.writeFailed;
      }
    }

    if (options.reportPath) {
      try {
        writeReportFile({
          reportPath:
            options.reportPath,
          overwriteReport:
            options.overwriteReport,
          envelope,
          cwd,
          fsOps,
        });
      } catch (error) {
        const reportError =
          isObject(error) &&
          typeof error.code ===
            "string"
            ? error
            : cliError(
                "report_write_failed",
                "CLI report could not be written."
              );

        const reportFailureEnvelope = {
          ...envelope,
          success: false,
          error:
            reportError,
        };

        emit({
          options,
          envelope:
            reportFailureEnvelope,
          humanText:
            `IMAGO Builder — Error\n\n${reportError.code}: ${reportError.message}`,
        });

        return {
          exitCode:
            EXIT_CODES.reportOutputFailed,
          envelope:
            reportFailureEnvelope,
        };
      }
    }

    emit({
      options,
      envelope,
      humanText:
        options.write &&
        envelope.writeReport
          ? formatHumanWrite({
              envelope,
            })
          : formatHumanPreflight({
              planPath:
                resolvedPlanPath,
              targetRoot:
                resolvedTargetRoot,
              envelope,
            }),
    });

    return {
      exitCode,
      envelope,
    };
  }

  return {
    run,
  };
}

function runGenerationWriterCli(
  argv = process.argv.slice(2)
) {
  const cli =
    createGenerationWriterCli();

  return cli.run(argv);
}

if (require.main === module) {
  const result =
    runGenerationWriterCli();

  process.exitCode =
    result.exitCode;
}

module.exports = {
  EXIT_CODES,
  parseCliArguments,
  findPackageVersion,
  buildHelpText,
  formatHumanPreflight,
  formatHumanWrite,
  writeReportFile,
  createGenerationWriterCli,
  runGenerationWriterCli,
};
