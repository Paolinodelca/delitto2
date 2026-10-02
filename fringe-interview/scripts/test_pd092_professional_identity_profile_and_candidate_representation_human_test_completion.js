import assert from 'node:assert/strict';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';
import {validateHigherOrderStructureProposal} from '../src/app/higherOrderDescriptiveProfessionalStructureVerticalSlice.js';
import {runGroqChatCompletion} from '../src/infrastructure/groq/runGroqChatCompletion.js';

const sources=[
 {id:'cv-current',sourceRole:'current_cv',content:'Production Supervisor presso Stabilimento Alfa. Coordinamento del lavoro di circa 5 persone di officina, assegnazione attività e priorità.'},
 {id:'cv-prev',sourceRole:'previous_cv',content:'Industrialization Engineer presso Azienda Beta. Coordinamento con qualità e manutenzione durante avviamenti di linea.'},
 {id:'decl-1',sourceRole:'professional_declaration',label:'Risultato linea A',content:'Nel ramp-up della linea A ho contribuito a una decisione condivisa che ha ridotto gli scarti del 12%.'},
 {id:'decl-2',sourceRole:'professional_declaration',label:'Preferenze professionali',content:'Preferisco contesti industriali con responsabilità operative chiare.'}
];
const peopleKnowledge={semanticType:'continuing_people_responsibility',sourceRef:'people-k',sourceRuntimeActionRef:'interviewQuestion:people_scope',sourceExecutionRef:'knowledgeAcquisitionExecution:people',specializedMeasurementResult:{semanticDetail:{continuity:'continuing',peopleScope:{kind:'exact',value:5},professionalContext:'officina',responsibilityKinds:['work_assignment_or_priority_setting']}},supportingEvidence:[{summary:'Ha assegnato attività e priorità a circa 5 persone di officina.'}]};
const decisionKnowledge={semanticType:'decision_accountability',sourceRef:'decision-k',sourceRole:'current_cv',observation:{decisionAuthority:'shared',consequenceScope:'ramp-up linea A',context:'avviamento linea'},supportingEvidence:[{summary:'Decisione condivisa durante il ramp-up.'}]};
const identitySummary={professionalSources:sources,sourceAssets:[],reusableKnowledgeResults:[peopleKnowledge,decisionKnowledge],careerPreferenceContext:{preferredThemes:['contesti industriali'],workContextPreferences:['responsabilità operative chiare']},portableRestore:{imported:true}};
const profileHtml=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'profile'},identityAvailable:true,identitySummary});
assert.match(profileHtml,/id="professional-profile-page"/);
assert.match(profileHtml,/class="profile-page-summary"/);
assert.equal((profileHtml.match(/class="imago-expandable profile-overview-section"/g)||[]).length,3);
assert.match(profileHtml,/Gestisci backup del profilo/);
assert.doesNotMatch(profileHtml,/id="profile-backup"/);
assert.equal((profileHtml.match(/class="profile-material-card/g)||[]).length,4);
assert.match(profileHtml,/Production Supervisor presso Stabilimento Alfa/);
assert.match(profileHtml,/Leggi il contenuto usato da IMAGO/);
assert.match(profileHtml,/circa 5 persone|5 persone/);
assert.match(profileHtml,/assegnazione|priorit/i);
assert.match(profileHtml,/Queste sono preferenze che hai dichiarato|preferenze che hai dichiarato/i);
assert.match(profileHtml,/backup importato/i);
assert.doesNotMatch(profileHtml,/sourceRef|materialRef|Knowledge ID|knowledgeId|sha256|filesystem/i);
assert.match(profileHtml,/class="imago-expandable profile-material-full"/);
assert.match(profileHtml,/class="imago-expandable profile-knowledge-detail"/);

// Three genuinely distinct selected higher-order threads must be able to reach Candidate composition.
const relationship={status:'accepted',relationshipId:'Rcoord',relationshipWording:'Coordinamento documentato tra produzione, qualità e manutenzione.',support:[{sourceId:'cv-prev',grounding:{exactText:'Coordinamento con qualità e manutenzione durante avviamenti di linea.'}}]};
const pattern={kind:'documented_cross_functional_coordination_recurrence',supportCount:2,episodeRefs:['e1','e2'],sourceRefs:['cv-current','cv-prev'],supports:[{sourceId:'cv-current',supportExcerpt:'Coordinamento del lavoro di officina.'},{sourceId:'cv-prev',supportExcerpt:'Coordinamento con qualità e manutenzione durante avviamenti di linea.'}]};
const knowledge=[peopleKnowledge,{...decisionKnowledge,primaryProfessionalMeaning:{kind:'bounded_decision_accountability',observedContext:'ramp-up linea',personContribution:'decisione operativa condivisa',sharedAuthority:true}}];
const ho=(id,wording,refs)=>({status:'accepted',structureId:id,structureWording:wording,claimShape:{subjectScope:'documented_material_structure',structureClaim:'descriptive_combination',personPropertyAssertion:'none',continuityAssertion:'none',leadershipAssertion:'none',ownershipAssertion:'none',responsibilityAssertion:'none',generalAutonomyAssertion:'none',resultCausalityAssertion:'none',targetRelationAssertion:'none'},contributorRefs:refs,persistent:false});
const level1=[
 {kind:'higher_order_descriptive_structure',meaning:{structureRef:'Hcoord',structureWording:'Ricorre il coordinamento operativo tra funzioni diverse.',contributorRefs:['relationship:Rcoord'],claimShape:ho('x','x',[]).claimShape}},
 {kind:'higher_order_descriptive_structure',meaning:{structureRef:'Hpeople',structureWording:'È documentata una responsabilità continuativa su un gruppo di circa 5 persone in officina.',contributorRefs:['knowledge:people-k'],claimShape:ho('x','x',[]).claimShape}},
 {kind:'higher_order_descriptive_structure',meaning:{structureRef:'Hdecision',structureWording:'In un ramp-up emerge una decisione operativa condivisa collegata a un risultato misurabile.',contributorRefs:['knowledge:decision-k'],claimShape:ho('x','x',[]).claimShape}}
];
const representation={professionalMeaning:{level1ProfessionalThreads:level1,professionalThreads:level1,groundedDescriptiveRelationships:[relationship],supportedPatterns:[pattern],knowledgeContribution:knowledge,selectedEpisodeContributions:[]},assets:[{supportClass:'source_grounded',sourceId:'cv-current',sourceRole:'current_cv',formalRole:'Production Supervisor',sourceFaithfulExperienceExcerpts:['Coordinamento del lavoro di officina.']},{supportClass:'source_grounded',sourceId:'cv-prev',sourceRole:'previous_cv',formalRole:'Industrialization Engineer',sourceFaithfulExperienceExcerpts:['Coordinamento con qualità e manutenzione durante avviamenti di linea.']}],episodeMeanings:[]};
const repHtml=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_understand',preInterview:{targetIndependentProfessionalRepresentation:representation}}});
assert.equal((repHtml.match(/class="pd068-reading representation-observation"/g)||[]).length,3,'three distinct selected structures should reach Candidate composition');
assert.equal((repHtml.match(/Su quali esperienze si basa questa lettura/g)||[]).length,3);
assert.match(repHtml,/imago-expandable representation-support/);
assert(!/<summary>[^<]*(?:▼|▶|►|▸|→)[^<]*<\/summary>/.test(repHtml),'no legacy arrow-only expander');

// Bounded semantic alignment: KPI/process-only contributor cannot be pulled into a cross-functional claim.
const claimShape={subjectScope:'documented_material_structure',structureClaim:'descriptive_combination',personPropertyAssertion:'none',continuityAssertion:'none',leadershipAssertion:'none',ownershipAssertion:'none',responsibilityAssertion:'none',generalAutonomyAssertion:'none',resultCausalityAssertion:'none',targetRelationAssertion:'none'};
const contributor=(ref,semanticContent,classes)=>({status:'accepted',contributorRef:ref,contributorType:'grounded_descriptive_professional_relationship',materialRefs:[`m-${ref}`],sourceRefs:[`s-${ref}`],professionalBasisRefs:[`episode:${ref}`],semanticContent,structuredSemanticIdentity:{status:'established',classes,basis:'pd092-regression'}});
const coord1=contributor('c1',{wording:'Cross-functional coordination between production and quality.'},['cross_functional_coordination']);
const coord2=contributor('c2',{wording:'Stakeholder coordination across operations functions.'},['cross_functional_coordination']);
const kpi=contributor('kpi',{wording:'KPI process improvement, supplier ramp-up and performance monitoring.'},['process_performance_improvement']);
const baseProposal={proposalRef:'align',contributorRefs:['c1','kpi'],structureWording:'Recurring cross-functional coordination across production and quality.',compositionBasis:'Cross-functional coordination is the bounded theme.',compositionSemanticClass:'cross_functional_coordination',claimShape,persistence:'representation_only'};
const rejected=validateHigherOrderStructureProposal(baseProposal,{contributors:[coord1,kpi]});
assert.equal(rejected.status,'rejected');
assert(rejected.errors.some(x=>x.includes('contributor_semantic_misalignment:kpi')));
const accepted=validateHigherOrderStructureProposal({...baseProposal,proposalRef:'align-ok',contributorRefs:['c1','c2']},{contributors:[coord1,coord2]});
assert.equal(accepted.status,'accepted');

// Output-token instrumentation: measure before any future completion-budget reduction.
const priorKey=process.env.GROQ_API_KEY, priorFetch=globalThis.fetch;
process.env.GROQ_API_KEY='pd092-test-key';
const diagnostics=[];
globalThis.fetch=async()=>({ok:true,status:200,headers:{get:()=>null},text:async()=>JSON.stringify({choices:[{message:{content:'{"ok":true}'}}],usage:{prompt_tokens:101,completion_tokens:321,total_tokens:422}})});
try{
 const r=await runGroqChatCompletion({task:'pd092_token_usage_probe',systemText:'Return JSON.',userText:'Probe.',maxTokens:4096,maxRetries:0,executionDiagnosticSink:d=>diagnostics.push(d)});
 assert.equal(r.execution.outputCompletionTokens,321);
 assert.equal(r.execution.inputPromptTokens,101);
 assert.equal(r.execution.totalTokens,422);
 assert(diagnostics.some(d=>d.stage==='completed'&&d.outputCompletionTokens===321));
}finally{
 globalThis.fetch=priorFetch;
 if(priorKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=priorKey;
}

console.log('PD-092 Professional Identity Profile / Candidate Representation completion: PASS');
