import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {prepareStagedPrivateBetaJourney,continueStagedPrivateBetaJourney,answerStagedPrivateBetaJourney} from '../src/app/privateBetaJourneyIntegration.js';
import {buildAcceptedRuntimeAnswerEvidenceStore} from '../src/app/registerAcceptedRuntimeAnswerEvidence.js';

const require=createRequire(import.meta.url);
const M=require('../src/core/measurement/decisionAccountability');
const D=require('../src/core/dimension');
const K=require('../src/core/knowledge');
const A=require('../src/app/knowledge');
const DF=require('./knowledge_acquisition_design_fixture');
const I=require('../src/core/knowledge/knowledgeAcquisitionDeclarativeIdentity');
const {projectDecisionAccountabilityMeasureResult}=require('../src/core/measurement/decisionAccountability/projectDecisionAccountabilityMeasureResult');
const {buildDecisionAccountabilityMeasurementDimensionMapping}=require('../src/core/dimension/buildDecisionAccountabilityMeasurementDimensionMapping');
const {runDecisionAccountabilityProductionSemanticObservation}=await import('../src/app/knowledge/runDecisionAccountabilityProductionSemanticObservation.js');

const now='2026-09-07T08:00:00.000Z';
const partialInference={evidenceQuality:{state:'not_yet_derived'},sourceConvergence:{state:'not_yet_derived'},consistency:{state:'not_yet_derived'},coverage:{state:'not_yet_derived'}};

function observation({authority='shared',scope='team',accountability='explicit',continuity={state:'unknown'},id='obs:da01'}={}){
  return M.buildDecisionAccountabilityObservation({
    observationId:id,decisionAuthority:authority,consequenceScope:scope,accountabilityEvidence:accountability,
    responsibilityContinuity:continuity,context:{decision:'trade-off operativo',responsibility:'perimetro decisionale personale',consequence:'continuità operativa'},
    evidenceIds:['ev:da01'],inferenceSupportInputs:partialInference,limitations:['Shared authority preserved.'],metadata:{createdAt:now}
  });
}

function assertCalculatedUnknownContinuity(authority){
  const o=observation({authority});
  const s=M.buildDecisionAccountabilityMeasureResult({observation:o});
  assert.equal(s.resultStatus,'draft');
  assert.equal(s.components.responsibilityContinuityScore,null);
  assert.equal(s.inferenceSupport.state,'partial');
  assert.equal(s.inferenceSupport.value,null);
  assert.equal(s.inferenceSupport.band,null);
  assert(Number.isFinite(s.score));
  const generic=projectDecisionAccountabilityMeasureResult(s,{calculatedAt:now});
  assert(generic);
  assert.equal(generic.status,'calculated');
  assert.equal(generic.confidenceState,'partial');
  assert.equal(generic.confidence,null);
  const mapping=buildDecisionAccountabilityMeasurementDimensionMapping({now});
  const contributions=D.mapMeasurementResultToDimensionContributions(generic,mapping);
  assert.equal(contributions.length,1);
  let ledger=D.buildKnowledgeLedger({contributions:[],metadata:{createdAt:now,updatedAt:now}},{now});
  ledger=D.appendDimensionContributions(ledger,contributions,{now});
  const snapshot=D.buildKnowledgeSnapshot(ledger,{now});
  assert(snapshot);
  assert(snapshot.dimensionStates.some(x=>x.dimensionId==='decision_accountability'&&x.stateType==='observed'));
}
for(const authority of ['recommendation','shared','final'])assertCalculatedUnknownContinuity(authority);

const unknownAccountability=M.buildDecisionAccountabilityMeasureResult({observation:observation({accountability:null})});
assert.equal(unknownAccountability.resultStatus,'draft');
assert.equal(unknownAccountability.components.accountabilityEvidenceScore,null);
assert(Number.isFinite(unknownAccountability.score));

const multipleUnknown=M.buildDecisionAccountabilityMeasureResult({observation:observation({accountability:null,continuity:{state:'unknown'}})});
assert.equal(multipleUnknown.resultStatus,'draft');
assert.equal(multipleUnknown.components.accountabilityEvidenceScore,null);
assert.equal(multipleUnknown.components.responsibilityContinuityScore,null);
const expected=(.7*.3+.4*.25)/(.3+.25);
assert(Math.abs(multipleUnknown.score-expected)<0.0001,'known applicable weights must be normalized without zero-imputation');

const contextual=M.buildDecisionAccountabilityMeasureResult({observation:observation({authority:'none',scope:null,accountability:null})});
assert.equal(contextual.resultStatus,'contextual');
assert.equal(projectDecisionAccountabilityMeasureResult(contextual,{calculatedAt:now}),null);
const invalid=M.buildDecisionAccountabilityMeasureResult({observation:{}});
assert.equal(invalid.resultStatus,'invalid');

