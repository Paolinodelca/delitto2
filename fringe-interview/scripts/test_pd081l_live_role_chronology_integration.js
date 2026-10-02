import assert from 'node:assert/strict';
import { buildPrivateBetaSourceGroundedProjection } from '../src/app/buildPrivateBetaSourceGroundedProjection.js';
import { buildTargetIndependentProfessionalRepresentation } from '../src/app/buildTargetIndependentProfessionalRepresentation.js';
import { extractSourceGroundedRoleChronology, mergeCompatibleRoleChronologies } from '../src/app/careerDirection/roleChronologyAuthority.js';
import { deriveSustainedRoleExposure, deriveSustainedRoleExposuresFromRoleHistory, TEMPORAL_SUPPORT_CLASSES } from '../src/app/careerDirection/temporalRequirementSupportAuthority.js';
import { evaluateCareerDirections, CURATED_ROLE_REPRESENTATIONS } from '../src/app/careerDirection/index.js';
import { buildTargetIndependentRepresentationSnapshotState, materializeTargetIndependentRepresentationSnapshot, attachRepresentationSnapshotToProfessionalIdentity } from '../src/app/privateBetaProfessionalRepresentationSnapshots.js';

const source=(id,role,content)=>({id,sourceRole:role,content,provenance:{label:id}});
const profile=(s,position)=>({sourceId:s.id,sourceRole:s.sourceRole,provenance:s.provenance,candidateProfile:{summary:position,currentPositioning:position,domainSignals:['Operations','Manufacturing'],experienceSignals:{highlights:[s.content],supportExcerpts:[s.content]}}});
const exact=source('current','current_cv','Production Supervisor. Jan 2020 – Mar 2023. Coordinamento operativo, monitoraggio performance e priorità di produzione.');
const prior=source('previous','previous_cv','Industrialization Engineer. 2014–2018. Industrializzazione e avviamento produttivo.');
const projection=buildPrivateBetaSourceGroundedProjection({candidateSourceProfiles:[profile(exact,'Production Supervisor'),profile(prior,'Industrialization Engineer')],professionalSources:[exact,prior]});
const rep=await buildTargetIndependentProfessionalRepresentation({professionalSources:[exact,prior],sourceGroundedProjection:projection,reusableKnowledgeResults:[],useModel:false});
assert.equal(rep.roleHistory.length,2);assert(rep.roleHistory.every(r=>r.roleRef));
const current=rep.roleHistory.find(r=>r.status==='current');const previous=rep.roleHistory.find(r=>r.status==='previous');
assert.equal(current.chronology.precision,'month');assert.equal(current.chronology.startDate,'2020-01');assert.equal(current.chronology.endDate,'2023-03');
assert.equal(previous.chronology.precision,'year');assert.equal(previous.chronology.startYear,2014);assert.equal(previous.chronology.endYear,2018);assert(!previous.chronology.startDate);
const exposures=deriveSustainedRoleExposuresFromRoleHistory(rep.roleHistory,'2026-09-30');assert.equal(exposures.length,2);assert(exposures.every(x=>x.roleContinuityState==='sustained'));assert(exposures.find(x=>x.roleRef===previous.roleRef).minimumDurationMonths>=12);
// Year precision close to threshold: never invent month/day and fail sustained when minimum is unsafe.
const near=deriveSustainedRoleExposure({roleRef:'r-near',formalRole:'Production Supervisor',startYear:2025,endYear:2026,datePrecision:'year',now:'2026-09-30'});assert.equal(near.durationPrecision,'year');assert.equal(near.minimumDurationMonths,2);assert.equal(near.roleContinuityState,'episodic');assert.equal(near.startDate,null);
const ongoing=extractSourceGroundedRoleChronology({source:source('ongoing','current_cv','Production Supervisor. 2025–present.'),roleRef:'r-current',formalRole:'Production Supervisor'});assert.equal(ongoing.current,true);assert.equal(ongoing.precision,'year');
const ongoingExposure=deriveSustainedRoleExposure({roleRef:ongoing.roleRef,formalRole:ongoing.formalRole,startYear:ongoing.startYear,endYear:ongoing.endYear,current:ongoing.current,datePrecision:ongoing.precision,now:'2026-09-30'});assert.equal(ongoingExposure.roleContinuityState,'episodic'); // conservative minimum Dec-2025 -> Sep-2026
// Compatible duplicates merge provenance; conflict fails closed.
const a={...previous.chronology,sourceRefs:['cv1']},b={...previous.chronology,sourceRefs:['cv2']};const merged=mergeCompatibleRoleChronologies([a,b]);assert.deepEqual(merged.sourceRefs,['cv1','cv2']);
const conflict=mergeCompatibleRoleChronologies([a,{...b,endYear:2019}]);assert.equal(conflict.accepted,false);assert.equal(conflict.rejectionCategory,'conflicting_role_chronology');
// Similar titles / distinct source-bounded role identities remain distinct.
assert.notEqual(current.roleRef,previous.roleRef);
// Current real Beta-style material has only generic years and must not become chronology.
const real=source('real','current_cv','Production Supervisor. Operations / Manufacturing. Circa 12 anni. Coordinamento operativo, monitoraggio performance e priorità di produzione.');
assert.equal(extractSourceGroundedRoleChronology({source:real,roleRef:'formalRole:real',formalRole:'Production Supervisor'}),null);
// Persistence/restart: chronology lives inside the representation snapshot.
const pi={personRef:{type:'person',id:'p1'},professionalIdentityRef:'pi1',representationSnapshots:[]};const state=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:pi,professionalSources:[exact,prior],reusableKnowledgeResults:[]});const snap=materializeTargetIndependentRepresentationSnapshot({professionalIdentity:pi,state,representation:rep,now:'2026-09-30T08:00:00Z'});const saved=attachRepresentationSnapshotToProfessionalIdentity({professionalIdentity:pi,snapshot:snap});const rehydrated=saved.representationSnapshots.find(x=>x.snapshotId===snap.snapshotId).representation;assert.equal(rehydrated.roleHistory.find(x=>x.status==='current').chronology.startDate,'2020-01');
// PD-081 production evaluation receives recovered chronology and yields contextual temporal depth without changing support state.
const evaluation=evaluateCareerDirections({professionalRepresentation:rep,professionalRepresentationRef:snap.snapshotId,roles:CURATED_ROLE_REPRESENTATIONS,sustainedRoleExposures:exposures,now:'2026-09-30T08:01:00Z'});const temporal=Object.values(evaluation.hypotheses[0]?.metadata?.temporalRequirementSupport||{});assert(temporal.some(x=>x.temporalSupportClass===TEMPORAL_SUPPORT_CLASSES.SUSTAINED_ROLE_CONTEXT));
console.log('PD-081L live role chronology integration: PASS');
