import { createPrivateBetaUiServer } from "../src/app/privateBetaUiServer.js";
import { createJsonlPrivateBetaFeedbackStore } from "../src/app/privateBetaContextualFeedback.js";

const port = Number(process.env.IMAGO_PRIVATE_BETA_PORT || 4173);
const host = process.env.IMAGO_PRIVATE_BETA_HOST || "127.0.0.1";
const operatorDiagnosticsEnabled = process.env.IMAGO_OPERATOR_DIAGNOSTICS === "1";
const feedbackStore=createJsonlPrivateBetaFeedbackStore({filePath:process.env.IMAGO_PRIVATE_BETA_FEEDBACK_PATH||"tmp/private-beta-feedback.jsonl"});
const server = createPrivateBetaUiServer({ locale: process.env.IMAGO_PRIVATE_BETA_LOCALE || "it", operatorDiagnosticsEnabled, feedbackStore });
server.listen(port, host, () => {
  console.log(`IMAGO Private Beta UI listening on http://${host}:${port}/private-beta`);
  if (operatorDiagnosticsEnabled) console.log(`Operator semantic trace enabled: http://${host}:${port}/private-beta/operator/semantic-trace?sessionRef=<SESSION_REF>`);
  if (operatorDiagnosticsEnabled) console.log(`Operator preparation diagnostics enabled: http://${host}:${port}/private-beta/operator/preparation-diagnostics`);
  if (operatorDiagnosticsEnabled) console.log(`Operator professional synthesis diagnostics enabled: http://${host}:${port}/private-beta/operator/professional-synthesis-diagnostics`);
  if (operatorDiagnosticsEnabled) console.log(`Operator one-shot force-fresh: POST http://${host}:${port}/private-beta/operator/force-fresh-professional-representation`);
});