// Canonical authority chain for production trace diagnostics.
function canonicalDesign(){const c=DF.buildChain('elementary');const requirement=JSON.parse(JSON.stringify(c.requirement));requirement.scope='dimension';requirement.scopeRef='decision_accountability';requirement.id=I.calculateKnowledgeAcquisitionRequirementId(requirement);return K.buildKnowledgeAcquisitionDesign({requirement,resolvedContext:c.resolvedContext,semanticPolicyRef:'professional_semantic_policy:decision_accountability:v1'});}
function chain(){const design=canonicalDesign();const capability={capabilityRef:'capability:structured-input-v1',capabilityType:'structured_input',supportedDesignTypes:['elementary_acquisition_design'],supportedKnowledgeLayers:['elementary'],supportedOutputTopologies:['elementary_knowledge_contribution_set'],supportedPrerequisiteModes:['none'],supportedObligations:['must_preserve_source_traceability','must_produce_elementary_contribution'],constraints:{},metadata:{version:'1.0'},extensions:{}};const match=K.buildKnowledgeAcquisitionCapabilityMatch({design,capabilityCandidate:capability});const decision=A.buildKnowledgeAcquisitionSolutionDecision({design,matches:[match],candidateSnapshots:[{capabilityRef:capability.capabilityRef,capabilityType:'structured_input',metadata:{version:'1.0'},extensions:{}}],decisionContext:{contextRef:'applicationDecisionContext:da01',approvalState:'approved',decisionTimestamp:now},decisionPolicy:{policyRef:'applicationDecisionPolicy:da01',allowedModes:['single'],allowComposition:false,criteria:['explicit_request']},decisionRequest:{mode:'single',selectedCapabilityRefs:[capability.capabilityRef],reasons:[{code:'canonical_slice',category:'adoption',blocking:false}]}});const configuration=A.buildKnowledgeAcquisitionCapabilityConfiguration({solutionDecision:decision,selectedCapabilitySnapshots:[{capabilityRef:capability.capabilityRef,capabilityType:'structured_input',metadata:{version:'1.0'},extensions:{}}],configurationDefinition:{configurationDefinitionRef:'knowledgeAcquisitionConfigurationDefinition:da01',capabilityDefinitions:[{capabilityRef:capability.capabilityRef,parameters:[]}]},applicationConfigurationInput:{applicationConfigurationInputRef:'applicationConfigurationInput:da01',configurationItems:[]}});const plan=A.buildKnowledgeAcquisitionPlan({capabilityConfiguration:configuration});const item=plan.planItems[0].planItemRef;const session=A.buildKnowledgeAcquisitionRuntimeSession({knowledgeAcquisitionPlan:plan,sessionKey:'da01-session',status:'active',activePlanItemRef:item,itemStates:[{sourcePlanItemRef:item,status:'active',activatedAt:now,suspendedAt:null,completedAt:null,abandonedAt:null}],lifecycle:{createdAt:now,updatedAt:now,activatedAt:now,suspendedAt:null,completedAt:null,abandonedAt:null}},{now});const execution=A.buildKnowledgeAcquisitionExecution({knowledgeAcquisitionRuntimeSession:session,knowledgeAcquisitionPlan:plan,executionKey:'da01-execution'},{now});return{design,decision,configuration,plan,session,execution};}
function evidenceFor(c){return buildAcceptedRuntimeAnswerEvidenceStore({betaSessionId:'beta-da01',interviewSessionId:'interview-da01',answers:[{answerText:'Ho deciso nel mio perimetro, condividendo la decisione con engineering.',questionContext:{questionKey:'decision_tradeoff_probe'},stepType:'answer',phaseName:'interview',timestamp:now}],knowledgeAcquisitionExecutionRef:`knowledgeAcquisitionExecution:${c.execution.id}`}).evidence[0];}
const c=chain(), evidence=evidenceFor(c);
const baseCandidate={interpretationStatus:'SUPPORTED',decisionAuthority:'shared',consequenceScope:'team',accountabilityEvidence:null,responsibilityContinuity:{state:'unknown',qualification:null,months:null,minimumMonths:null,maximumMonths:null},context:{decision:'trade-off operativo',responsibility:'authority condivisa',consequence:'continuità operativa'},limitations:['No sole authority.']};
const runProd=semanticExecutor=>runDecisionAccountabilityProductionSemanticObservation({evidence,knowledgeAcquisitionExecution:c.execution,knowledgeAcquisitionPlan:c.plan,capabilityConfiguration:c.configuration,solutionDecision:c.decision,knowledgeAcquisitionDesign:c.design,semanticExecutor,now});

const success=await runProd(async()=>({supported:true,candidate:baseCandidate,provider:{task:'decisionAccountabilitySemanticExecutor',model:'test',outputMode:'json_schema'}}));
assert(success.measurementResult);
assert.equal(success.semanticExecutionTrace.category,'measurement_ready');
assert(!JSON.stringify(success.semanticExecutionTrace).includes(evidence.content.answerText));

