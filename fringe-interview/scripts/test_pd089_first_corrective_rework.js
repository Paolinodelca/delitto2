
import assert from 'node:assert/strict';
import {buildOpportunityUnderstanding,buildGroundedApplicationPackage,buildApplicationArtifacts} from '../src/app/opportunityApplication/groundedApplicationPackage.js';
import {proposeLiveOpportunityRequirementSupport,clearOpportunityRequirementSupportProposalCache} from '../src/app/opportunityApplication/liveRequirementSupportProposalProvider.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';
import {loadPrivateBetaUiMessages} from '../src/i18n/loadPrivateBetaUiMessages.js';
import {createMemoryPrivateBetaProfessionalIdentityStore,privateBetaPersonRefFromContext} from '../src/app/privateBetaProfessionalIdentityContinuity.js';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';

const valeoObserved=`Application Product Technical Leader
Valeo Pianezza
Our Pianezza plant is part of our Light Business Group in charge of developing and manufacturing Lighting Products and Electronics.
As a Application Product Technical Leader in Valeo Pianezza you will have the opportunity to work with the most powerful carmaker companies, in the electronics development working in an international and multicultural environment.
Main Activities and Mission of the role
Be the referent in his domain, build the technical knowledge & add the technical depth to the organization:
Is the reference in his domain for Valeo. Capitalize best practices;
Define standard's roadmaps. Ensure standard excellence. Continuously improve standards by anticipating technical breakthroughs;
Lead and follow-up on transversal initiatives at site level and/or group level;
Support the team leader in tailoring the standard processes based on project needs;
Communicates across Valeo Discipline Network and meets the customer's expectations in his domain.
Support/provide solutions to operational entities and control and validate technical choices made by operational entities:
Support Valeo sites, during competition Phase (RFQ), in the choice of technical solutions;
Develop Discipline requirements by gathering different stakeholders' requirements for complex projects, consolidating them and identifying any conflicting requirements. This can include travel to meet OEMs and customers to facilitate this step;
Perform technical reviews on the different project's activities on the site and group level;
Present work progress continuously through active participation on complex project meetings (Internal and external);
Develop a features list and organize them into work packages delivery phases to ensure maximum value delivered to the customer with each phase (optimize, reuse);
Support Design Leaders & Project Management in the Discipline development planning;
Commit on the performance level of the technical solutions provided.
Can Provide Innovative Technologies Solutions
Responsible for system and customer requirements analysis for new products;
Responsible for high level design architecture definition for new products;
Coach And Train In His Domain
Coach and certify standard technical reviewers at site level and/or group level;
Coach and certify other trainers at site level and/or group level;
Develop and deliver technical training taking into consideration multicultural environments.
Desired skills and experience:
University education in engineering/technical field (Mandatory)
2-3 years experience in Engineering / Project Management roles focused on automotive lighting product development
Fluent English and Good Italian (B2 level minimum mandatory)
Package
Permanent Contract
CCNL Metalmeccanico, B2
Base Gross Annual Salary 44.000 €`;

const u=buildOpportunityUnderstanding({opportunityText:valeoObserved,opportunityLabel:'',uiLanguage:'it',now:'2026-09-30T16:30:00Z'});
assert.equal(u.opportunityTitle.value,'Application Product Technical Leader');
assert.equal(u.label,'Application Product Technical Leader');
assert(u.employerContext.some(x=>/Pianezza plant/i.test(x.statement)));
assert(!u.responsibilities.some(x=>/Pianezza plant/i.test(x.statement)));
assert(u.roleMission.some(x=>/^As a Application Product Technical Leader/i.test(x.statement)));
for(const rx of [
 /reference in his domain/i,/Capitalize best practices/i,/standard's roadmaps/i,/transversal initiatives/i,
 /tailoring the standard processes/i,/Valeo Discipline Network/i,/RFQ/i,/stakeholders' requirements/i,
 /technical reviews/i,/Present work progress/i,/work packages delivery phases/i,/development planning/i,
 /performance level of the technical solutions/i,/system and customer requirements/i,/high level design architecture/i,
 /Coach and certify standard technical reviewers/i,/technical training/i
]) assert(u.responsibilities.some(x=>rx.test(x.statement)),String(rx));
assert(u.requirements.some(x=>/University education/i.test(x.statement)));
assert(u.requirements.some(x=>/2-3 years experience/i.test(x.statement)));
assert(u.requirements.some(x=>/Fluent English/i.test(x.statement)));
assert(u.constraints.some(x=>/travel to meet OEMs/i.test(x.statement)));
assert.equal(u.unclassified.length,0);
assert(u.responsibilities.filter(x=>x.candidateFacingStatement!==x.statement).length>=12);
assert(u.responsibilities.some(x=>/high level design architecture/i.test(x.statement)&&/architettura di alto livello/i.test(x.candidateFacingStatement)));
assert(u.requirements.some(x=>/University education/i.test(x.statement)&&/Formazione universitaria/i.test(x.candidateFacingStatement)));

