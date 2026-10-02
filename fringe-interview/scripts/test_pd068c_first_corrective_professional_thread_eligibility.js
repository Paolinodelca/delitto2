import assert from 'node:assert/strict';
import {composeProfessionalThreads,selectLevel1ProfessionalThreads} from '../src/app/professionalThreadComposition.js';
import {buildTargetIndependentProfessionalRepresentation} from '../src/app/buildTargetIndependentProfessionalRepresentation.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const roles=[{sourceId:'old',role:'Industrialization Engineer',status:'previous'},{sourceId:'now',role:'Production Supervisor',status:'current'}];
const chronologyOnly=composeProfessionalThreads({professionalMeaning:{supportedPatterns:[],selectedEpisodeContributions:[],knowledgeContribution:[]},roleHistory:roles});
assert.equal(chronologyOnly.some(t=>t.kind==='role_history_continuity'),false,'role succession must not become professional continuity');

const recurrence={kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['old','now'],episodeRefs:['a','b'],supports:[{sourceId:'old',supportExcerpt:'Coordinamento produzione e qualità.'},{sourceId:'now',supportExcerpt:'Coordinamento produzione e manutenzione.'}],supportCount:2};
const threads=composeProfessionalThreads({professionalMeaning:{supportedPatterns:[recurrence],selectedEpisodeContributions:[{episodeMeaningRef:'ep:1',sourceId:'extra',description:'Episodio distinto',distinctUnitRefs:['ep:1:activity']}],knowledgeContribution:[{semanticType:'decision_accountability',sourceRef:'da',professionalMeaning:'Decisione condivisa',lineage:{sourceRuntimeSessionRef:'r1',sourceRuntimeActionRef:'q1'}},{semanticType:'quantified_outcome',sourceRef:'qo',professionalMeaning:'20%',lineage:{sourceRuntimeSessionRef:'r1',sourceRuntimeActionRef:'q1'}}]}});
assert.equal(threads.some(t=>t.kind==='shared_runtime_lineage'),false,'acquisition lineage must not become professional episode/thread meaning');
assert.equal(threads.filter(t=>t.kind==='bounded_knowledge_meaning').length,2,'knowledge remains representation-eligible and separately reconstructable');
const selected=selectLevel1ProfessionalThreads(threads);
assert.equal(selected.length,3);assert.equal(selected[0].kind,'recurring_pattern','cross-material thread remains first in Level 1');
assert.equal(selected.some(t=>t.kind==='distinct_episode'||t.kind==='bounded_knowledge_meaning'),true,'PD-071 may fill the bounded primary reading with distinct non-subsumed material');

const reordered=selectLevel1ProfessionalThreads([...threads].reverse());
assert.deepEqual(reordered.map(x=>x.threadId),selected.map(x=>x.threadId),'source/internal object order must not determine Level-1 selection');
assert.equal(selected.some(t=>t.score||t.importanceScore||t.fit||t.readiness),false);

const sameWords=composeProfessionalThreads({professionalMeaning:{supportedPatterns:[],selectedEpisodeContributions:[],knowledgeContribution:[{semanticType:'decision_accountability',sourceRef:'a',professionalMeaning:'Atlas'},{semanticType:'quantified_outcome',sourceRef:'b',professionalMeaning:'Atlas'}]}});
assert.equal(sameWords.some(t=>/continuity|shared_runtime_lineage/.test(t.kind)),false,'same wording/project name must not create relationship');

const sources=[{id:'old',sourceRole:'previous_cv',content:'Industrialization Engineer. Coordinamento produzione e qualità.'},{id:'now',sourceRole:'current_cv',content:'Production Supervisor. Coordinamento produzione e manutenzione.'}];
const projection=sources.map(x=>({sourceId:x.id,facts:[x.content],activitySemantics:[{kind:'cross_functional_coordination',supportExcerpt:x.content}],sourceFaithfulExperienceExcerpts:[x.content]}));
const da={semanticType:'decision_accountability',semanticPolicyRef:'professional_semantic_policy:decision_accountability:v1',knowledgeRef:'ks-da',knowledgeSnapshot:{id:'ks-da'},sourceRuntimeSessionRef:'r1',sourceRuntimeActionRef:'q1',sourceEvidenceRef:'e-da',observation:{observationType:'decision_accountability',observationStatus:'observed',observationId:'o-da',evidenceIds:['e-da'],decisionAuthority:'shared',consequenceScope:'project',accountabilityEvidence:'explicit',context:{episode:'Atlas'},limitations:['shared responsibility'],extensions:{semanticProvenance:{semanticPolicyRef:'professional_semantic_policy:decision_accountability:v1'}}}};
const qo={semanticType:'quantified_outcome',semanticPolicyRef:'professional_semantic_policy:quantified_outcome:v1',knowledgeRef:'ks-qo',knowledgeSnapshot:{id:'ks-qo'},sourceRuntimeSessionRef:'r1',sourceRuntimeActionRef:'q1',sourceEvidenceRef:'e-qo',observation:{observationType:'quantified_outcome',observationId:'o-qo',evidenceIds:['e-qo'],measurableOutcome:'miglioramento',quantitativeValue:{value:20,unit:'percent',approximate:true},contributionRelationship:'contributed',causalityBoundary:'contribution_only',context:{event:'Atlas'},limitations:['contribution only'],extensions:{semanticProvenance:{semanticPolicyRef:'professional_semantic_policy:quantified_outcome:v1'}}}};
const rep=await buildTargetIndependentProfessionalRepresentation({professionalSources:sources,sourceGroundedProjection:projection,reusableKnowledgeResults:[da,qo]});
assert.equal(rep.roleHistory.length,2,'role chronology remains available');
assert.equal(rep.professionalMeaning.level1ProfessionalThreads.length,3);
assert.equal(rep.professionalMeaning.level1ProfessionalThreads[0].kind,'recurring_pattern');
assert.equal(rep.professionalMeaning.professionalThreads.some(t=>t.kind==='shared_runtime_lineage'),false);
assert.equal(rep.professionalMeaning.knowledgeContribution.every(k=>k.lineage?.sourceRuntimeSessionRef==='r1'&&k.lineage?.sourceRuntimeActionRef==='q1'),true,'acquisition lineage remains reconstructable in provenance');
const it=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_understand',sessionRef:'x',preInterview:{targetIndependentProfessionalRepresentation:rep}}});
assert.match(it,/Nel tuo percorso il coordinamento tra funzioni ricorre/);
assert.doesNotMatch(it,/continuità tra il ruolo attuale|stesso episodio acquisito|stesso approfondimento professionale/i);
assert.match(it,/Decisione|decisione|20%|circa 20%/,'standalone knowledge remains reachable below Level 1');
const en=renderPrivateBetaUiJourneyHtml({locale:'en',result:{phase:'purpose_understand',sessionRef:'x',preInterview:{targetIndependentProfessionalRepresentation:rep}}});
assert.doesNotMatch(en,/continuity between your current role|same acquired episode|same professional deepening/i);
assert.equal(rep.persistent,false);assert.equal(rep.professionalMeaning.professionalThreads.every(t=>t.persistent===false),true);
console.log('PD-068C first corrective professional thread eligibility: PASS');
