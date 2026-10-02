import assert from 'node:assert/strict';
import { buildPrivateBetaSourceGroundedProjection } from '../src/app/buildPrivateBetaSourceGroundedProjection.js';
import { buildTargetIndependentProfessionalRepresentation } from '../src/app/buildTargetIndependentProfessionalRepresentation.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const sources=[
 {id:'current',sourceRole:'current_cv',content:'Marco Bianchi. Operations / Manufacturing, circa 12 anni. Production Supervisor. Coordinamento produzione, performance, priorità, process improvement.',provenance:{label:'current_cv'}},
 {id:'previous',sourceRole:'previous_cv',content:'Industrialization Engineer. Industrializzazione e start-up. Lancio di una nuova linea produttiva in Germany con engineering, production e quality.',provenance:{label:'previous_cv'}},
 {id:'atlas',sourceRole:'professional_declaration',content:'Nel progetto Atlas ho coordinato attività di ramp-up fornitore con supply chain, qualità e produzione, definendo priorità e bilanciando continuità, qualità e tempi di recupero.',provenance:{label:'professional_declaration'}},
 {id:'delta',sourceRole:'professional_declaration',content:'Negli ultimi mesi ho iniziato a seguire anche il coordinamento delle attività tra produzione e manutenzione durante interventi programmati. Non dispongo ancora di risultati quantitativi consolidati.',provenance:{label:'professional_declaration'}}
];
const candidateSourceProfiles=[
 {sourceId:'current',sourceRole:'current_cv',provenance:sources[0].provenance,candidateProfile:{summary:'Professionista Operations/Manufacturing con circa 12 anni di esperienza in contesti industriali',currentPositioning:'Production Supervisor in azienda manifatturiera',domainSignals:['Operations','Manufacturing'],experienceSignals:{highlights:['Coordinamento operativo e miglioramento dei processi'],supportExcerpts:['Production Supervisor. Coordinamento produzione, performance, priorità, process improvement.'],yearsDetected:'circa 12 anni'}}},
 {sourceId:'previous',sourceRole:'previous_cv',provenance:sources[1].provenance,candidateProfile:{summary:'Ingegnere di industrializzazione con esperienza in progetti di avviamento produttivo e analisi dei processi',currentPositioning:'Industrialization Engineer',domainSignals:['Industrialization','Manufacturing'],experienceSignals:{highlights:['Partecipazione al lancio di una nuova linea produttiva in Germany con engineering, production e quality'],supportExcerpts:['Lancio di una nuova linea produttiva in Germany con engineering, production e quality.']}}},
 {sourceId:'atlas',sourceRole:'professional_declaration',provenance:sources[2].provenance,candidateProfile:{summary:'Attività nel ramp-up fornitore con supply chain, qualità e produzione',experienceSignals:{highlights:['Coordinamento di azioni e priorità nel progetto Atlas'],supportExcerpts:['Nel progetto Atlas ho coordinato attività di ramp-up fornitore con supply chain, qualità e produzione, definendo priorità e bilanciando continuità, qualità e tempi di recupero.']}}},
 {sourceId:'delta',sourceRole:'professional_declaration',provenance:sources[3].provenance,candidateProfile:{summary:'Attività tra produzione e manutenzione durante interventi programmati',experienceSignals:{highlights:['Coordinamento operativo tra produzione e manutenzione senza risultati quantitativi consolidati'],supportExcerpts:['Negli ultimi mesi ho iniziato a seguire anche il coordinamento delle attività tra produzione e manutenzione durante interventi programmati.']}}}
];
const knowledge=[
 {semanticType:'decision_accountability',semanticPolicyRef:'professional_semantic_policy:decision_accountability:v1',knowledgeRef:'ks-da',knowledgeSnapshot:{id:'ks-da'},observation:{observationType:'decision_accountability',observationStatus:'observed',observationId:'o-da',evidenceIds:['e-da'],decisionAuthority:'shared',consequenceScope:'team',accountabilityEvidence:'explicit_with_outcomes',context:{decision:'Definire le priorità e coordinare le azioni durante la stabilizzazione del progetto Atlas',responsibility:'Coordinamento operativo e gestione di problemi inter-funzionali nel ramp-up del nuovo fornitore',consequence:'Stabilizzazione della linea di produzione e miglioramento delle performance del nuovo fornitore'},limitations:[]}},
 {semanticType:'quantified_outcome',semanticPolicyRef:'professional_semantic_policy:quantified_outcome:v1',knowledgeRef:'ks-qo',knowledgeSnapshot:{id:'ks-qo'},observation:{observationType:'quantified_outcome',observationId:'o-qo',evidenceIds:['e-qo'],measurableOutcome:'miglioramento operativo',quantitativeValue:{value:20,unit:'percent',approximate:true,direction:'increase'},contributionRelationship:'contributed',causalityBoundary:'contribution_only',context:{event:'progetto Atlas'},limitations:['contribution only']}}
];
const projection=buildPrivateBetaSourceGroundedProjection({candidateSourceProfiles,professionalSources:sources});
assert(projection.find(x=>x.sourceId==='previous').facts.some(x=>/Germany/i.test(x)),'material historical highlight must survive bounded projection');