const person=privateBetaPersonRefFromContext('pd089-first-corrective');
const rep={type:'target_independent_professional_representation',roleHistory:[
 {sourceId:'cv-current',sourceRole:'current_cv',role:'Production Supervisor',status:'current',chronology:{rawDateExpression:'2022 - 2026'}},
 {sourceId:'cv-prev',sourceRole:'previous_cv',role:'Industrialization Engineer',status:'previous',chronology:{rawDateExpression:'2018 - 2022'}}
],episodeMeanings:[],professionalMeaning:{knowledgeContribution:[{sourceRef:'knowledge:1',professionalMeaning:'Supported technical reviews',lineage:{sourceEvidenceRef:'e1'}}]},provenance:{sourceIds:['cv-current','cv-prev']}};
const record={version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${person.id}`,personRef:person,owner:'person',authorizedMaterials:{cvText:'Production Supervisor'},professionalSources:[
 {id:'cv-current',sourceRole:'current_cv',content:'Production Supervisor. Coordinated daily production activities.',metadata:{organisation:'Alfa',originalFilename:'Marco_CV.pdf'},provenance:{origin:'candidate_upload'}},
 {id:'cv-prev',sourceRole:'previous_cv',content:'Industrialization Engineer. Supported industrialization projects.',metadata:{organisation:'Beta',originalFilename:'Marco_CV_precedente.docx'},provenance:{origin:'candidate_upload'}},
 {id:'decl-1',sourceRole:'professional_declaration',content:'Supported technical reviews.',metadata:{title:'Esperienza aggiunta'},provenance:{origin:'candidate_input'}},
 {id:'decl-2',sourceRole:'professional_declaration',content:'Worked with cross-functional teams.',metadata:{title:'Materiale aggiunto'},provenance:{origin:'candidate_input'}}
],sourceAssets:[],reusableKnowledgeResults:[{knowledgeSnapshot:{id:'k1'}},{knowledgeSnapshot:{id:'k2'}},{knowledgeSnapshot:{id:'k3'}}],knowledgeRefs:['k1','k2','k3'],revision:9,createdAt:'2026-09-29T10:00:00Z',updatedAt:'2026-09-30T16:00:00Z',lastEnrichedBySessionRef:null,representationSnapshots:[{version:'1.1',type:'professional_representation_snapshot',snapshotId:'rep1',personRef:person,professionalIdentityRef:`professionalIdentity:${person.id}`,purpose:'professional_representation_understand',context:'target_independent',materializedAt:'2026-09-30T15:00:00Z',relevantStateFingerprint:'x',sourceStateFingerprint:'x',knowledgeStateFingerprint:'x',authorizationStateFingerprint:'x',recipe:{id:'target_independent_professional_representation',version:'2.0'},changeCause:'initial_materialization',representation:rep,provenance:rep.provenance,limitations:[]}],currentRepresentationSnapshotRefs:{professional_representation_understand:'rep1'},applicationState:{activePurpose:'opportunity_application'},portableRestore:null};

const fallbackDiagnostics=[];
clearOpportunityRequirementSupportProposalCache();
const failed=await proposeLiveOpportunityRequirementSupport({
 professionalIdentity:record,opportunityUnderstanding:u,
 modelRunner:async()=>{const e=new Error('temporary provider failure');e.status=429;e.model='test-model';e.providerDiagnostic={failureKind:'rate_limit',status:429,providerCode:'rate_limit_exceeded',providerType:'tokens',providerMessage:'Provider rate limit reached.',model:'test-model',outputMode:'json_schema',httpAttemptsUsed:2,elapsedMs:18000,rateLimitMetadata:{retryAfter:'10',remainingTokens:'0'}};throw e;},
 diagnosticSink:x=>fallbackDiagnostics.push(x)
});
assert.equal(failed.degraded,true);
assert.deepEqual(failed.proposals,[]);
const fd=fallbackDiagnostics.at(-1);
assert.equal(fd.stage,'provider_model_call_failed');
assert.equal(fd.task,'opportunityRequirementSupportProposal');
assert.equal(fd.failureKind,'rate_limit');
assert.equal(fd.providerFallbackUsed,true);
assert.equal(fd.modelCallCount,1);
assert.equal(fd.attemptCount,2);
assert.notEqual(fd.stage,'unknown');

const pkg=buildGroundedApplicationPackage({professionalIdentity:record,opportunityUnderstanding:u,requirementSupportProposals:failed.proposals,documentData:{displayName:'Marco Rossi'},now:'2026-09-30T16:31:00Z'});
const arts=buildApplicationArtifacts({applicationPackage:pkg,opportunityUnderstanding:u,documentLanguage:'en',messages:loadPrivateBetaUiMessages('en')});
assert(arts.targetedCv.content.includes('Application Product Technical Leader'));
assert(arts.coverLetter.content.includes('Application Product Technical Leader'));
const emptyGapPkg={...pkg,materialInformationGaps:[{requirementRef:'missing:no-text',statement:''},...pkg.materialInformationGaps]};
const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_opportunity_application',productPurpose:'opportunity_application',opportunityApplication:{opportunityUnderstanding:u,groundedApplicationPackage:emptyGapPkg,applicationArtifacts:arts}},identityAvailable:true,identitySummary:{professionalSources:record.professionalSources,knowledgeCount:3,activePurpose:'opportunity_application'}});
assert.match(html,/Ruolo rilevato: Application Product Technical Leader/);
assert.match(html,/Marco_CV\.pdf/);
assert.match(html,/Production Supervisor/);
assert.match(html,/continuità locale corrente/);
assert.doesNotMatch(html,/<li>\s*<\/li>/);
assert.match(html,/Definizione dell’architettura di alto livello/);
assert.match(html,/Originale:/);

const store=createMemoryPrivateBetaProfessionalIdentityStore();await store.save({record});
const diagnostics=[];
const transform=async({input})=>({materialRef:input.materialRef,transformedText:input.authorisedPresentationText});
const validate=async({input})=>({materialRef:input.materialRef,verdict:'VALID',violations:[]});
const failSoftProposer=async({professionalIdentity,opportunityUnderstanding,diagnosticSink,executionDiagnosticSink})=>proposeLiveOpportunityRequirementSupport({
 professionalIdentity,opportunityUnderstanding,diagnosticSink,executionDiagnosticSink,
 modelRunner:async()=>{const e=new Error('provider transient');e.status=503;e.model='test-model';e.providerDiagnostic={failureKind:'provider_unavailable',status:503,providerCode:'unavailable',providerType:'provider',providerMessage:'Provider request failed.',model:'test-model',outputMode:'json_schema',httpAttemptsUsed:1,elapsedMs:25};throw e;}
});
const server=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:store,contextIdFactory:()=> 'pd089-first-corrective',operatorDiagnosticsEnabled:true,preparationDiagnosticStore:diagnostics,candidateArtifactTransformRunner:transform,candidateArtifactValidationRunner:validate,opportunityRequirementSupportProposer:failSoftProposer});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
try{
 const base=`http://127.0.0.1:${server.address().port}`,cookie='imago_beta_repeat_context=pd089-first-corrective';
 const form=new URLSearchParams({identityAction:'recover',workingMode:'independent',productPurpose:'opportunity_application',jdText:valeoObserved,targetRole:'',documentLanguage:'en',applicationTemplate:'essential',consentDecision:'accept'});
 const response=await fetch(base+'/private-beta/journey',{method:'POST',headers:{cookie,'content-type':'application/x-www-form-urlencoded'},body:form.toString()});
 assert.equal(response.status,200);
 const body=await response.text();
 assert.match(body,/Application Product Technical Leader/);
 const saved=await store.load({personRef:person});assert.equal(saved.applicationState.activePurpose,'opportunity_application');
 const pd=diagnostics.findLast(x=>x.boundary==='pd085_live_opportunity_requirement_support'&&x.providerFallbackUsed===true);
 assert(pd);assert.notEqual(pd.stage,'unknown');assert.notEqual(pd.task,'unknown');assert.notEqual(pd.failureKind,'unknown');
 const done=diagnostics.findLast(x=>x.boundary==='application_preparation'&&x.stage==='application_completed');
 assert(done);assert.equal(done.providerFallbackUsed,true);assert(Number.isFinite(done.elapsedMs));
} finally {await new Promise(r=>server.close(r));}

console.log('PD-089 First Corrective Rework focused regression: PASS');
