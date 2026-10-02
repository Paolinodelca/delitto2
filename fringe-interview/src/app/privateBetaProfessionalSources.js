import { createRequire } from 'module';
const require=createRequire(import.meta.url);
const { buildInputSource }=require('../core/input/buildInputSource.js');
const { buildInputBundle }=require('../core/input/buildInputBundle.js');
const text=v=>typeof v==='string'?v.trim():'';
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v);}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v);}return v;};
const SPECS=Object.freeze([
 {field:'cvText',id:'current_cv',sourceRole:'current_cv',origin:'current_cv',label:'Current CV'},
 {field:'previousCvText',id:'previous_cv',sourceRole:'previous_cv',origin:'previous_cv',label:'Previous CV'}
]);
const DECLARATION=Object.freeze({field:'professionalDeclaration',id:'professional_declaration',sourceRole:'professional_declaration',origin:'user_declaration',label:'Professional declaration'});
function rebuiltSource({spec,old=null,content,now}){const supplied=text(content),oldContent=text(old?.content),stamp=supplied&&supplied!==oldContent?now():old?.provenance?.collectedAt||now();return buildInputSource({id:old?.id||spec.id,type:'text',label:spec.label,content:supplied||oldContent,sourceRole:spec.sourceRole,provenance:{origin:spec.origin,providedBy:'user',collectedAt:stamp},metadata:old?.metadata||{createdAt:now(),updatedAt:now()}});}
function declarationId(existing=[]){const used=new Set(existing.map(x=>text(x?.id)).filter(Boolean));if(!used.has(DECLARATION.id))return DECLARATION.id;let n=2;while(used.has(`${DECLARATION.id}_${n}`))n++;return `${DECLARATION.id}_${n}`;}
export function buildPrivateBetaProfessionalSourceBundle({input={},recoveredSources=[],now=()=>new Date().toISOString()}={}){
 const recovered=Array.isArray(recoveredSources)?recoveredSources:[];
 const sources=[];
 for(const spec of SPECS){const old=recovered.find(s=>s?.sourceRole===spec.sourceRole)||null;const supplied=text(input[spec.field]);const content=supplied||text(old?.content);if(!content)continue;sources.push(rebuiltSource({spec,old,content,now}));}
 const priorDeclarations=recovered.filter(s=>s?.sourceRole===DECLARATION.sourceRole);
 for(const old of priorDeclarations){if(text(old?.content))sources.push(buildInputSource(old));}
 const suppliedDeclaration=text(input[DECLARATION.field]);
 if(suppliedDeclaration&&!priorDeclarations.some(x=>text(x?.content)===suppliedDeclaration)){
  sources.push(buildInputSource({id:declarationId(priorDeclarations),type:'text',label:DECLARATION.label,content:suppliedDeclaration,sourceRole:DECLARATION.sourceRole,provenance:{origin:DECLARATION.origin,providedBy:'user',collectedAt:now()},metadata:{createdAt:now(),updatedAt:now()}}));
 }
 return freeze(buildInputBundle({sources,context:{domain:'professional_identity',application:'private_beta',locale:text(input.uiLocale)||'it'}}));
}
export function serializeProfessionalSourcesForParser(sources=[]){return (Array.isArray(sources)?sources:[]).map(s=>`[SOURCE id=${s.id} role=${s.sourceRole} origin=${s.provenance?.origin||''}]\n${text(s.content)}\n[/SOURCE]`).join('\n\n');}
export function projectProfessionalSourceSummary({sources=[],candidateSourceProfiles=[]}={}){
 return freeze((Array.isArray(sources)?sources:[]).map(source=>{const match=(candidateSourceProfiles||[]).find(x=>x.sourceId===source.id);return {sourceId:source.id,sourceRole:source.sourceRole,provenance:{origin:source.provenance?.origin||null,providedBy:source.provenance?.providedBy||null,collectedAt:source.provenance?.collectedAt||null},candidateProfile:match?.candidateProfile||null};}));
}
