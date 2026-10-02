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
export function buildRepresentationValueProofProjection({professionalPerceptionReport,targetRole='',candidateProfile=null,jobFitAnalysis=null,roleProfile=null}={}){
 const report=professionalPerceptionReport||{},pp=report?.professionalPerception||{};
 const authorized=arr(pp?.authorizedSemanticMaterial);
 const under=arr(pp?.underVisibleSignals).map((x,i)=>ev(x?.label,`professionalPerception.underVisibleSignals[${i}]`)).filter(x=>x.summary);
 const uncertainties=uncertaintyItems(under,candidateProfile);
 const requirements=[...arr(roleProfile?.requirements?.mustHave),...arr(roleProfile?.requirements?.preferred),...arr(roleProfile?.requirements?.bonus)].map(text).filter(Boolean);
 const claims=[];
 for(const [i,item] of authorized.entries()){
  if(item?.semanticType==='quantified_outcome'&&text(item.measurableOutcome)){
   const q=item.quantitativeValue||{};
   const detail=[q.approximate?'~':'',typeof q.value==='number'?String(q.value):'',text(q.unit)].join('').trim();
   const summary=[text(item.measurableOutcome),detail].filter(Boolean).join(' — ');
   claims.push(frozen({id:`authorized_quantified_outcome_${i}`,claim:summary,epistemicStatus:'observed',supportStrength:'authorized_current_session_knowledge',supportingEvidence:[ev(summary,item.sourceRef,'authorized_knowledge',{semanticType:item.semanticType,evidenceIds:arr(item.evidenceIds),causalityBoundary:text(item.causalityBoundary),limitations:arr(item.limitations)})],uncertainty:[],targetRelation:null,traceability:[item.sourceRef,...arr(item.evidenceIds)]}));
  }else if(item?.semanticType==='decision_accountability'){
   const summary=[text(item.decisionAuthority),text(item.consequenceScope)].filter(Boolean).join(' / ');
   if(summary)claims.push(frozen({id:`authorized_decision_accountability_${i}`,claim:summary,epistemicStatus:'observed',supportStrength:'authorized_current_session_knowledge',supportingEvidence:[ev(summary,item.sourceRef,'authorized_knowledge',{semanticType:item.semanticType,evidenceIds:arr(item.evidenceIds),limitations:arr(item.limitations)})],uncertainty:[],targetRelation:null,traceability:[item.sourceRef,...arr(item.evidenceIds)]}));
  }
 }
 const targetItems=uncertainties.filter(u=>requirements.some(r=>overlapsSignal(u.label,r))).slice(0,3);
 if(targetItems.length){
  const labels=targetItems.map(x=>x.label).join('; ');
  claims.push(frozen({id:'target_relation',claim:labels,epistemicStatus:'insufficiently_observed',supportStrength:'not_person_support',supportingEvidence:[],uncertainty:targetItems,targetRelation:frozen({status:'insufficiently_observed_against_canonical_requirement',target:text(targetRole),requirements:requirements.filter(r=>targetItems.some(x=>overlapsSignal(x.label,r)))}),traceability:targetItems.map(x=>x.sourceRef)}));
 }
 return frozen({type:'representation_value_proof_projection',version:'1.2',persistent:false,sourceOfTruth:false,claims:claims.slice(0,4),hasPrimaryScore:false,limitations:frozen({claimSpecificEvidenceRelevance:'Positive person claims require authorized current-session semantic Knowledge; target relation uses canonical RoleProfile requirements only.'})});
}
export default buildRepresentationValueProofProjection;
