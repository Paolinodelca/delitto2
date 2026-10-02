import assert from 'node:assert/strict';
import {buildProfessionalRepresentationSynthesisInput,buildDeterministicProfessionalRepresentation,reconcileProfessionalRepresentationRealization} from '../src/app/buildProfessionalRepresentationSynthesis.js';

const internal='Causal attribution is limited to the stated contribution relationship.';
const raw='KPI PROD_LINE_7; confronto before/after con TOOL_X; monitorato per 6 settimane; circa 20%.';
const qo={semanticType:'quantified_outcome',sourceRef:'runtimeKnowledgeResults[0]',evidenceIds:['e-qo'],measurableOutcome:raw,quantitativeValue:{value:20,unit:'percent',approximate:true,direction:'change'},contributionRelationship:'contributed',causalityBoundary:'contribution_only',context:{event:raw},limitations:[internal]};
const da={semanticType:'decision_accountability',sourceRef:'runtimeKnowledgeResults[1]',evidenceIds:['e-da'],decisionAuthority:'shared',consequenceScope:'team',accountabilityEvidence:null,responsibilityContinuity:{state:'unknown'},context:{decision:'trade-off continuità produttiva',responsibility:'responsabilità condivisa',consequence:'continuità del team'},limitations:['Durata non specificata']};

function rep(locale,material=[qo]){
 const input=buildProfessionalRepresentationSynthesisInput({authorizedSemanticMaterial:material,locale});
 return {input,representation:buildDeterministicProfessionalRepresentation({synthesisInput:input,locale})};
}
const it=rep('it').representation.claims[0];
assert.match(it.professionalClaim,/circa 20%/);
assert.match(it.supportingEvidence[0].summary,/circa 20%/);
assert.match(it.supportingEvidence[0].summary,/contributo/i);
assert.equal(it.limitations.length,1);
assert.match(it.limitations[0],/non dimostra causalità esclusiva/i);
assert.doesNotMatch(JSON.stringify({claim:it.professionalClaim,explanation:it.explanation,evidence:it.supportingEvidence,limitations:it.limitations}),/Causal attribution is limited/);
for(const x of ['PROD_LINE_7','before/after','TOOL_X','6 settimane']) assert.doesNotMatch(JSON.stringify({claim:it.professionalClaim,explanation:it.explanation,evidence:it.supportingEvidence,limitations:it.limitations}),new RegExp(x.replace('/','\\/'),'i'));
assert.doesNotMatch(it.explanation,/KPI|TOOL_X|settimane|before\/after/i);

const en=rep('en').representation.claims[0];
assert.equal(en.limitations.length,1);
assert.match(en.limitations[0],/does not establish sole causality or sole ownership/i);
assert.doesNotMatch(en.explanation,/PROD_LINE_7|TOOL_X|6 weeks|before\/after/i);

const both=rep('it',[da,qo]).representation;
assert.equal(both.claims.length,2);
assert.equal(both.claims[0].semanticType,'decision_accountability');
assert.equal(both.claims[1].semanticType,'quantified_outcome');
assert.match(both.claims[0].explanation,/trade-off continuità produttiva/i);
assert.deepEqual(both.claims[0].supportingSemanticFacts[0].responsibilityContinuity,{state:'unknown'});

const input=rep('it').input, deterministic=rep('it').representation;
const malicious={claims:[{id:deterministic.claims[0].id,professionalClaim:'Collega il contributo al KPI PROD_LINE_7 con circa 20%.',explanation:'Monitorato per 6 settimane con TOOL_X.'}]};
const reconciled=reconcileProfessionalRepresentationRealization({synthesisInput:input,realization:malicious,deterministicRepresentation:deterministic,locale:'it'});
assert.equal(reconciled,null,'model must not reintroduce raw-context-only details');

console.log('FHT-RR01 bounded corrective localization/QO reminder tests passed.');
