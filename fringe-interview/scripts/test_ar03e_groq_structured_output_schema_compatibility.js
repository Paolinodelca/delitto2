import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {
  DECISION_ACCOUNTABILITY_SEMANTIC_CANDIDATE_SCHEMA,
  validateDecisionAccountabilityProductionSemanticCandidate
}=require('../src/app/knowledge/decisionAccountabilityProductionSemanticCandidate.js');
const {buildDecisionAccountabilityProductionSemanticPrompt}=require('../src/app/knowledge/buildDecisionAccountabilityProductionSemanticPrompt.js');

const schema=DECISION_ACCOUNTABILITY_SEMANTIC_CANDIDATE_SCHEMA;
assert.equal(schema.type,'object');
assert.ok(schema.properties);
assert.equal(schema.additionalProperties,false);
assert.ok(Array.isArray(schema.required));
assert.equal(Object.prototype.hasOwnProperty.call(schema,'anyOf'),false,'root anyOf must not be used by the Groq strict structured-output boundary');
assert.equal(Object.prototype.hasOwnProperty.call(schema.properties.responsibilityContinuity,'anyOf'),false,'continuity provider schema must remain permissive; canonical validator owns cross-field semantics');

const base={interpretationStatus:'SUPPORTED',decisionAuthority:'final',consequenceScope:'team',accountabilityEvidence:'explicit',responsibilityContinuity:{state:'unknown',qualification:null,months:null,minimumMonths:null,maximumMonths:null},context:{decision:'priorità operative',responsibility:'autorità finale',consequence:'team'},limitations:[]};
const missingScope={...base,consequenceScope:null,context:{...base.context,consequence:null}};
assert.equal(validateDecisionAccountabilityProductionSemanticCandidate(missingScope).isValid,false,'positive SUPPORTED without supported scope must remain invalid');

const unsupported={...base,interpretationStatus:'UNSUPPORTED',decisionAuthority:null,consequenceScope:null,accountabilityEvidence:null,context:{decision:null,responsibility:null,consequence:null}};
assert.equal(validateDecisionAccountabilityProductionSemanticCandidate(unsupported).isValid,true,'canonical UNSUPPORTED must remain valid');

const lowerBound={...base,responsibilityContinuity:{state:'known',qualification:'lower_bound',months:12,minimumMonths:null,maximumMonths:null}};
assert.equal(validateDecisionAccountabilityProductionSemanticCandidate(lowerBound).isValid,true,'lower_bound + months must remain canonical');
const badLowerBound={...base,responsibilityContinuity:{state:'known',qualification:'lower_bound',months:null,minimumMonths:12,maximumMonths:null}};
assert.equal(validateDecisionAccountabilityProductionSemanticCandidate(badLowerBound).isValid,false,'lower_bound + minimumMonths must remain invalid');

for(const qualification of ['exact','approximate']){
  const candidate={...base,responsibilityContinuity:{state:'known',qualification,months:12,minimumMonths:null,maximumMonths:null}};
  assert.equal(validateDecisionAccountabilityProductionSemanticCandidate(candidate).isValid,true,qualification);
}
const unknown={...base,responsibilityContinuity:{state:'unknown',qualification:null,months:null,minimumMonths:null,maximumMonths:null}};
assert.equal(validateDecisionAccountabilityProductionSemanticCandidate(unknown).isValid,true);
assert.equal(unknown.responsibilityContinuity.months,null);
const contextualNone={...base,decisionAuthority:'none',consequenceScope:null,accountabilityEvidence:null,context:{decision:'priorità',responsibility:'nessuna autorità decisionale',consequence:null}};
assert.equal(validateDecisionAccountabilityProductionSemanticCandidate(contextualNone).isValid,true);

const {systemText}=buildDecisionAccountabilityProductionSemanticPrompt({evidence:{content:{answerText:'fixture'}}});
assert.match(systemText,/missing or ambiguous, return UNSUPPORTED/i);
assert.match(systemText,/lower_bound.*months: 12/i);

console.log('AR-03E Groq structured output schema compatibility regression: PASS');
