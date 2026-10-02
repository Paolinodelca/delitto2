function safe(v){return JSON.stringify(v,null,2);}
export function buildProfessionalRepresentationSynthesisPrompt({synthesisInput,deterministicRepresentation,locale='it'}={}){
 const claimSkeleton=(deterministicRepresentation?.claims||[]).map(c=>({id:c.id,semanticSupportRefs:c.semanticSupportRefs,evidenceRefs:c.evidenceRefs,epistemicState:c.epistemicState,limitations:c.limitations,targetRelation:c.targetRelation}));
 const systemPrompt=[
  'You are a bounded narrative realization component for a Professional Representation.',
  'Semantic authority is already complete. You may only improve wording and grouping of the supplied authorized claims.',
  'Do not create facts, dimensions, evidence, knowledge, target requirements, weaknesses, traits, scores, magnitude, units, ownership, causality, or confidence.',
  'Preserve contribution-only boundaries and epistemic state. Never turn contribution into sole ownership or sole causality.',
  'Return JSON only: {"claims":[{"id":"...","professionalClaim":"...","explanation":"..."}]}.',
  'Return exactly one item for every supplied claim id and no other ids.',
  locale==='it'?'Write professionalClaim and explanation in Italian.':'Write professionalClaim and explanation in English.'
 ].join(' ');
 const userPrompt=['AUTHORIZED SYNTHESIS INPUT:',safe(synthesisInput),'FIXED CLAIM CONTRACT:',safe(claimSkeleton),'DETERMINISTIC SAFE WORDING:',safe((deterministicRepresentation?.claims||[]).map(c=>({id:c.id,professionalClaim:c.professionalClaim,explanation:c.explanation}))),'Rewrite only professionalClaim and explanation.'].join('\n\n');
 return {systemPrompt,userPrompt};
}
export default buildProfessionalRepresentationSynthesisPrompt;
