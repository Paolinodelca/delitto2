#!/usr/bin/env node
const {
  runGenerationWriterCli,
} = require("../tools/imago-builder/cli/write-generation-plan");

const result =
  runGenerationWriterCli(
    process.argv.slice(2)
  );

process.exitCode =
  result.exitCode;
