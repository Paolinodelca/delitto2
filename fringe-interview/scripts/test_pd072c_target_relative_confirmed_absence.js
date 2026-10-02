const assert=require('node:assert/strict');
(async()=>{
 const {deriveTargetRelativeConfirmedAbsence}=require('../src/app/careerDirection/deriveTargetRelativeConfirmedAbsence');
 const {resolvePeopleResponsibilityConditions}=require('../src/app/careerDirection/resolvePeopleResponsibilityConditions');
 const {evaluateCareerDirections}=await import('../src/app/careerDirection/evaluateCareerDirections.js');
 const now='2026-09-25T12:00:00.000Z';
 const {CURATED_ROLE_REPRESENTATIONS}=await import('../src/app/careerDirection/roleFixtures.js');
 const role=CURATED_ROLE_REPRESENTATIONS[0];
 const reqObj=role.requirements.find(r=>r.requirementAuthority?.requirementClass==='formal_continuing_people_responsibility');
 const req=reqObj.id;
 const h={id:'careerDirection:test',directionRef:role.id,evaluatedAt:now,conditionsToVerify:[{id:'condition:people',roleRequirementRef:req,reason:'people_responsibility_scope'}],metadata:{roleRequirementAuthorities:{[req]:reqObj.requirementAuthority}}};
 const evaluation={evaluatedAt:now,hypotheses:[h]};
 const matrix=(detail)=>({knowledgeLayers:{elementary:[{stateId:'knowledge:cpr',state:{dimensionId:'continuing_people_responsibility',stateType:'observed'}}]},extensions:{semanticDetails:{continuing_people_responsibility:detail}}});
 const neg={stateKind:'bounded_non_presence_observed',responsibilityPresence:'contextual_non_responsibility',professionalContext:{role:'Production Supervisor',scope:'current_role',formalReporting:false},absenceScope:{role:'Production Supervisor',scope:'current_role',formalReporting:false},eventTime:{status:'current'},evidenceIds:['evidence:denial'],observationRefs:['obs:negative'],limitations:['Does not establish career-wide absence.']};
 // A/B compatible negative vs unknown
 assert.equal(deriveTargetRelativeConfirmedAbsence({careerDirectionHypothesis:h,roleRequirementRef:req,personKnowledgeMatrix:{knowledgeLayers:{elementary:[]},extensions:{}},derivedAt:now}),null);
 const state=deriveTargetRelativeConfirmedAbsence({careerDirectionHypothesis:h,roleRequirementRef:req,personKnowledgeMatrix:matrix(neg),derivedAt:now});
 assert(state);assert.equal(state.stateKind,'TARGET_RELATIVE_CONFIRMED_ABSENCE');assert.equal(state.bridgeEligible,true);assert.deepEqual(state.supportingEvidenceRefs,['evidence:denial']);assert.deepEqual(state.supportingObservationRefs,['obs:negative']);assert.equal(state.compatibilityBasis.targetFormality,'formal');
 // C informal positive is a separate meaning; it does not erase the formal bounded absence contract.
 const informal={stateKind:'supported_responsibility',responsibilityPresence:'supported',continuity:'continuing',responsibilityMode:'informal_operational',responsibilityKinds:['work_assignment_or_priority_setting'],peopleScope:{kind:'exact',value:10},professionalContext:{role:'Production Supervisor',scope:'current_role'}};
 assert.equal(deriveTargetRelativeConfirmedAbsence({careerDirectionHypothesis:h,roleRequirementRef:req,personKnowledgeMatrix:matrix(informal),derivedAt:now}),null);
 // E unspecified target fails closed
 const hu={...h,metadata:{...h.metadata,roleRequirementAuthorities:{...h.metadata.roleRequirementAuthorities,[req]:{...h.metadata.roleRequirementAuthorities[req],requirementClass:'unspecified',responsibilityFormality:'unspecified',continuityRequirement:'unspecified'}}}};
 assert.equal(deriveTargetRelativeConfirmedAbsence({careerDirectionHypothesis:hu,roleRequirementRef:req,personKnowledgeMatrix:matrix(neg),derivedAt:now}),null);
 // F scope too narrow
 const episode={...neg,professionalContext:{role:'Production Supervisor',scope:'episode',formalReporting:false},absenceScope:{scope:'episode'},eventTime:{status:'current'}};
 assert.equal(deriveTargetRelativeConfirmedAbsence({careerDirectionHypothesis:h,roleRequirementRef:req,personKnowledgeMatrix:matrix(episode),derivedAt:now}),null);
 // G temporal mismatch
 const past={...neg,eventTime:{status:'past'}};
 assert.equal(deriveTargetRelativeConfirmedAbsence({careerDirectionHypothesis:h,roleRequirementRef:req,personKnowledgeMatrix:matrix(past),derivedAt:now}),null);
 // I recomputation with later positive current Knowledge removes absence
 assert.equal(deriveTargetRelativeConfirmedAbsence({careerDirectionHypothesis:h,roleRequirementRef:req,personKnowledgeMatrix:matrix({...informal,responsibilityMode:'formal'}),derivedAt:now}),null);
 // Career Direction consumer carries derived state and bridge eligibility.
 const resolutions=resolvePeopleResponsibilityConditions({careerDirectionEvaluation:evaluation,personKnowledgeMatrix:matrix(neg),now});
 const resolved=resolutions.find(x=>x.roleRequirementRef===req);assert(resolved);assert.equal(resolved.resolutionState,'target_relative_confirmed_absence');assert(resolved.targetRelativeConfirmedAbsence);assert.equal(resolved.bridgeEligible,true);
 assert(!JSON.stringify(state).match(/lacks leadership|not ready|unsuitable|cannot manage/i));
 console.log('PD-072C bounded target-relative confirmed absence derivation PASSED');
})().catch(e=>{console.error(e);process.exit(1)});
