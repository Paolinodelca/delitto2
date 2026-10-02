import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {buildOpportunityUnderstanding,buildGroundedApplicationPackage,buildApplicationArtifacts,buildApplicationProfileTrace} from '../src/app/opportunityApplication/groundedApplicationPackage.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';
import {loadPrivateBetaUiMessages} from '../src/i18n/loadPrivateBetaUiMessages.js';
import {createMemoryPrivateBetaProfessionalIdentityStore,privateBetaPersonRefFromContext} from '../src/app/privateBetaProfessionalIdentityContinuity.js';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';

const valeoLike=`Application Product Technical Leader
Valeo Pianezza
Valeo Group is one of the world's largest Automotive suppliers and serves customers worldwide.
The Role
Be the technical reference for the product and support transversal technical initiatives.
Main Responsibilities
Develop technical standards and roadmap.
Tailor standard process to project needs.
Support and validate technical solutions.
Provide RFQ technical support.
Consolidate stakeholder requirements and resolve conflicts.
Lead technical reviews.
Manage complex internal and external project communication.
Structure work-package and phased delivery.
Support development planning.
Responsible for solution performance.
Responsible for system and customer requirements analysis.
Define high-level architecture.
Coach engineers, support reviewer certification and training.
Required Skills And Experience
Engineering degree.
Automotive-lighting Engineering / Project Management experience required.
English and Italian required.
Package
Competitive package and benefits.
Diversity and inclusion are part of our equal opportunity policy.
Don't miss the opportunity to join us.`;
const t0=performance.now();
const u=buildOpportunityUnderstanding({opportunityText:valeoLike,opportunityLabel:'',uiLanguage:'it',now:'2026-09-30T15:00:00Z'});
const understandingMs=performance.now()-t0;
assert.equal(u.opportunityTitle.value,'Application Product Technical Leader');
assert.equal(u.label,'Application Product Technical Leader');
assert.equal(u.sourceLanguage,'en');
assert.equal(u.artifactLanguageRecommendation,'en');
assert.ok(u.responsibilities.some(x=>/system and customer requirements/i.test(x.statement)));
assert.ok(u.responsibilities.some(x=>/systema|sistema|requisiti di sistema/i.test(x.candidateFacingStatement)));
assert.ok(u.requirements.some(x=>/Engineering degree/i.test(x.statement)));
assert.ok(u.requirements.some(x=>/English and Italian/i.test(x.statement)));
assert.equal(u.requirements.some(x=>/Valeo Group|Required Skills And Experience|Diversity|Don't miss/i.test(x.statement)),false);
assert.equal(u.responsibilities.some(x=>/Valeo Group|Required Skills And Experience|Diversity|Don't miss/i.test(x.statement)),false);
assert.ok(u.employerMarketing.some(x=>/Valeo Group/i.test(x.statement)));
assert.ok(u.diversityLegal.some(x=>/Diversity/i.test(x.statement)));
assert.ok(u.sectionHeadings.some(x=>/Required Skills And Experience/i.test(x.statement)));

const person=privateBetaPersonRefFromContext('pd089');
const representation={type:'target_independent_professional_representation',roleHistory:[
 {sourceId:'current',sourceRole:'current_cv',role:'Production Supervisor',status:'current',chronology:{rawDateExpression:'2022 - 2026'}},
 {sourceId:'previous',sourceRole:'previous_cv',role:'Industrialization Engineer',status:'previous',chronology:{rawDateExpression:'2018 - 2022'}}
],episodeMeanings:[],professionalMeaning:{knowledgeContribution:[]},provenance:{sourceIds:['current','previous']}};
const record={version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${person.id}`,personRef:person,owner:'person',authorizedMaterials:{cvText:'Production Supervisor'},professionalSources:[
 {id:'current',sourceRole:'current_cv',content:'Production Supervisor. Coordinated daily production activities.',metadata:{organisation:'Alfa Manufacturing'},provenance:{origin:'candidate_upload'}},
 {id:'previous',sourceRole:'previous_cv',content:'Industrialization Engineer. Supported production-line launch.',metadata:{organisation:'Beta Systems'},provenance:{origin:'candidate_upload'}}
],sourceAssets:[],reusableKnowledgeResults:[],knowledgeRefs:[],revision:7,createdAt:'2026-09-29T10:00:00Z',updatedAt:'2026-09-30T14:00:00Z',lastEnrichedBySessionRef:null,representationSnapshots:[{version:'1.1',type:'professional_representation_snapshot',snapshotId:'rep1',personRef:person,professionalIdentityRef:`professionalIdentity:${person.id}`,purpose:'professional_representation_understand',context:'target_independent',materializedAt:'2026-09-30T13:00:00Z',relevantStateFingerprint:'pd089-state',sourceStateFingerprint:'pd089-source',knowledgeStateFingerprint:'pd089-knowledge',authorizationStateFingerprint:'pd089-auth',recipe:{id:'target_independent_professional_representation',version:'2.0'},changeCause:'initial_materialization',representation,provenance:representation.provenance,limitations:[]}],currentRepresentationSnapshotRefs:{professional_representation_understand:'rep1'},candidateProfileDerivedPreparation:{version:'1.0',type:'candidate_profile_derived_preparation',aggregate:{candidateProfile:{education:['Master Degree in Mechanical Engineering'],skills:{technical:['FMEA','APQP','Technical reviews']},languages:['Italian','English']}}},applicationState:{careerPreferenceContext:{candidateDeclared:true},activePurpose:'opportunity_application'},portableRestore:{imported:true,sourceSchemaVersion:2,restoredAt:'2026-09-30T14:00:00Z'}};
const trace=buildApplicationProfileTrace({professionalIdentity:record});
assert.equal(trace.applicationConsumesLatestActiveRecord,true);assert.equal(trace.professionalSourceCount,2);assert.equal(trace.representationRoleCount,2);assert.equal(trace.derivedEducationCount,1);assert.equal(trace.sparseOutputDiagnosis,'richer_profile_exists_application_projection_previously_omitted_auxiliary_profile_material');
const t1=performance.now();const pkg=buildGroundedApplicationPackage({professionalIdentity:record,opportunityUnderstanding:u,documentData:{displayName:'Marco Rossi'},now:'2026-09-30T15:01:00Z'});const supportMs=performance.now()-t1;
assert.equal(pkg.professionalHistory.length,2);assert.equal(pkg.professionalHistory[0].period,'2022 - 2026');assert.equal(pkg.professionalHistory[0].organisation,'Alfa Manufacturing');
assert.deepEqual(pkg.auxiliaryProfile.education,['Master Degree in Mechanical Engineering']);assert.ok(pkg.auxiliaryProfile.skills.includes('FMEA'));assert.deepEqual(pkg.auxiliaryProfile.languages,['Italian','English']);
const arts=buildApplicationArtifacts({applicationPackage:pkg,opportunityUnderstanding:u,documentLanguage:'en',messages:loadPrivateBetaUiMessages('en')});
assert.ok(arts.targetedCv.content.includes('Application Product Technical Leader'));assert.ok(arts.coverLetter.content.includes('Application Product Technical Leader'));assert.ok(arts.targetedCv.content.includes('Master Degree in Mechanical Engineering'));assert.ok(arts.targetedCv.content.includes('FMEA'));assert.ok(arts.targetedCv.content.includes('English'));
const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_opportunity_application',productPurpose:'opportunity_application',opportunityApplication:{opportunityUnderstanding:u,groundedApplicationPackage:pkg,applicationArtifacts:arts}},identityAvailable:true,identitySummary:{professionalSources:record.professionalSources,knowledgeCount:0,activePurpose:'opportunity_application',portableRestore:record.portableRestore}});
assert.match(html,/Stai lavorando su una candidatura/);assert.match(html,/Ruolo rilevato: Application Product Technical Leader/);assert.match(html,/Analisi dei requisiti di sistema e del cliente/);assert.match(html,/Originale:/);assert.match(html,/Inglese — consigliato/);assert.match(html,/Profilo professionale utilizzato/);assert.doesNotMatch(html,/Valeo Group is one of the world's largest Automotive suppliers[\s\S]{0,80}Non ho ancora informazioni sufficienti/);
assert.match(html,/class="application-expandable"/);assert.match(html,/summary::\-webkit|summary::-webkit|application-expandable>summary/);

// Purpose selection persists only from explicit purpose action; Application regeneration does not flip it.
const store=createMemoryPrivateBetaProfessionalIdentityStore();await store.save({record});
const transform=async({input})=>({materialRef:input.materialRef,transformedText:input.authorisedPresentationText});
const validate=async({input})=>({materialRef:input.materialRef,verdict:'VALID',violations:[]});
const proposer=async()=>({proposals:[]});
const server=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:store,contextIdFactory:()=> 'pd089',candidateArtifactTransformRunner:transform,candidateArtifactValidationRunner:validate,opportunityRequirementSupportProposer:proposer});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`,cookie='imago_beta_repeat_context=pd089';
let form=new URLSearchParams({identityAction:'recover',workingMode:'independent',productPurpose:'opportunity_application',jdText:valeoLike,targetRole:'',documentLanguage:'en',applicationTemplate:'essential',consentDecision:'accept'});
let r=await fetch(base+'/private-beta/journey',{method:'POST',headers:{cookie,'content-type':'application/x-www-form-urlencoded'},body:form.toString()});assert.equal(r.status,200);let body=await r.text();assert.match(body,/Application Product Technical Leader/);let saved=await store.load({personRef:person});assert.equal(saved.applicationState.activePurpose,'opportunity_application');
form=new URLSearchParams({jdText:valeoLike,targetRole:'Application Product Technical Leader',documentLanguage:'en',applicationTemplate:'essential',documentDisplayName:'Marco Rossi'});r=await fetch(base+'/private-beta/application/generate',{method:'POST',headers:{cookie,'content-type':'application/x-www-form-urlencoded'},body:form.toString()});assert.equal(r.status,200);body=await r.text();assert.match(body,/Stai lavorando su una candidatura/);saved=await store.load({personRef:person});assert.equal(saved.applicationState.activePurpose,'opportunity_application');
r=await fetch(base+'/private-beta',{headers:{cookie}});body=await r.text();assert.match(body,/id="imago-product-landing"/);assert.match(body,/href="\/private-beta\?purpose=opportunity_application"/);assert.match(body,/Profilo IMAGO disponibile/);assert.match(body,/Apri il mio profilo/);await new Promise(r=>server.close(r));
console.log(`PD-089 Application First Human-Test Corrective: PASS (understanding ${understandingMs.toFixed(1)} ms, support/package ${supportMs.toFixed(1)} ms)`);
