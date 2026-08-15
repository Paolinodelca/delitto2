function arr(v){return Array.isArray(v)?v:[];}
function text(v){return typeof v==='string'?v.trim():'';}
function frozen(v){if(Array.isArray(v)){v.forEach(frozen);return Object.freeze(v);}if(v&&typeof v==='object'){Object.values(v).forEach(frozen);return Object.freeze(v);}return v;}
function ev(summary,ref,kind='derived',context={}){return frozen({summary:text(summary),sourceRef:ref,sourceKind:kind,...context});}
function norm(v){return text(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();}
function tokens(v){return new Set(norm(v).split(' ').filter(x=>x.length>2));}
function similarity(a,b){const A=tokens(a),B=tokens(b);if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.min(A.size,B.size);}
function uniqueEvidence(items){const seen=new Set();return items.filter(x=>{const k=`${norm(x?.summary)}|${x?.sourceRef}`;return x?.summary&&x?.sourceRef&&!seen.has(k)&&(seen.add(k),true);}).slice(0,3);}
function semanticDistinct(candidate,claims){return claims.every(c=>similarity(candidate.claim,c.claim)<0.62);}
function overlapsSignal(signal,value){const s=tokens(signal),v=tokens(value);if(!s.size||!v.size)return false;for(const x of s)for(const y of v)if(x===y||(x.length>=5&&y.length>=5&&x.slice(0,5)===y.slice(0,5)))return true;return false;}
function contextualSupport(signal,candidateProfile={}){
 const c=candidateProfile?.candidateProfile||candidateProfile||{};
 const sources=[];
 const add=(values,ref,kind)=>arr(values).forEach((v,i)=>{if(overlapsSignal(signal,v))sources.push(ev(v,`${ref}[${i}]`,kind));});
 add(c.domainSignals,'candidateProfile.domainSignals','professional_history');
 add(c.skills?.technical,'candidateProfile.skills.technical','professional_history');
 add(c.education,'candidateProfile.education','professional_history');
 add(c.evidence?.evidenceRichAreas,'candidateProfile.evidence.evidenceRichAreas','professional_history');
 const years=text(c.experienceSignals?.yearsDetected);
 const distinctKinds=new Set(sources.map(x=>x.sourceRef.split('[')[0]));
 if(sources.length>=2&&distinctKinds.size>=2&&years)sources.push(ev(years,'candidateProfile.experienceSignals.yearsDetected','duration_context'));
 const supported=sources.length>=2&&distinctKinds.size>=2;
 return {supported,evidence:uniqueEvidence(sources)};
}
function uncertaintyItems(under,candidateProfile){return under.slice(0,3).map(item=>{const support=contextualSupport(item.summary,candidateProfile);return frozen({label:item.summary,status:support.supported?'historically_supported_partially_characterized':'insufficiently_observed',supportingEvidence:support.evidence,sourceRef:item.sourceRef});});}

// Dynamic downstream projection only. It consumes canonical report/parser outputs,
// adds no persistence or confidence score, and never mutates its sources.
export function buildRepresentationValueProofProjection({professionalPerceptionReport,targetRole='',candidateProfile=null,jobFitAnalysis=null}={}){
 const report=professionalPerceptionReport||{},pp=report?.professionalPerception||{},p=pp?.perceptionV2||{};
 const visible=arr(pp?.visibleSignals).map((x,i)=>ev(x?.label,`professionalPerception.visibleSignals[${i}]`)).filter(x=>x.summary);
 const under=arr(pp?.underVisibleSignals).map((x,i)=>ev(x?.label,`professionalPerception.underVisibleSignals[${i}]`)).filter(x=>x.summary);
 const gaps=arr(pp?.perceptionGap).map((x,i)=>ev(x?.narrative||x?.area,`professionalPerception.perceptionGap[${i}]`)).filter(x=>x.summary);
 const uncertainties=uncertaintyItems(under,candidateProfile);
 const claims=[],usedEvidence=new Set();
 const takeFresh=(items,n=3)=>uniqueEvidence(items.filter(x=>!usedEvidence.has(norm(x.summary)))).slice(0,n).map(x=>(usedEvidence.add(norm(x.summary)),x));
 const addClaim=(claim)=>{if(claim?.claim&&semanticDistinct(claim,claims))claims.push(frozen(claim));};
 const who=text(p?.whoEmerges?.narrative);
 if(who){const evidence=takeFresh(visible);addClaim({id:'what_emerges',claim:who,epistemicStatus:'derived',supportStrength:evidence.length?'supported_by_derived_signals':'limited_support',supportingEvidence:evidence,uncertainty:uncertainties.slice(0,2),targetRelation:null,traceability:uniqueEvidence([ev(who,'professionalPerception.perceptionV2.whoEmerges.narrative'),...evidence,...uncertainties.flatMap(x=>x.supportingEvidence)]).map(x=>x.sourceRef)});}
 const cred=text(p?.credibilityAssets?.narrative);
 if(cred&&claims.length<3){const evidence=takeFresh(visible);if(evidence.length||!claims.length)addClaim({id:'credibility_assets',claim:cred,epistemicStatus:'derived',supportStrength:evidence.length?'supported_by_derived_signals':'limited_support',supportingEvidence:evidence,uncertainty:uncertainties.slice(0,2),targetRelation:null,traceability:uniqueEvidence([ev(cred,'professionalPerception.perceptionV2.credibilityAssets.narrative'),...evidence]).map(x=>x.sourceRef)});}
 const target=text(p?.targetDistance?.bridgeNarrative);
 if(target&&claims.length<4){const targetEvidence=uniqueEvidence([...gaps,...under]).filter(x=>norm(x.summary)!==norm(target)).slice(0,3);const contextual=uncertainties.flatMap(x=>x.supportingEvidence);const evidence=uniqueEvidence([...targetEvidence,...contextual]).filter(x=>norm(x.summary)!==norm(target));addClaim({id:'target_relation',claim:target,epistemicStatus:under.length?'insufficiently_observed':'derived',supportStrength:evidence.length?'limited_or_contextual_evidence':'limited_support',supportingEvidence:evidence,uncertainty:uncertainties,targetRelation:frozen({status:under.length?'relevant_distance_or_partial_characterization':'context_only',target:text(targetRole)||text(pp?.emergingImage?.roleTarget),summary:target}),traceability:uniqueEvidence([ev(target,'professionalPerception.perceptionV2.targetDistance.bridgeNarrative'),...evidence]).map(x=>x.sourceRef)});}
 return frozen({type:'representation_value_proof_projection',version:'1.1',persistent:false,sourceOfTruth:false,claims:claims.slice(0,4),hasPrimaryScore:false,limitations:frozen({claimSpecificEvidenceRelevance:'Professional Perception and parser context support bounded contextual projection; deep Core Evidence/Knowledge provenance is not propagated claim-by-claim to the live report.'})});
}
export default buildRepresentationValueProofProjection;
