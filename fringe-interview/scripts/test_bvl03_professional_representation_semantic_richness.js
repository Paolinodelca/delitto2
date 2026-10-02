import assert from 'node:assert/strict';
import {buildProfessionalRepresentationSynthesisInput,buildDeterministicProfessionalRepresentation} from '../src/app/buildProfessionalRepresentationSynthesis.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const da={semanticType:'decision_accountability',sourceRef:'runtimeKnowledgeResults[0]',evidenceIds:['e-da'],decisionAuthority:'shared',consequenceScope:'team',accountabilityEvidence:'explicit_with_outcomes',responsibilityContinuity:{state:'unknown'},context:{decision:'trade-off tra continuità produttiva e intervento manutentivo',responsibility:'decisione operativa nel mio perimetro, coordinata con manutenzione/engineering',consequence:'fermo pianificato e riallineamento delle priorità'},limitations:['event scoped']};
const qo={semanticType:'quantified_outcome',sourceRef:'runtimeKnowledgeResults[1]',evidenceIds:['e-qo'],measurableOutcome:'miglioramento della produttività di circa il 20%',quantitativeValue:{value:20,unit:'percent',approximate:true,direction:'increase'},contributionRelationship:'contributed',causalityBoundary:'contribution_only',context:{event:'progetto di miglioramento produttivo'},limitations:['contribution only']};
function build(items,locale='it'){const input=buildProfessionalRepresentationSynthesisInput({authorizedSemanticMaterial:items,locale});return buildDeterministicProfessionalRepresentation({synthesisInput:input,locale});}
const r=build([da,qo]);
const dc=r.claims.find(x=>x.semanticType==='decision_accountability'), qc=r.claims.find(x=>x.semanticType==='quantified_outcome');
// CASE 1 — DA richness.
assert(dc.representationDetails.some(x=>x.kind==='observed_context'&&/trade-off/.test(x.value)));
assert(dc.representationDetails.some(x=>x.kind==='person_contribution'&&/perimetro/.test(x.value)));
assert(dc.representationDetails.some(x=>x.kind==='responsibility_boundary'&&/condivisa/.test(x.value)));
assert(dc.representationDetails.some(x=>x.kind==='outcome'&&/fermo/.test(x.value)));
assert.match(dc.limitations.join(' '),/circoscritta a questo episodio/i);assert.match(dc.limitations.join(' '),/condivisa/i);
// CASE 2 — QO richness.
assert(!qc.representationDetails.some(x=>x.kind==='observed_context'),'QO raw event context must remain hidden until canonically normalized');
assert(!qc.representationDetails.some(x=>x.kind==='outcome'),'QO raw measurableOutcome text must remain hidden until canonically normalized');
assert(qc.representationDetails.some(x=>x.kind==='quantification'&&/20%/.test(x.value)));
assert(qc.representationDetails.some(x=>x.kind==='person_contribution'&&/contributo/.test(x.value)));
assert.equal(qc.supportingSemanticFacts[0].measurableOutcome,qo.measurableOutcome);
assert.match(qc.limitations.join(' '),/non dimostra causalità esclusiva/i);
// CASE 3 — no fabrication.
const noMetric=build([{...qo,context:{event:'progetto'},measurableOutcome:'risultato misurabile',quantitativeValue:{value:20,unit:'percent',approximate:false},}]);
assert(!JSON.stringify(noMetric).includes('KPI'));assert(!JSON.stringify(noMetric).includes('before'));
// CASE 4 — no generalization.
assert.doesNotMatch(JSON.stringify(dc),/leadership|competenza generale positiva|project ownership/i);
// CASE 5 — no exclusive causality.
assert.doesNotMatch(qc.professionalClaim,/causalità esclusiva|ownership esclusiva/i);assert.match(qc.limitations.join(' '),/causalità esclusiva/i);
// CASE 6 — not observed: unsupported semantic material still produces no claim.
assert.equal(build([{...qo,measurableOutcome:'',quantitativeValue:null}]).claims.length,0);
// CASE 7/8 — UI visibility + IT/EN localization.
for(const locale of ['it','en']){const rep=build([da,qo],locale);const html=renderPrivateBetaUiJourneyHtml({locale,result:{phase:'feedback',sessionRef:'s',report:{available:true,professionalRepresentation:rep}}});assert.match(html,/representation-details/);assert.match(html,/20%/);assert.doesNotMatch(html,/runtimeKnowledgeResults\[|e-da|e-qo/);if(locale==='it'){assert.match(html,/Contesto osservato/);assert.match(html,/Perimetro di responsabilità/);}else{assert.match(html,/Observed context/);assert.match(html,/Responsibility boundary/);}}
console.log('BVL-03 professional representation semantic richness: PASS');

// Production-shaped staged journey: rich semantic material must reach the real report/UI boundary.
const {readFile}=await import('node:fs/promises');
const {prepareStagedPrivateBetaJourney,continueStagedPrivateBetaJourney,answerStagedPrivateBetaJourney}=await import('../src/app/privateBetaJourneyIntegration.js');
const load=async n=>JSON.parse(await readFile(new URL(`../fixtures/${n}`,import.meta.url),'utf8'));
const adapter=async({task})=>task==='candidateProfile'?JSON.stringify(await load('expected_candidate_profile_01.json')):task==='roleProfile'?JSON.stringify(await load('expected_role_profile_01.json')):task==='jobFitAnalysis'?JSON.stringify(await load('expected_job_fit_analysis_01.json')):'{}';
const cv=await readFile(new URL('../fixtures/sample_cv_01.txt',import.meta.url),'utf8'),jd=await readFile(new URL('../fixtures/sample_jd_01.txt',import.meta.url),'utf8');
const daExec=()=>({supported:true,observation:{observationId:'da:bvl03',decisionAuthority:'shared',consequenceScope:'team',accountabilityEvidence:'explicit_with_outcomes',responsibilityContinuity:{state:'unknown'},context:{decision:'trade-off operativo',responsibility:'decisione nel perimetro operativo condivisa con engineering',consequence:'riallineamento delle priorità'},inferenceSupportInputs:{evidenceQuality:{state:'not_yet_derived'},sourceConvergence:{state:'not_yet_derived'},consistency:{state:'not_yet_derived'},coverage:{state:'not_yet_derived'}},limitations:[],metadata:{createdAt:'2026-09-08T08:00:00.000Z'}}});
const qoExec=()=>({supported:true,observation:{observationId:'qo:bvl03',measurableOutcome:'miglioramento produttivo circa 20%',quantitativeValue:{value:20,unit:'percent',approximate:true,lowerBound:null,upperBound:null},contributionRelationship:'contributed',causalityBoundary:'contribution_only',context:{event:'progetto di miglioramento produttivo'},limitations:['contribution only'],metadata:{createdAt:'2026-09-08T08:00:00.000Z'}}});
let staged=await prepareStagedPrivateBetaJourney({uiInput:{identityAction:'create',workingMode:'independent',consentDecision:'accept',cvText:cv,jdText:jd,targetRole:'Operations Manager',uiLocale:'it'},modelAdapter:adapter});
staged=continueStagedPrivateBetaJourney({state:staged.state,representationAgreement:'continue'});let guard=0;
while(staged.publicResult.phase==='interview'){assert(++guard<20);staged=await answerStagedPrivateBetaJourney({state:staged.state,answer:`Risposta ${guard}: ho contribuito al progetto e al trade-off con un miglioramento di circa 20%.`,decisionAccountabilityExecutor:daExec,quantifiedOutcomeExecutor:qoExec,useRepresentationModel:false});}
assert.equal(staged.publicResult.phase,'feedback');const stagedRep=staged.publicResult.report.professionalRepresentation;assert(stagedRep.claims.some(c=>c.representationDetails?.some(d=>d.kind==='responsibility_boundary')));assert(stagedRep.claims.some(c=>c.representationDetails?.some(d=>d.kind==='quantification'&&/20%/.test(d.value))));const stagedHtml=renderPrivateBetaUiJourneyHtml({locale:'it',result:staged.publicResult});assert.match(stagedHtml,/trade-off operativo/);assert.match(stagedHtml,/circa 20%/);assert.doesNotMatch(stagedHtml,/progetto di miglioramento produttivo/);assert.match(stagedHtml,/non dimostra causalità esclusiva/i);
console.log('BVL-03 production-shaped staged UI visibility: PASS');
