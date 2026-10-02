import assert from 'node:assert/strict';
import {runGroqContinuingPeopleResponsibilitySemanticExecutor} from '../src/infrastructure/groq/runGroqContinuingPeopleResponsibilitySemanticExecutor.js';
import {runContinuingPeopleResponsibilityProductionSemanticKnowledgePath} from '../src/app/knowledge/runContinuingPeopleResponsibilityProductionSemanticKnowledgePath.js';
import {buildPrivateBetaSourceGroundedProjection} from '../src/app/buildPrivateBetaSourceGroundedProjection.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const answer='Da circa tre anni, in officina, gestisco direttamente circa 5 persone: assegno le attività e definisco le priorità di lavoro.';
const invalid={interpretationStatus:'SUPPORTED',responsibilityPresence:'supported',continuity:'continuing',responsibilityMode:'formal_line_management_NOT_AUTHORIZED',responsibilityKinds:['work_assignment_or_priority_setting'],peopleScope:{kind:'exact',value:'5',min:null,max:null},professionalContext:{description:'in officina',current:true},eventTime:{description:'Da circa tre anni'},support:{presence:'gestisco direttamente circa 5 persone',continuity:'Da circa tre anni',mode:'gestisco direttamente',peopleScope:'5',professionalContext:'in officina',responsibilityKinds:['assegno le attività e definisco le priorità di lavoro']},limitations:[]};
const valid={interpretationStatus:'SUPPORTED',responsibilityPresence:'supported',continuity:'continuing',responsibilityMode:'informal_operational',responsibilityKinds:['work_assignment_or_priority_setting'],peopleScope:{kind:'category',value:'circa 5 persone',min:null,max:null},professionalContext:{description:'in officina',current:true},eventTime:{description:'Da circa tre anni'},support:{presence:'gestisco direttamente circa 5 persone',continuity:'Da circa tre anni',mode:'gestisco direttamente',peopleScope:'circa 5 persone',professionalContext:'in officina',responsibilityKinds:['assegno le attività e definisco le priorità di lavoro']},limitations:['formal reporting authority not established']};

// Exact current Human-Test semantic shape: parseable candidate -> deterministic rejection -> one bounded recovery.
let calls=0;
const recovered=await runGroqContinuingPeopleResponsibilitySemanticExecutor({evidence:{content:{answerText:answer}},completionRunner:async args=>({content:JSON.stringify(++calls===1?invalid:valid),model:'mock',outputMode:args.strictSchemaCompatible?'json_schema':'json_object',execution:{elapsedMs:7,httpAttemptsUsed:1}})});
assert.equal(recovered.supported,true);
assert.equal(calls,2);
assert.equal(recovered.provider.pd073Recovery.attempted,true);
assert.equal(recovered.provider.pd073Recovery.succeeded,true);
assert.equal(recovered.provider.pd073Recovery.mode,'json_object');

// Recovery is exactly once even when the recovered candidate is still invalid.
calls=0;
const failed=await runGroqContinuingPeopleResponsibilitySemanticExecutor({evidence:{content:{answerText:answer}},completionRunner:async args=>({content:JSON.stringify(++calls===1?invalid:invalid),model:'mock',outputMode:args.strictSchemaCompatible?'json_schema':'json_object'})});
assert.equal(failed.supported,false);
assert.equal(failed.reason,'invalid_provider_output');
assert.equal(calls,2);
assert.equal(failed.diagnostic.pd073Recovery.attempted,true);
assert.equal(failed.diagnostic.pd073Recovery.succeeded,false);

// Final invalid-provider diagnostics may never have attempted=false without an explicit bounded reason.
const invariant=await runContinuingPeopleResponsibilityProductionSemanticKnowledgePath({evidence:{},semanticExecutor:async()=>({supported:false,reason:'invalid_provider_output',diagnostic:{category:'candidate_rejected',validationErrors:['bounded test rejection']}})});
assert.equal(invariant.semanticExecutionTrace.category,'invalid_provider_candidate');
assert.equal(invariant.semanticExecutionTrace.pd073Recovery.attempted,false);
assert.equal(invariant.semanticExecutionTrace.pd073Recovery.notApplicableReason,'injected_semantic_executor_controls_recovery');

// Empty parser placeholders do not become Candidate-facing history rows.
const projection=buildPrivateBetaSourceGroundedProjection({professionalSources:[{id:'empty',sourceRole:'professional_declaration',content:''},{id:'good',sourceRole:'professional_declaration',content:'Ho coordinato un team interfunzionale per ridurre i costi del 15%.',provenance:{collectedAt:'2026-10-02T12:00:00Z'}}],candidateSourceProfiles:[{sourceId:'empty',sourceRole:'professional_declaration',candidateProfile:{summary:'Nessuna informazione professionale fornita'}},{sourceId:'good',sourceRole:'professional_declaration',candidateProfile:{summary:'Coordinamento di un team interfunzionale per ridurre i costi del 15%',experienceSignals:{highlights:['Riduzione costi del 15%'],supportExcerpts:['Ho coordinato un team interfunzionale per ridurre i costi del 15%.']}}}]});
assert.equal(projection.length,1);
assert.equal(projection[0].sourceId,'good');

// Interview first viewport stays accepted; expanded preparation is value-focused and does not re-render profile/material history.
const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'understanding',sessionRef:'s-third',preInterview:{targetRole:'Operations Manager',sourceGroundedProjection:projection,cvReviewReport:{profileRead:{summary:'Profilo completo che non deve essere duplicato nel dettaglio preparazione'},visibleSignals:{professionalTraits:['coordinamento'],technicalSkills:['planning']},targetFocus:{narrative:'Approfondire responsabilità di coordinamento e priorità operative.'},readingRisk:{narrative:'Chiarire il perimetro decisionale rispetto al ruolo target.'},improvementHint:{narrative:'Portare esempi concreti con risultati misurabili.'},missingForCvOptimization:{items:['responsabilità effettive','risultati concreti ottenuti']}}}},identityAvailable:true,identitySummary:{professionalSources:[],reusableKnowledgeResults:[]}});
assert.match(html,/Inizia il colloquio/);
assert.match(html,/Approfondisci la preparazione/);
assert(html.indexOf('Inizia il colloquio')<html.indexOf('Approfondisci la preparazione'));
assert.match(html,/Cosa userà IMAGO/);
assert.match(html,/Su cosa si concentrerà il colloquio/);
assert.match(html,/Approfondire responsabilità di coordinamento/);
assert.doesNotMatch(html,/Profilo completo che non deve essere duplicato/);
assert.doesNotMatch(html,/<section class=\"candidate-material-history\"/);
assert.doesNotMatch(html,/Nessuna informazione professionale fornita/);

console.log('PD-096 Third Corrective live recovery + interview de-duplication: PASS');
