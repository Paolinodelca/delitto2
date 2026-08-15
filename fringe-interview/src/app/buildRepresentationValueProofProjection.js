function arr(v){return Array.isArray(v)?v:[];}
function text(v){return typeof v==='string'?v.trim():'';}
function frozen(v){if(Array.isArray(v)){v.forEach(frozen);return Object.freeze(v);}if(v&&typeof v==='object'){Object.values(v).forEach(frozen);return Object.freeze(v);}return v;}
function ev(summary,ref,kind='derived'){return frozen({summary:text(summary),sourceRef:ref,sourceKind:kind});}
function uniqueEvidence(items){const seen=new Set();return items.filter(x=>x?.summary&&x?.sourceRef&&!seen.has(x.sourceRef)&&(seen.add(x.sourceRef),true)).slice(0,3);}

// Downstream, non-persistent projection. It deliberately consumes only data already
// present in the canonical Professional Perception/report result; it never invents
// evidence or mutates the report that produced it.
export function buildRepresentationValueProofProjection({professionalPerceptionReport,targetRole=''}={}){
 const report=professionalPerceptionReport||{};
 const pp=report?.professionalPerception||{};
 const p=pp?.perceptionV2||{};
 const visible=arr(pp?.visibleSignals).map((x,i)=>ev(x?.label,`professionalPerception.visibleSignals[${i}]`)).filter(x=>x.summary);
 const under=arr(pp?.underVisibleSignals).map((x,i)=>ev(x?.label,`professionalPerception.underVisibleSignals[${i}]`)).filter(x=>x.summary);
 const gaps=arr(pp?.perceptionGap).map((x,i)=>ev(x?.narrative||x?.area,`professionalPerception.perceptionGap[${i}]`)).filter(x=>x.summary);
 const claims=[];
 const who=text(p?.whoEmerges?.narrative);
 if(who){claims.push(frozen({id:'what_emerges',claim:who,epistemicStatus:'derived',supportStrength:visible.length?'supported_by_derived_signals':'limited_support',supportingEvidence:uniqueEvidence(visible),uncertainty:under.slice(0,2).map(x=>x.summary),targetRelation:null,traceability:uniqueEvidence([ev(who,'professionalPerception.perceptionV2.whoEmerges.narrative'),...visible]).map(x=>x.sourceRef)}));}
 const cred=text(p?.credibilityAssets?.narrative);
 if(cred&&claims.length<3){claims.push(frozen({id:'credibility_assets',claim:cred,epistemicStatus:'derived',supportStrength:visible.length?'supported_by_derived_signals':'limited_support',supportingEvidence:uniqueEvidence(visible),uncertainty:under.slice(0,2).map(x=>x.summary),targetRelation:null,traceability:uniqueEvidence([ev(cred,'professionalPerception.perceptionV2.credibilityAssets.narrative'),...visible]).map(x=>x.sourceRef)}));}
 const target=text(p?.targetDistance?.bridgeNarrative);
 if(target&&claims.length<4){const targetEvidence=uniqueEvidence([...gaps,...under]);claims.push(frozen({id:'target_relation',claim:target,epistemicStatus:targetEvidence.length?'insufficiently_observed':'derived',supportStrength:targetEvidence.length?'limited_or_gap_evidence':'limited_support',supportingEvidence:targetEvidence,uncertainty:under.slice(0,2).map(x=>x.summary),targetRelation:frozen({status:targetEvidence.length?'relevant_distance_or_insufficient_observation':'context_only',target:text(targetRole)||text(pp?.emergingImage?.roleTarget),summary:target}),traceability:uniqueEvidence([ev(target,'professionalPerception.perceptionV2.targetDistance.bridgeNarrative'),...targetEvidence]).map(x=>x.sourceRef)}));}
 return frozen({type:'representation_value_proof_projection',version:'1.0',persistent:false,sourceOfTruth:false,claims:claims.slice(0,4),hasPrimaryScore:false,limitations:frozen({claimSpecificEvidenceRelevance:'Professional Perception exposes derived signal/gap relationships but the live Beta path does not yet expose the Core Evidence Store/Knowledge Ledger as claim-specific report inputs.'})});
}
export default buildRepresentationValueProofProjection;
