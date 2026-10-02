import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname=path.dirname(fileURLToPath(import.meta.url));
function locale(v){return String(v||'it').toLowerCase().startsWith('en')?'en':'it';}
export function loadProfessionalRepresentationSynthesisMessages(value='it'){
 const l=locale(value); const p=path.resolve(__dirname,'..','..','config',`professional_representation_synthesis.${l}.json`);
 return Object.freeze(JSON.parse(readFileSync(p,'utf8')));
}
export default loadProfessionalRepresentationSynthesisMessages;
