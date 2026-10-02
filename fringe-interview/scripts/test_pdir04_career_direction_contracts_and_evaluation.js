import assert from 'node:assert/strict';
import { createRoleRequirement,createRoleCareerDirectionRepresentation,createDirectionSupportRelation,createConditionToVerify,createDirectionExplorationContext,createCareerDirectionHypothesis } from '../src/app/careerDirection/contracts.js';
import { CURATED_ROLE_REPRESENTATIONS } from '../src/app/careerDirection/roleFixtures.js';
import { evaluateCareerDirections } from '../src/app/careerDirection/evaluateCareerDirections.js';
const support=[{sourceRef:'s1',sourceClass:'reference_authority',sourcePropositionRef:'p1',observedAt:'2026-09-10',supportRole:'supports_core_requirement'}];
assert.throws(()=>createRoleRequirement({id:'x',type:'skill',statement:'x',strength:'core_common',sourceSupport:support}),/TYPE_INVALID/);
assert.throws(()=>createRoleRequirement({id:'x',type:'responsibility',statement:'x',strength:'core_common',sourceSupport:[]}),/PROVENANCE/);
const r=createRoleRequirement({id:'r',type:'responsibility',statement:'x',strength:'core_common',material:true,sourceSupport:support});assert(Object.isFrozen(r));
assert.throws(()=>createDirectionSupportRelation({id:'x',personMeaningRef:'p',roleRequirementRef:'r',relationType:'keyword_match'}),/TYPE_INVALID/);
assert(Object.isFrozen(createDirectionExplorationContext({preferredThemes:['operations']})));
assert(Object.isFrozen(createConditionToVerify({id:'c',roleRequirementRef:'r',reason:'unknown',currentState:'insufficiently_observed',materialityBasis:'core_common'})));
assert.throws(()=>createCareerDirectionHypothesis({type:'career_direction_hypothesis',purpose:'professional_direction_explore',id:'h',directionRef:'d',roleRepresentationRef:'d',professionalRepresentationRef:'p',supportBasis:[{relationType:'supported_relevance'}],whyWorthExploring:'x',roleVersion:'1',recipeVersion:'1',evaluatedAt:'now',readinessScore:80}),/SCORE_FORBIDDEN/);
for(const role of CURATED_ROLE_REPRESENTATIONS){assert.equal(role.type,'role_career_direction_representation');assert(role.requirements.every(x=>x.sourceSupport.length));assert(role.requirements.every(x=>x.material));assert(role.version.sourceStateRef);}
const rep={professionalMeaning:{supportedPatterns:[{kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['atlas','maintenance'],episodeRefs:['a','m'],traitInference:false}]}};
const before=JSON.stringify(rep);const ev=evaluateCareerDirections({professionalRepresentation:rep,professionalRepresentationRef:'representationSnapshot:marco',now:'2026-09-10T12:00:00.000Z'});assert.equal(JSON.stringify(rep),before,'evaluation must not mutate Person-side representation');assert(ev.hypotheses.length>=2,'same person state should support multiple curated directions');
for(const h of ev.hypotheses){assert(h.supportBasis.every(x=>x.relationType==='supported_relevance'));assert(h.conditionsToVerify.length>=1&&h.conditionsToVerify.length<=2);assert(!('fitScore'in h)&&!('readinessScore'in h)&&!('recommendedRank'in h));assert(h.limitations.some(x=>/not fit/i.test(x)));}
const unrelated=evaluateCareerDirections({professionalRepresentation:{professionalMeaning:{supportedPatterns:[{kind:'documented_domain_continuity',domain:'manufacturing'}]}},professionalRepresentationRef:'x'});assert.equal(unrelated.hypotheses.length,0,'missing explicit mapping must fail closed');
const dup=CURATED_ROLE_REPRESENTATIONS.find(x=>x.roleIdentity.canonicalLabel==='Industrial Production Manager').requirements.find(x=>x.id.includes('cross_functional'));assert.equal(dup.independenceState,'corroborated_independent');assert.equal(new Set(dup.sourceSupport.map(x=>x.independenceGroupRef)).size,2);
console.log('PDIR-04 contracts and direction evaluation: PASS');