const technical=await runProd(async()=>{const e=new Error('provider down');e.providerDiagnostic={failureKind:'provider_unavailable'};throw e;});
assert.equal(technical.semanticExecutionTrace.category,'provider_technical_failure');
assert.equal(technical.semanticExecutionTrace.providerCategory,'provider_unavailable');

const structured=await runProd(async()=>{const e=new Error('structured output rejected');e.providerDiagnostic={failureKind:'structured_output_rejected'};throw e;});
assert.equal(structured.semanticExecutionTrace.category,'provider_structured_output_rejection');

const rejected=await runProd(async()=>({supported:false,reason:'invalid_provider_output',diagnostic:{category:'candidate_rejected'}}));
assert.equal(rejected.semanticExecutionTrace.category,'invalid_provider_candidate');

const unsupported=await runProd(async()=>({supported:false,reason:'unsupported_semantics',diagnostic:{category:'legitimate_unsupported_semantics'}}));
assert.equal(unsupported.semanticExecutionTrace.category,'semantic_insufficiency');

const observationFailure=await runProd(async()=>({supported:true,candidate:{...baseCandidate,decisionAuthority:null}}));
assert.equal(observationFailure.semanticExecutionTrace.category,'observation_validation_failure');

const contextualCandidate={...baseCandidate,decisionAuthority:'none',consequenceScope:null,context:{decision:'budget',responsibility:'nessuna authority decisionale',consequence:null}};
const measurementFailure=await runProd(async()=>({supported:true,candidate:contextualCandidate}));
assert.equal(measurementFailure.semanticExecutionTrace.category,'measurement_insufficient');

// Journey-level: accepted authorized DA answer with unknown continuity reaches runtimeKnowledgeResults.
const load=async n=>JSON.parse(await readFile(new URL(`../fixtures/${n}`,import.meta.url),'utf8'));
const modelAdapter=async({task})=>{
  if(task==='candidateProfile')return JSON.stringify(await load('expected_candidate_profile_01.json'));
  if(task==='roleProfile')return JSON.stringify(await load('expected_role_profile_01.json'));
  if(task==='jobFitAnalysis')return JSON.stringify(await load('expected_job_fit_analysis_01.json'));
  return '{}';
};
const cv=await readFile(new URL('../fixtures/sample_cv_01.txt',import.meta.url),'utf8');
const jd=await readFile(new URL('../fixtures/sample_jd_01.txt',import.meta.url),'utf8');
async function prepared(){
  const out=await prepareStagedPrivateBetaJourney({uiInput:{identityAction:'create',workingMode:'independent',consentDecision:'accept',cvText:cv,jdText:jd,targetRole:'Product Operations Manager',uiLocale:'it'},modelAdapter});
  continueStagedPrivateBetaJourney({state:out.state,representationAgreement:'continue'});
  return out.state;
}
const journeyExecutor=()=>({supported:true,observation:{observationId:'obs:journey-da01',decisionAuthority:'shared',consequenceScope:'team',accountabilityEvidence:null,responsibilityContinuity:{state:'unknown'},context:{decision:'trade-off operativo',responsibility:'authority condivisa',consequence:'continuità operativa'},inferenceSupportInputs:partialInference,limitations:['No sole authority.'],metadata:{createdAt:now}}});
let state=await prepared();
let journey=await answerStagedPrivateBetaJourney({state,answer:'Ho gestito una decisione nel mio perimetro insieme a engineering.',decisionAccountabilityExecutor:journeyExecutor});
state=journey.state;
const daKnowledge=state.session.runtimeKnowledgeResults.find(x=>x.semanticType==='decision_accountability');
assert(daKnowledge?.knowledgeSnapshot);
assert.equal(daKnowledge.observation.responsibilityContinuity.state,'unknown');
assert.equal(daKnowledge.specializedMeasurementResult.components.responsibilityContinuityScore,null);
assert.equal(daKnowledge.specializedMeasurementResult.components.accountabilityEvidenceScore,null);
assert.equal(daKnowledge.measurementResult.confidence,null);
assert.equal(daKnowledge.semanticExecutionTrace.category,'knowledge_produced');
assert(state.session.fhtSemanticExecutionTraces.some(x=>x.category==='knowledge_produced'));
assert(!JSON.stringify(state.session.fhtSemanticExecutionTraces).includes('Ho gestito una decisione nel mio perimetro insieme a engineering.'));

// Journey-level no-Knowledge remains diagnostically distinguishable.
state=await prepared();
journey=await answerStagedPrivateBetaJourney({state,answer:'Non ho elementi sufficienti per attribuirmi quella decisione.',decisionAccountabilityExecutor:()=>({supported:false})});
state=journey.state;
assert(!state.session.runtimeKnowledgeResults.some(x=>x.semanticType==='decision_accountability'));
assert(state.session.fhtSemanticExecutionTraces.some(x=>x.category==='observation_validation_failure'));
assert(!JSON.stringify(state.session.fhtSemanticExecutionTraces).includes('Non ho elementi sufficienti'));

console.log('FHT-DA01 measurement eligibility and semantic failure trace: PASS');
