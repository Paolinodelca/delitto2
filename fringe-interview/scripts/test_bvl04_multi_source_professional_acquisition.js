import assert from 'assert';
import { buildPrivateBetaProfessionalSourceBundle, serializeProfessionalSourcesForParser } from '../src/app/privateBetaProfessionalSources.js';
import { prepareStagedPrivateBetaJourney } from '../src/app/privateBetaJourneyIntegration.js';
import { buildPrivateBetaProfessionalIdentityContinuityRecord, createMemoryPrivateBetaProfessionalIdentityStore, privateBetaPersonRefFromContext } from '../src/app/privateBetaProfessionalIdentityContinuity.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const now=()=> '2026-09-08T09:00:00.000Z';
const current='CURRENT ONLY: Operations Manager, current plant role.';
const old='OLD ONLY: Earlier industrialization launch in Germany.';
const declaration='DECLARATION ONLY: Coordinated supplier ramp-up during Project Atlas.';
const bundle=buildPrivateBetaProfessionalSourceBundle({input:{cvText:current,previousCvText:old,professionalDeclaration:declaration,uiLocale:'it'},now});
assert.equal(bundle.sources.length,3);
assert.deepEqual(bundle.sources.map(x=>x.sourceRole),['current_cv','previous_cv','professional_declaration']);
assert.deepEqual(bundle.sources.map(x=>x.provenance.origin),['current_cv','previous_cv','user_declaration']);
assert(bundle.sources.every(x=>x.provenance.providedBy==='user'));
const serialized=serializeProfessionalSourcesForParser(bundle.sources);assert(serialized.includes('id=previous_cv'));assert(serialized.includes('OLD ONLY'));

const candidateFor=text=>({candidateProfile:{summary:text,skills:{technical:[],soft:[]},experienceSignals:{yearsDetected:null,senioritySignals:[]},domainSignals:[],evidence:{evidenceRichAreas:[],evidenceWeakAreas:[],evidenceGaps:[]},education:[]}});
const adapter=async({task,user})=>{
 if(task==='candidateProfile'){
  const parts=[];if(user.includes('CURRENT ONLY'))parts.push('current plant role');if(user.includes('OLD ONLY'))parts.push('industrialization launch Germany');if(user.includes('DECLARATION ONLY'))parts.push('supplier ramp-up Project Atlas');return JSON.stringify(candidateFor(parts.join(' | ')));
 }
 if(task==='roleProfile')return JSON.stringify({roleProfile:{roleSummary:'Operations target',responsibilities:[],requirements:{mustHave:[],niceToHave:[]},successSignals:[],riskSignals:[]}});
 if(task==='jobFitAnalysis')return JSON.stringify({jobFitAnalysis:{overallFit:'unknown',strengths:[],gaps:[],risks:[],interviewPriorities:[]}});
 return '{}';
};
const common={jdText:'Operations Manager role',targetRole:'Operations Manager',consentDecision:'accept',identityAction:'create',workingMode:'independent',uiLocale:'it',sessionLocale:'it'};
const before=await prepareStagedPrivateBetaJourney({uiInput:{...common,cvText:current},modelAdapter:adapter,now});
const after=await prepareStagedPrivateBetaJourney({uiInput:{...common,cvText:current,previousCvText:old,professionalDeclaration:declaration},modelAdapter:adapter,now});
assert(before.state&&after.state);
const beforeSummary=before.publicResult.preInterview.candidateProfile?.candidateProfile?.summary||before.publicResult.preInterview.candidateProfile?.summary||'';
const afterSummary=after.publicResult.preInterview.candidateProfile?.candidateProfile?.summary||after.publicResult.preInterview.candidateProfile?.summary||'';
assert(!beforeSummary.includes('Germany'));assert(afterSummary.includes('Germany'));assert(afterSummary.includes('Project Atlas'));
const sourceProfiles=after.state.session.parserResult.candidateSourceProfiles;assert.equal(sourceProfiles.length,3);assert(sourceProfiles.find(x=>x.sourceRole==='previous_cv').candidateProfile.summary.includes('Germany'));assert(sourceProfiles.find(x=>x.sourceRole==='professional_declaration').candidateProfile.summary.includes('Project Atlas'));
// Source support remains separate; no document/declaration semantic promotion.
assert.equal(after.state.session.runtimeKnowledgeResults.length,0);
// Conflicting source claims are not reconciled by the source boundary.
const conflict=buildPrivateBetaProfessionalSourceBundle({input:{cvText:'Role: Manager',previousCvText:'Role: Engineer'},now});assert.equal(conflict.sources.length,2);assert.equal(conflict.sources[0].content,'Role: Manager');assert.equal(conflict.sources[1].content,'Role: Engineer');

const personRef=privateBetaPersonRefFromContext('bvl04-person');after.state.personRef=personRef;after.state.session.professionalSources=bundle.sources;
const saved=buildPrivateBetaProfessionalIdentityContinuityRecord({personRef,session:after.state.session,now:now()});assert.equal(saved.professionalSources.length,3);assert.equal(JSON.stringify(saved).includes('Operations Manager role'),false);
// REOPEN + enrich with a new declaration while retaining A/B.
const recoveredBundle=buildPrivateBetaProfessionalSourceBundle({input:{professionalDeclaration:'NEW DECLARATION: led a second ramp-up.',uiLocale:'it'},recoveredSources:saved.professionalSources,now:()=> '2026-09-09T09:00:00.000Z'});assert.equal(recoveredBundle.sources.length,4);assert(recoveredBundle.sources.find(x=>x.sourceRole==='current_cv').content===current);assert(recoveredBundle.sources.find(x=>x.sourceRole==='previous_cv').content===old);const declarations=recoveredBundle.sources.filter(x=>x.sourceRole==='professional_declaration');assert.equal(declarations.length,2);assert(declarations.some(x=>x.content===declaration));assert(declarations.some(x=>x.content.includes('second ramp-up')));
const fakeSession={...after.state.session,professionalSources:recoveredBundle.sources};const enriched=buildPrivateBetaProfessionalIdentityContinuityRecord({personRef,priorRecord:saved,session:fakeSession,now:'2026-09-09T09:00:00.000Z'});assert(enriched.revision>saved.revision);
// Equivalent re-add does not fabricate enrichment.
const sameBundle=buildPrivateBetaProfessionalSourceBundle({input:{professionalDeclaration:'NEW DECLARATION: led a second ramp-up.',uiLocale:'it'},recoveredSources:enriched.professionalSources,now:()=> '2026-09-10T09:00:00.000Z'});const unchanged=buildPrivateBetaProfessionalIdentityContinuityRecord({personRef,priorRecord:enriched,session:{...fakeSession,professionalSources:sameBundle.sources},now:'2026-09-10T09:00:00.000Z'});assert.equal(unchanged.revision,enriched.revision);
// UI visibility + localization.
const htmlIt=renderPrivateBetaUiJourneyHtml({locale:'it'});const htmlEn=renderPrivateBetaUiJourneyHtml({locale:'en'});assert(htmlIt.includes('name="previousCvText"'));assert(htmlIt.includes('CV precedente'));assert(htmlEn.includes('Previous CV'));const understandingHtml=renderPrivateBetaUiJourneyHtml({locale:'it',result:after.publicResult});assert(understandingHtml.includes('professional-sources'));assert(understandingHtml.includes('CV precedente'));assert(understandingHtml.includes('Esperienza aggiunta'));
console.log('BVL-04 multi-source professional acquisition tests PASSED');
