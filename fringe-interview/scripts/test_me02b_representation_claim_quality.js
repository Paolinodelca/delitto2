import assert from 'assert';
import fs from 'fs';
import { buildRepresentationValueProofProjection } from '../src/app/buildRepresentationValueProofProjection.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const source={professionalPerception:{emergingImage:{roleTarget:'R&D Engineering Lead'},perceptionV2:{whoEmerges:{narrative:'Emerge un profilo tecnico affidabile, orientato alla responsabilità e alla continuità progettuale.'},credibilityAssets:{narrative:'Il profilo appare affidabile e orientato alla responsabilità tecnica e progettuale.'},targetDistance:{bridgeNarrative:'La profondità specialistica in ottica deve essere caratterizzata meglio rispetto al target.'}},visibleSignals:[{label:'Ingegneria meccanica'},{label:'Gestione della produzione'},{label:'Riduzione costi'}],underVisibleSignals:[{label:'Conoscenze di ottica'},{label:'Ruolo esatto nel team'}],perceptionGap:[{area:'ottica',narrative:'La profondità specialistica in ottica non è stata esplorata direttamente.'}]}};
const candidate={candidateProfile:{experienceSignals:{yearsDetected:'circa 8 anni nel team R&D dedicato a tecniche ottiche'},domainSignals:['tecniche ottiche','ricerca e sviluppo'],skills:{technical:['ottica applicata','progettazione meccanica']},education:['formazione tecnica con elementi di ottica'],evidence:{evidenceRichAreas:['esperienza R&D in tecniche ottiche']}}};
const before=JSON.stringify({source,candidate});
const out=buildRepresentationValueProofProjection({professionalPerceptionReport:source,targetRole:'R&D Engineering Lead',candidateProfile:candidate});
assert(out.claims.length>=2&&out.claims.length<=4);
assert.equal(out.persistent,false); assert.equal(out.sourceOfTruth,false); assert.equal(out.hasPrimaryScore,false);
assert.equal(JSON.stringify({source,candidate}),before,'canonical inputs mutated');
assert.equal(out.claims.filter(c=>c.id==='credibility_assets').length,0,'semantic paraphrase should be consolidated');
const optics=out.claims.flatMap(c=>c.uncertainty||[]).find(x=>x?.label==='Conoscenze di ottica');
assert(optics); assert.equal(optics.status,'historically_supported_partially_characterized');
assert(optics.supportingEvidence.some(e=>e.sourceRef.startsWith('candidateProfile.domainSignals')));
assert(optics.supportingEvidence.some(e=>e.sourceRef.startsWith('candidateProfile.skills.technical')||e.sourceRef.startsWith('candidateProfile.education')));
assert(!out.claims.some(c=>c.claim&&c.supportingEvidence?.some(e=>e.summary===c.claim)),'claim cannot be its own evidence');
for(const c of out.claims){const labels=c.supportingEvidence.map(e=>e.summary.toLowerCase());assert.equal(labels.length,new Set(labels).size);}
assert(!JSON.stringify(out).includes('certificat')&&!JSON.stringify(out).includes('mastery'));
const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'feedback',report:{available:true,representationValueProof:out}}});
assert(html.includes('La storia professionale sostiene questo ambito'));
assert(html.includes('Questa lettura deriva dalla convergenza'));
const renderer=fs.readFileSync('src/app/renderPrivateBetaUiJourneyHtml.js','utf8');
assert(!renderer.includes('La storia professionale sostiene questo ambito'));
assert(!renderer.includes('Questa lettura deriva dalla convergenza'));
console.log('ME-02B Representation Claim Quality tests PASSED');
