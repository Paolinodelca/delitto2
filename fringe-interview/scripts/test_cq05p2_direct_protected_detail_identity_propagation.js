import assert from 'node:assert/strict';
import { buildApplicationArtifacts } from '../src/app/opportunityApplication/groundedApplicationPackage.js';
import { loadPrivateBetaUiMessages } from '../src/i18n/loadPrivateBetaUiMessages.js';

const same='Responsabilità condivisa sul follow-up operativo.';
const protection=(id)=>Object.freeze({state:'established',dimensions:Object.freeze([{dimension:'responsibility_scope',value:'shared_non_exclusive'}]),protectionProvenance:Object.freeze([{sourceRef:id}])});
const material=(id)=>Object.freeze({id,materialKind:'source_grounded_episode_meaning',authorisedPayload:Object.freeze({description:same}),semanticProtection:protection(id),languageTransformationEligibility:'eligible'});
const a=material('material-A'),b=material('material-B');
const pkg=Object.freeze({type:'grounded_application_package',packageRef:'pkg:test',candidateDocumentData:Object.freeze({displayName:'Marco'}),candidateApplicationMaterials:Object.freeze([a,b]),candidateMaterials:Object.freeze([]),legacyCandidateMaterials:Object.freeze([]),selectedCandidateMaterials:Object.freeze([]),professionalHistory:Object.freeze([Object.freeze({role:'Production Supervisor',organisation:'Example',period:'2024–2026',status:'current',sourceRefs:Object.freeze(['cv1']),responsibilities:Object.freeze([same,same]),protectedDetailRefs:Object.freeze([Object.freeze({text:same,candidateApplicationMaterialRef:'material-A'}),Object.freeze({text:same,candidateApplicationMaterialRef:'material-B'})])})]),documentCompletenessState:Object.freeze({mayProceed:true})});
const u=Object.freeze({type:'opportunity_understanding',opportunityRef:'op:test',label:'Production Engineer'});
const arts=buildApplicationArtifacts({applicationPackage:pkg,opportunityUnderstanding:u,documentLanguage:'it',messages:loadPrivateBetaUiMessages('it')});
const exp=arts.cvContentModel.professionalExperience[0];
assert.equal(exp.details.length,2);assert.equal(exp.details[0].text,exp.details[1].text);
assert.equal(exp.details[0].candidateApplicationMaterialRef,'material-A');assert.equal(exp.details[1].candidateApplicationMaterialRef,'material-B');
assert.equal(exp.details[0].protectionProvenance[0].sourceRef,'material-A');assert.equal(exp.details[1].protectionProvenance[0].sourceRef,'material-B');
assert.equal(exp.details[0].semanticProtection.state,'established');assert.equal(exp.details[1].semanticProtection.state,'established');
assert.equal(exp.details[0].languageTransformationEligibility,'eligible');assert.equal(exp.details[1].languageTransformationEligibility,'eligible');
assert(arts.targetedCv.content.includes(same));assert(!arts.targetedCv.content.includes('material-A'));assert(!arts.targetedCv.content.includes('semanticProtection'));
console.log('CQ-05P2 Direct Protected Detail Identity Propagation: PASS');
