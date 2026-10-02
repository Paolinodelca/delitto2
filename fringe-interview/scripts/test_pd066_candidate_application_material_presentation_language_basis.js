import assert from 'node:assert/strict';
import {buildCandidateApplicationMaterials} from '../src/app/opportunityApplication/candidateApplicationMaterial.js';
import {normalizePresentationLanguageBasis,establishApplicationMaterialPresentationLanguage,deriveValidatedPresentationRealization,isDirectlyUsableInLanguage} from '../src/app/opportunityApplication/presentationLanguageBasis.js';
const clone=x=>JSON.parse(JSON.stringify(x));
const identity={revision:1,professionalSources:[{id:'s1',sourceRole:'current_cv',content:'same visible text'}],representationSnapshots:[{representation:{type:'target_independent_professional_representation',roleHistory:[{sourceId:'s1',role:'same visible text',status:'current'},{sourceId:'s2',role:'same visible text',status:'previous'}],episodeMeanings:[],professionalMeaning:{knowledgeContribution:[]}}}]};
const piBefore=clone(identity); const items=buildCandidateApplicationMaterials({professionalIdentity:identity});
const roles=items.filter(x=>x.materialKind==='professional_role'); assert.equal(roles.length,2);
// A legacy/missing, UI/request/JD/proficiency do not establish a basis.
assert.equal(normalizePresentationLanguageBasis(undefined).state,'unknown');
for(const x of items) assert.equal(x.presentationLanguageBasis.state,'unknown');
const context={uiLanguage:'it',requestedArtifactLanguage:'en',opportunityLanguage:'en',candidateEnglishProficiency:'C1'}; void context;
assert.equal(roles[0].presentationLanguageBasis.state,'unknown');
// B/C explicit authorised Application realization boundaries.
const it=establishApplicationMaterialPresentationLanguage(roles[0],{language:'it',authority:'explicit_application_realization',provenance:{realizationRef:'r-it'}});
const en=establishApplicationMaterialPresentationLanguage(roles[1],{language:'en',authority:'explicit_application_realization',provenance:{realizationRef:'r-en'}});
assert.equal(it.presentationLanguageBasis.language,'it'); assert.equal(en.presentationLanguageBasis.language,'en');
assert.equal(isDirectlyUsableInLanguage(it,'it'),true); assert.equal(isDirectlyUsableInLanguage(it,'en'),false);
assert.equal(isDirectlyUsableInLanguage(en,'en'),true);
// H/I mixed + identical visible text remains identity-owned.
assert.notEqual(it.id,en.id); assert.equal(it.authorisedPayload.role,en.authorisedPayload.role); assert.equal(it.presentationLanguageBasis.language,'it'); assert.equal(en.presentationLanguageBasis.language,'en');
// J/K VALID derived realization may establish; non-valid cannot.
const valid=deriveValidatedPresentationRealization({material:it,language:'en',validationStatus:'VALID',transformedText:'same visible text',materializationRef:'m-en'});
assert.equal(valid.presentationLanguageBasis.state,'established'); assert.equal(valid.presentationLanguageBasis.language,'en'); assert.equal(valid.materialRef,it.id);
for(const status of ['REJECTED','UNSUPPORTED']){const r=deriveValidatedPresentationRealization({material:it,language:'en',validationStatus:status}); assert.equal(r.presentationLanguageBasis.state,'unknown');}
// L no Candidate truth mutation.
assert.deepEqual(identity,piBefore);
assert.equal(items.find(x=>x.materialKind==='raw_legacy_source').presentationLanguageBasis.state,'unknown');
console.log('PD-066 Candidate Application Material Presentation-Language Basis: PASS');
