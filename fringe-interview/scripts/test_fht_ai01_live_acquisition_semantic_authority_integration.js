const assert=require('assert');
const {buildFhtLiveAcquisitionPurposePlanning,findFhtRuntimeActionAssociation,materializeFhtRuntimeActionAssociation}=require('../src/app/knowledge/buildFhtLiveAcquisitionPurposePlanning');
const {runFhtLiveAcquisitionSemanticBridge}=require('../src/app/knowledge/runFhtLiveAcquisitionSemanticBridge');
const NOW='2026-09-03T14:00:00.000Z';
function da(){return{supported:true,observation:{observationId:'da:test',decisionAuthority:'final',consequenceScope:'team',accountabilityEvidence:'explicit_with_outcomes',responsibilityContinuityMonths:12,context:{episode:'delivery'},inferenceSupportInputs:{evidenceQuality:{state:'not_yet_derived'},sourceConvergence:{state:'not_yet_derived'},consistency:{state:'not_yet_derived'},coverage:{state:'not_yet_derived'}},limitations:[],metadata:{createdAt:NOW}}}}
function qo(){return{supported:true,observation:{observationId:'qo:test',measurableOutcome:'riduzione tempi circa 20%',quantitativeValue:{value:20,unit:'percent',approximation:'approximate',lowerBound:null,upperBound:null},contributionRelationship:'contributed',causalityBoundary:'contribution_only',context:{event:'delivery improvement'},limitations:['contribution only'],metadata:{createdAt:NOW}}}}
(async()=>{
 const planning=buildFhtLiveAcquisitionPurposePlanning({subjectRef:{type:'person',id:'ai01'},sessionKey:'ai01',now:NOW});
 assert.equal(planning.purposes.length,2);
 assert(Array.isArray(planning.runtimeActionAssociations)&&planning.runtimeActionAssociations.length>0);
 const planningJson=JSON.stringify(planning.runtimeActionAssociations);
 assert(!planningJson.includes('semanticPolicyRef'));assert(!planningJson.includes('professional_semantic_policy'));
 const both=findFhtRuntimeActionAssociation(planning,'opening_career_walkthrough');
 assert(both);assert.deepEqual(both.purposeRefs.map(x=>x.goal).sort(),['decision_accountability','quantified_outcome']);
 const daOnly=findFhtRuntimeActionAssociation(planning,'decision_tradeoffs');assert.deepEqual(daOnly.purposeRefs.map(x=>x.goal),['decision_accountability']);
 const adaptiveQo=findFhtRuntimeActionAssociation(planning,'achievement_quantification');assert(adaptiveQo);assert.deepEqual(adaptiveQo.purposeRefs.map(x=>x.goal),['quantified_outcome']);
 const adaptiveDaTradeoff=findFhtRuntimeActionAssociation(planning,'decision_tradeoff_probe');assert(adaptiveDaTradeoff);assert.deepEqual(adaptiveDaTradeoff.purposeRefs.map(x=>x.goal),['decision_accountability']);
 const adaptiveDaResponsibility=findFhtRuntimeActionAssociation(planning,'responsibility_probe');assert(adaptiveDaResponsibility);assert.deepEqual(adaptiveDaResponsibility.purposeRefs.map(x=>x.goal),['decision_accountability']);
 assert.equal(findFhtRuntimeActionAssociation(planning,'stakeholder_examples'),null);
 assert.equal(findFhtRuntimeActionAssociation(planning,'transferability_probe'),null);
 assert.equal(findFhtRuntimeActionAssociation(planning,'leadership_depth'),null);
 assert.equal(findFhtRuntimeActionAssociation(planning,'unrelated_question'),null);
 const inheritedConsistency=materializeFhtRuntimeActionAssociation(planning,{questionKey:'consistency_probe',sourceQuestionKey:'achievement_quantification'});assert(inheritedConsistency);assert.equal(inheritedConsistency.sourceRuntimeActionRef,'interviewQuestion:achievement_quantification');assert.deepEqual(inheritedConsistency.purposeRefs.map(x=>x.goal),['quantified_outcome']);assert(!JSON.stringify(inheritedConsistency).includes('semanticPolicyRef'));
 assert.equal(materializeFhtRuntimeActionAssociation(planning,{questionKey:'consistency_probe',sourceQuestionKey:'stakeholder_examples'}),null);
 for(const ref of both.purposeRefs){const p=planning.purposes.find(x=>x.goal===ref.goal);assert.equal(ref.planItemRef,p.planItemRefs[0]);assert.equal(ref.knowledgeAcquisitionPlanRef,`knowledgeAcquisitionPlan:${p.plan.id}`);assert.equal(ref.knowledgeAcquisitionDesignRef,`knowledgeAcquisitionDesign:${p.design.id}`)}
 const bridgeSource=require('fs').readFileSync(require.resolve('../src/app/knowledge/runFhtLiveAcquisitionSemanticBridge'),'utf8');
 assert(!/ROUTES\s*=/.test(bridgeSource));assert(!/purposeRefsForQuestion/.test(bridgeSource));assert(!/opening_career_walkthrough|decision_tradeoffs|accountability_examples/.test(bridgeSource));
 const answer={answerText:'Ho condiviso la decisione e contribuito a ridurre i tempi di circa 20%.',timestamp:NOW,questionContext:{questionKey:'opening_career_walkthrough'},stepType:'opening',phaseName:'opening'};
 const {buildAcceptedRuntimeAnswerEvidenceStore}=await import('../src/app/registerAcceptedRuntimeAnswerEvidence.js');
 const args={planning,acquisitionActionAssociation:both,acceptedAnswer:answer,buildEvidenceStore:buildAcceptedRuntimeAnswerEvidenceStore,betaSessionId:'b',interviewSessionId:'i',subjectRef:{type:'person',id:'ai01'},now:NOW,decisionAccountabilityExecutor:da,quantifiedOutcomeExecutor:qo};
 const r=await runFhtLiveAcquisitionSemanticBridge(args);assert.equal(r.length,2);
 for(const x of r){assert(x.result.semanticAuthority.resolved);assert(x.result.knowledgeSnapshot);assert.equal(x.evidence.content.provenance.knowledgeAcquisitionExecutionRef,`knowledgeAcquisitionExecution:${x.execution.id}`);assert.equal(x.execution.sourcePlanItemRef,x.planItemRef);assert.equal(x.runtimeActionRef,both.runtimeActionRef)}
 const dr=r.find(x=>x.goal==='decision_accountability');assert(['partial','not_yet_derived'].includes(dr.result.measurementResult.confidenceState));assert.equal(dr.result.measurementResult.confidence,null);
 const qr=r.find(x=>x.goal==='quantified_outcome');assert.equal(qr.result.observation.quantitativeValue.value,20);assert.equal(qr.result.observation.causalityBoundary,'contribution_only');
 const one=await runFhtLiveAcquisitionSemanticBridge({...args,acquisitionActionAssociation:daOnly});assert.equal(one.length,1);assert.equal(one[0].goal,'decision_accountability');
 const adaptiveQoResult=await runFhtLiveAcquisitionSemanticBridge({...args,acquisitionActionAssociation:adaptiveQo,acceptedAnswer:{...answer,answerText:'La produttività è migliorata di circa il 20%.',questionContext:{questionKey:'achievement_quantification'}}});assert.equal(adaptiveQoResult.length,1);assert.equal(adaptiveQoResult[0].goal,'quantified_outcome');assert(adaptiveQoResult[0].result.knowledgeSnapshot);assert.equal(adaptiveQoResult[0].execution.sourcePlanItemRef,adaptiveQo.purposeRefs[0].planItemRef);
 const adaptiveDaResult=await runFhtLiveAcquisitionSemanticBridge({...args,acquisitionActionAssociation:adaptiveDaTradeoff,acceptedAnswer:{...answer,answerText:'Ho scelto la continuità produttiva assumendomi la responsabilità della scelta.',questionContext:{questionKey:'decision_tradeoff_probe'}}});assert.equal(adaptiveDaResult.length,1);assert.equal(adaptiveDaResult[0].goal,'decision_accountability');assert(adaptiveDaResult[0].result.knowledgeSnapshot);assert.equal(adaptiveDaResult[0].execution.sourcePlanItemRef,adaptiveDaTradeoff.purposeRefs[0].planItemRef);
 const noResults=await runFhtLiveAcquisitionSemanticBridge({...args,acquisitionActionAssociation:null});assert.equal(noResults.length,0);
 const unrelatedPercentage=await runFhtLiveAcquisitionSemanticBridge({...args,acquisitionActionAssociation:findFhtRuntimeActionAssociation(planning,'stakeholder_examples'),acceptedAnswer:{...answer,answerText:'Il risultato è cresciuto del 50%.'}});assert.equal(unrelatedPercentage.length,0);
 const unrelatedDecision=await runFhtLiveAcquisitionSemanticBridge({...args,acquisitionActionAssociation:findFhtRuntimeActionAssociation(planning,'stakeholder_examples'),acceptedAnswer:{...answer,answerText:'Ho preso personalmente la decisione finale.'}});assert.equal(unrelatedDecision.length,0);
 const qoOnly={...both,purposeRefs:both.purposeRefs.filter(x=>x.goal==='quantified_outcome')};
 const decisionWordsOnly=await runFhtLiveAcquisitionSemanticBridge({...args,acquisitionActionAssociation:qoOnly,acceptedAnswer:{...answer,answerText:'Ho preso la decisione finale e ne ho risposto personalmente, senza percentuali.'},quantifiedOutcomeExecutor:()=>({supported:false})});assert.equal(decisionWordsOnly.length,1);assert.equal(decisionWordsOnly[0].goal,'quantified_outcome');assert.equal(decisionWordsOnly[0].result.knowledgeSnapshot,null);
 const daPercentage=await runFhtLiveAcquisitionSemanticBridge({...args,acquisitionActionAssociation:daOnly,acceptedAnswer:{...answer,answerText:'Ho migliorato il risultato del 20%.'}});assert.equal(daPercentage.length,1);assert.equal(daPercentage[0].goal,'decision_accountability');
 const changedText=await runFhtLiveAcquisitionSemanticBridge({...args,acceptedAnswer:{...answer,answerText:'Testo completamente diverso senza numeri né decisioni.'}});assert.deepEqual(changedText.map(x=>x.goal),r.map(x=>x.goal));
 const broken={...both,purposeRefs:[{...both.purposeRefs[0],planItemRef:'broken-plan-item'}]};assert.equal((await runFhtLiveAcquisitionSemanticBridge({...args,acquisitionActionAssociation:broken})).length,0);
 const repeat=await runFhtLiveAcquisitionSemanticBridge(args);assert.equal(repeat[0].execution.id,r[0].execution.id);assert.equal(repeat[0].evidence.id,r[0].evidence.id);
 console.log('FHT-AI01 upstream acquisition action association tests PASSED');
})().catch(e=>{console.error(e);process.exit(1)});
