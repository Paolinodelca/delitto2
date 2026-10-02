import assert from 'node:assert/strict';
import { buildTargetIndependentProfessionalRepresentation } from '../src/app/buildTargetIndependentProfessionalRepresentation.js';
const sources=[
 {id:'current',sourceRole:'current_cv',content:'Marco Bianchi. Production Supervisor. 12 anni in Operations / Manufacturing.',provenance:{label:'Current CV'}},
 {id:'previous',sourceRole:'previous_cv',content:'Industrialization Engineer. Lancio di una nuova linea produttiva in Germany con engineering, production e quality.',provenance:{label:'Previous CV'}},
 {id:'atlas',sourceRole:'professional_declaration',content:'Nel progetto Atlas ho coordinato attività di ramp-up fornitore con supply chain, qualità e produzione.',provenance:{label:'Atlas declaration'}},
 {id:'delta',sourceRole:'professional_declaration',content:'Ho iniziato a seguire il coordinamento delle attività tra produzione e manutenzione. Non dispongo ancora di risultati quantitativi consolidati.',provenance:{label:'Latest declaration'}}
];
const projection=[
 {sourceId:'current',sourceRole:'current_cv',facts:['Professionista Operations/Manufacturing con circa 12 anni di esperienza','Production Supervisor']},
 {sourceId:'previous',sourceRole:'previous_cv',facts:['Industrialization Engineer con esperienza di lancio linea in Germany','Industrialization Engineer']},
 {sourceId:'atlas',sourceRole:'professional_declaration',facts:['Esperienza nella gestione di fornitori e coordinazione di supply chain, qualità e produzione','Coordinatore di attività di ramp-up fornitore']},
 {sourceId:'delta',sourceRole:'professional_declaration',facts:['Attività di coordinamento tra produzione e manutenzione senza risultati quantitativi consolidati','Maintenance Coordinator']}
];
const knowledge=[
 {semanticType:'decision_accountability',semanticPolicyRef:'professional_semantic_policy:decision_accountability:v1',knowledgeRef:'ks-da',knowledgeSnapshot:{id:'ks-da'},observation:{observationType:'decision_accountability',observationStatus:'observed',observationId:'o-da',evidenceIds:['e-da'],decisionAuthority:'shared',consequenceScope:'team',accountabilityEvidence:'explicit_with_outcomes',context:{decision:'trade-off operativo',responsibility:'decisione condivisa nel perimetro operativo',consequence:'continuità produttiva'},limitations:[]}},
 {semanticType:'quantified_outcome',semanticPolicyRef:'professional_semantic_policy:quantified_outcome:v1',knowledgeRef:'ks-qo',knowledgeSnapshot:{id:'ks-qo'},observation:{observationType:'quantified_outcome',observationId:'o-qo',evidenceIds:['e-qo'],measurableOutcome:'miglioramento osservato',quantitativeValue:{value:20,unit:'percent',approximate:true,direction:'increase'},contributionRelationship:'contributed',causalityBoundary:'contribution_only',context:{event:'miglioramento produttivo'},limitations:['contribution only']}}
];
const r=await buildTargetIndependentProfessionalRepresentation({professionalSources:sources,sourceGroundedProjection:projection,reusableKnowledgeResults:knowledge,locale:'it',useModel:false});
const j=JSON.stringify(r);
assert.equal(r.type,'target_independent_professional_representation');assert.equal(r.persistent,false);assert.equal(r.target,null);
assert.match(j,/Production Supervisor/i);assert.match(j,/Industrialization Engineer/i);assert.match(j,/Germany/i);assert.match(j,/supply chain/i);assert.match(j,/produzione e manutenzione/i);
assert(r.assets.some(x=>x.supportClass==='canonical_knowledge'&&x.semanticType==='decision_accountability'));assert(r.assets.some(x=>x.supportClass==='canonical_knowledge'&&x.semanticType==='quantified_outcome'));
assert(r.assets.some(x=>x.supportClass==='source_grounded'&&x.sourceId==='atlas'));assert(r.provenance.sourceIds.includes('previous'));assert(r.provenance.knowledgeRefs.includes('ks-da'));
assert.doesNotMatch(j,/Project Coordinator|Supplier Manager|Maintenance Coordinator|Operations Manager|people manager|formal leadership|autonomous investment|stable management capability|general international competence/i);
assert.doesNotMatch(j,/risultati quantitativi consolidati[^\"]*20/i);
assert.equal(knowledge.length,2);
console.log('PR-02 target-independent Professional Representation: PASS');