async function materialize(){return buildTargetIndependentProfessionalRepresentation({professionalSources:sources,sourceGroundedProjection:projection,reusableKnowledgeResults:knowledge,locale:'it',useModel:false});}
const r=await materialize();
const r2=await materialize();
assert.deepEqual(r,r2,'repeat Understand materialization must be stable');
assert.equal(r.persistent,false);assert.equal(r.target,null);
assert.equal(r.synthesis.kind,'integrated_professional_synthesis');
assert.equal(r.synthesis.currentRole,'Production Supervisor');
assert.deepEqual(r.synthesis.previousRoles,['Industrialization Engineer']);
assert(r.synthesis.domains.some(x=>/manufacturing/i.test(x)));
assert.equal(r.roleHistory[0].status,'previous');assert.equal(r.roleHistory[0].role,'Industrialization Engineer');
assert.equal(r.roleHistory.at(-1).status,'current');assert.equal(r.roleHistory.at(-1).role,'Production Supervisor');
assert(r.supportingExperiences.some(x=>x.sourceId==='previous'&&x.experienceHighlights.some(h=>/Germany/i.test(h))));
assert(!r.roleHistory.some(x=>x.sourceId==='atlas'||x.sourceId==='delta'),'activities must not become role-history entries');
assert(r.supportingExperiences.some(x=>x.sourceId==='atlas'));
assert(r.supportingExperiences.some(x=>x.sourceId==='delta'));
assert(r.assets.some(x=>x.supportClass==='canonical_knowledge'&&x.semanticType==='decision_accountability'));
assert(r.assets.some(x=>x.supportClass==='canonical_knowledge'&&x.semanticType==='quantified_outcome'));
const da=r.assets.find(x=>x.semanticType==='decision_accountability');const qo=r.assets.find(x=>x.semanticType==='quantified_outcome');
assert.match(da.explanation,/circoscritt|contesto osservato/i);assert.match(qo.explanation,/causalità complessiva|contributo personale/i);
const structured=JSON.stringify(r);
assert.doesNotMatch(structured,/Project Coordinator|Supplier Manager|Maintenance Coordinator|Operations Manager|people manager|formal leadership|stable management capability|general international competence/i);
assert.doesNotMatch(structured,/progressive management|increasing leadership|managerial evolution|ready for/i);
assert.equal(knowledge.length,2);

const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_understand',preInterview:{targetIndependentProfessionalRepresentation:r,sourceGroundedProjection:projection,professionalIdentityContinuity:{recovered:true,reusedKnowledgeCount:2}}}});
const synthesis=html.match(/<p class="integrated-professional-synthesis">([\s\S]*?)<\/p>/)?.[1]||'';
assert.match(synthesis,/Industrialization Engineer/i);assert.match(synthesis,/Production Supervisor/i);assert.match(synthesis,/Manufacturing/i);
assert.doesNotMatch(synthesis,/Production Supervisor\s*·|Industrialization Engineer\s*·/,'top synthesis must not be naive title/summary concatenation');
assert.match(html,/Germany/i);assert.match(html,/Atlas/i);assert.match(html,/produzione e manutenzione/i);
assert(html.indexOf('Industrialization Engineer')<html.indexOf('Production Supervisor')||html.indexOf('data-role-status="previous"')<html.indexOf('data-role-status="current"'));
assert.doesNotMatch(html,/>current_cv<|>previous_cv<|>professional_declaration</i);
assert.match(html,/CV attuale|CV precedente|Esperienza aggiunta/i);
assert.match(html,/responsabilità decisionale circoscritta a quel contesto/i);
assert.match(html,/risultato misurabile/i);
assert.doesNotMatch(html,/Conoscenze canoniche riutilizzabili disponibili/i);
assert.doesNotMatch(html,/Project Coordinator|Supplier Manager|Maintenance Coordinator|Operations Manager|forte capacità decisionale|Sei un decision maker/i);
assert.doesNotMatch(html,/20%[^<]*(produzione e manutenzione|interventi programmati)/i);
console.log('PR-02 corrective professional Representation composition: PASS');
