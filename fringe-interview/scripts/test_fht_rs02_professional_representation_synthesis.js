import assert from 'node:assert/strict';
import { buildProfessionalRepresentationSynthesisInput,buildDeterministicProfessionalRepresentation,reconcileProfessionalRepresentationRealization } from '../src/app/buildProfessionalRepresentationSynthesis.js';
import { runProfessionalRepresentationSynthesis } from '../src/app/runProfessionalRepresentationSynthesis.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';
const raw='Nel progetto ho contribuito con analisi operativa, priorità e monitoraggio. Il progetto ha registrato circa il 20% di produttività in più; la responsabilità era condivisa.';
const da={semanticType:'decision_accountability',sourceRef:'runtimeKnowledgeResults[0]',evidenceIds:['e-da'],decisionAuthority:'final',consequenceScope:'team',context:{event:'process improvement'},limitations:['Shared authority preserved.']};
const qo={semanticType:'quantified_outcome',sourceRef:'runtimeKnowledgeResults[1]',evidenceIds:['e-qo'],measurableOutcome:raw,quantitativeValue:{value:20,unit:'percent',approximate:true,direction:'increase'},contributionRelationship:'contributed',causalityBoundary:'contribution_only',context:{event:'process improvement'},limitations:['Sole causality not established.']};
function rep(items=[da,qo],locale='it'){const input=buildProfessionalRepresentationSynthesisInput({authorizedSemanticMaterial:items,locale});return {input,representation:buildDeterministicProfessionalRepresentation({synthesisInput:input,locale})};}
{
 const {representation}=rep([da]);assert.equal(representation.claims.length,1);assert.equal(representation.claims[0].semanticType,'decision_accountability');assert.match(representation.claims[0].professionalClaim,/decisionale/i);
}
{
 const {representation}=rep([qo]);const c=representation.claims[0];assert.match(c.professionalClaim,/circa 20%/i);assert.doesNotMatch(c.professionalClaim,/20percent/i);assert.notEqual(c.professionalClaim,raw);assert.notEqual(c.supportingEvidence[0].summary,c.professionalClaim);assert.match(c.limitations.join(' '),/causalità esclusiva/i);
}
{
 const {input,representation}=rep();assert.equal(representation.claims.length,2);assert.deepEqual(representation.claims.map(c=>c.semanticType),['decision_accountability','quantified_outcome']);assert.match(representation.claims[1].supportingEvidence[0].summary,/circa 20%/i);assert.doesNotMatch(JSON.stringify(representation),/20percent/i);assert.equal(input.targetMaterial,null);
 const bad=reconcileProfessionalRepresentationRealization({synthesisInput:input,deterministicRepresentation:representation,realization:{claims:[{id:representation.claims[0].id,professionalClaim:'Ha piena ownership e sole causality sul 30% del risultato.',explanation:'Leadership score elevato.'},{id:representation.claims[1].id,professionalClaim:representation.claims[1].professionalClaim,explanation:representation.claims[1].explanation}]}});assert.equal(bad,null);
 const malformed=reconcileProfessionalRepresentationRealization({synthesisInput:input,deterministicRepresentation:representation,realization:{foo:1}});assert.equal(malformed,null);
}
{
 const fallback=await runProfessionalRepresentationSynthesis({authorizedSemanticMaterial:[qo],locale:'it',useModel:true,narrativeRealizer:async()=>{throw new Error('provider down')}});assert.equal(fallback.representation.realization.mode,'deterministic_fallback');assert.doesNotMatch(fallback.representation.claims[0].professionalClaim,/20percent/i);
 const rejected=await runProfessionalRepresentationSynthesis({authorizedSemanticMaterial:[qo],locale:'it',useModel:true,narrativeRealizer:async()=>({rawContent:JSON.stringify({claims:[{id:'professional_representation_qo_0',professionalClaim:'Ha ottenuto il 99% con sole ownership.',explanation:'Risultato certo.'}]})})});assert.equal(rejected.representation.realization.mode,'deterministic_fallback');
}
{
 const {representation}=rep();const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'feedback',sessionRef:'s1',report:{available:true,professionalRepresentation:representation}}});assert.match(html,/Cosa emerge/);assert.match(html,/Perché emerge/);assert.match(html,/Evidenze di supporto/);assert.match(html,/circa 20%/);assert.doesNotMatch(html,/20percent/);assert.doesNotMatch(html,new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
}

{
 const invalid=buildProfessionalRepresentationSynthesisInput({authorizedSemanticMaterial:[{...qo,evidenceIds:[]}],locale:'it'});assert.equal(invalid.semanticUnits.length,0);
 const unsupported=buildProfessionalRepresentationSynthesisInput({authorizedSemanticMaterial:[{semanticType:'people_leadership',sourceRef:'runtimeKnowledgeResults[9]',evidenceIds:['e9']}],locale:'it'});assert.equal(unsupported.semanticUnits.length,0);
 const notObserved=buildProfessionalRepresentationSynthesisInput({authorizedSemanticMaterial:[{...qo,semanticType:'quantified_outcome',sourceRef:'runtimeKnowledgeResults[2]',evidenceIds:['e2'],measurableOutcome:'',quantitativeValue:null}],locale:'it'});const r=buildDeterministicProfessionalRepresentation({synthesisInput:notObserved,locale:'it'});assert.equal(r.claims.length,0);
}

console.log('FHT-RS02 professional representation synthesis: PASS');
