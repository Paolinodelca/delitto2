const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const unique=v=>[...new Set(arr(v).map(text).filter(Boolean))];
const scopeText=scope=>scope?.kind==='exact'&&Number.isFinite(Number(scope.value))?String(scope.value):scope?.kind==='range'?`${scope.min??''}–${scope.max??''}`:text(scope?.value||scope);
const contextText=value=>text(value?.description||value?.episode||value?.responsibility||value?.decision||value);
const evidenceSummary=k=>unique(arr(k?.supportingEvidence).map(x=>text(x?.summary))).slice(0,4);
const sourceRoleOrigin=role=>({current_cv:'current_cv',previous_cv:'previous_cv',professional_declaration:'professional_declaration'}[text(role)]||'');
const knowledgeOrigin=k=>{
 const semanticProvenance=k?.observation?.extensions?.semanticProvenance||{};
 const explicitRole=sourceRoleOrigin(k?.sourceRole||k?.provenance?.sourceRole||k?.source?.sourceRole||semanticProvenance?.sourceRole);
 if(explicitRole)return {kind:explicitRole};
 const runtimeAction=text(k?.sourceRuntimeActionRef),execution=text(k?.sourceExecutionRef||semanticProvenance?.knowledgeAcquisitionExecutionRef),runtimeSession=text(k?.sourceRuntimeSessionRef);
 if(runtimeAction||execution||runtimeSession)return {kind:'imago_clarification'};
 return null;
};
const provenanceDetail=(k,semanticType)=>{const o=k?.observation||{},d=k?.specializedMeasurementResult?.semanticDetail||{};if(semanticType==='continuing_people_responsibility')return {continuity:text(d?.continuity),peopleScope:scopeText(d?.peopleScope),professionalContext:contextText(d?.professionalContext||k?.specializedMeasurementResult?.context||o?.professionalContext),responsibilityKinds:unique(d?.responsibilityKinds)};return null;};
export function projectCandidateProfileKnowledge(knowledgeResults=[]){
 return arr(knowledgeResults).flatMap((k,index)=>{
  const semanticType=text(k?.semanticType);if(!semanticType)return [];
  const o=k?.observation||{},d=k?.specializedMeasurementResult?.semanticDetail||{};
  const limitations=unique([...(arr(o?.limitations)),...(arr(d?.limitations))]);
  if(semanticType==='continuing_people_responsibility')return [{semanticType,index,kind:'people_responsibility',continuity:text(d?.continuity),peopleScope:scopeText(d?.peopleScope),professionalContext:contextText(d?.professionalContext||k?.specializedMeasurementResult?.context||o?.professionalContext),responsibilityKinds:unique(d?.responsibilityKinds),limitations,evidence:evidenceSummary(k),provenanceOrigin:knowledgeOrigin(k),provenanceDetail:provenanceDetail(k,semanticType),negative:false}];
  if(semanticType==='decision_accountability')return [{semanticType,index,kind:'decision_accountability',decisionAuthority:text(o?.decisionAuthority),consequenceScope:text(o?.consequenceScope),professionalContext:contextText(o?.context),limitations:unique([...(arr(o?.limitations)),...(arr(k?.measurementResult?.limitations))]),evidence:evidenceSummary(k),provenanceOrigin:knowledgeOrigin(k),negative:false}];
  if(semanticType==='quantified_outcome')return [{semanticType,index,kind:'quantified_outcome',measurableOutcome:text(o?.measurableOutcome),quantitativeValue:o?.quantitativeValue||null,contributionRelationship:text(o?.contributionRelationship),professionalContext:contextText(o?.context),limitations:arr(o?.limitations),evidence:evidenceSummary(k),provenanceOrigin:knowledgeOrigin(k),negative:false}];
  if(semanticType==='resource_budget_responsibility_scope')return [{semanticType,index,kind:'resource_budget',responsibilityStrength:text(d?.responsibilityStrength),scope:text(d?.scope),professionalContext:contextText(d?.professionalContext),limitations,evidence:evidenceSummary(k),provenanceOrigin:knowledgeOrigin(k),negative:text(d?.responsibilityStrength)==='contextual_no_direct_responsibility'}];
  if(semanticType==='production_planning_scheduling_responsibility_scope')return [{semanticType,index,kind:'production_planning',responsibilityStrength:text(d?.responsibilityStrength),scope:text(d?.scope||d?.productionScope),professionalContext:contextText(d?.professionalContext),limitations,evidence:evidenceSummary(k),provenanceOrigin:knowledgeOrigin(k),negative:text(d?.responsibilityStrength)==='contextual_no_direct_responsibility'}];
  return [];
 });
}

export function projectCandidatePreferenceContext(context={}){
 const items=[];
 for(const [kind,values] of [['preferredThemes',context?.preferredThemes],['avoidedConditions',context?.avoidedConditions],['uncertainties',context?.uncertainties],['explicitDirectionRequests',context?.explicitDirectionRequests],['geographyConstraints',context?.geographyConstraints],['mobilityConstraints',context?.mobilityConstraints],['workContextPreferences',context?.workContextPreferences]]){
  for(const value of arr(values)){const clean=text(value);if(clean)items.push({kind,value:clean});}
 }
 return {preferenceState:text(context?.preferenceState),items};
}
