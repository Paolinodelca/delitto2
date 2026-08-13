import { createPrivateBetaUiServer } from "../src/app/privateBetaUiServer.js";

const port = Number(process.env.IMAGO_PRIVATE_BETA_PORT || 4173);
const host = process.env.IMAGO_PRIVATE_BETA_HOST || "127.0.0.1";
const server = createPrivateBetaUiServer({ locale: process.env.IMAGO_PRIVATE_BETA_LOCALE || "it" });
server.listen(port, host, () => {
  console.log(`IMAGO Private Beta UI listening on http://${host}:${port}/private-beta`);
});
