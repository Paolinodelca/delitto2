const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
function unique(values){const out=[];for(const value of values){const x=text(value);if(x&&!out.includes(x))out.push(x)}return out;}
function roleDescriptionFacts(profile={}){
 return candidateSafeFacts([profile.currentPositioning,profile.summary,...arr(profile?.experienceSignals?.roles),...arr(profile?.experienceSignals?.contexts),...arr(profile.domainSignals),profile?.experienceSignals?.yearsDetected],arr(profile?.experienceSignals?.supportExcerpts)).slice(0,5);
}
function profileFacts(profile={}){
 const experience=profile?.experienceSignals||{};
 return candidateSafeFacts([profile.summary,profile.currentPositioning,...arr(experience.highlights),...arr(experience.roles),...arr(experience.contexts),...arr(profile.domainSignals),experience.yearsDetected],arr(experience.supportExcerpts)).slice(0,7);
}
function normalizeForExactSupport(value){return text(value).replace(/\s+/g,' ').toLocaleLowerCase();}
function candidateSafeFacts(values=[],supportingText=[]){
 const machine=/^(?:unclear|unknown|none|null|undefined|not[_ -]?established|insufficient|n\/a|nessuna informazione professionale fornita|nessuna informazione professionale disponibile|no professional information provided|no professional information available)$/i;
 const durationOnly=/^\s*(?:circa\s+)?\d+(?:[.,]\d+)?\s*(?:anni|anno|years?|months?|mesi|mese)\s*$/i;
 const out=[];
 for(const raw of unique(values)){
  const value=text(raw);if(!value||machine.test(value))continue;
  if(durationOnly.test(value)){const duration=normalizeForExactSupport(value);if(out.some(x=>normalizeForExactSupport(x).includes(duration))||arr(supportingText).some(x=>normalizeForExactSupport(x).includes(duration)))continue;}
  const n=normalizeForExactSupport(value);
  if(out.some(existing=>{const e=normalizeForExactSupport(existing);return e===n||(n.length>18&&e.includes(n))||(e.length>18&&n.includes(e));}))continue;
  out.push(value);
 }
 return out;
}
function activitySemantics(profile={},verifiedExcerpts=[]){
 const verified=new Map(verifiedExcerpts.map(x=>[normalizeForExactSupport(x),x]));
 const explicit=arr(profile?.experienceSignals?.activityModes).map(item=>({kind:text(item?.kind),supportExcerpt:verified.get(normalizeForExactSupport(item?.supportExcerpt))||''})).filter(item=>item.kind==='cross_functional_coordination'&&item.supportExcerpt);
 if(explicit.length)return explicit;
 const collaboration=profile?.careerSignals?.crossFunctionalCollaboration;
 const supported=['partial','strong'].includes(collaboration)&&verifiedExcerpts.length>0;
 return supported?[{kind:'cross_functional_coordination',supportExcerpt:verifiedExcerpts[0]}]:[];
}
function verifiedSupportExcerpts(profile={},sourceContent=''){
 const source=normalizeForExactSupport(sourceContent);if(!source)return [];
 return unique(arr(profile?.experienceSignals?.supportExcerpts)).filter(excerpt=>{
   const candidate=normalizeForExactSupport(excerpt);
   return candidate.length>=12&&source.includes(candidate);
 }).slice(0,6);
}
export function buildPrivateBetaSourceGroundedProjection({candidateSourceProfiles=[],professionalSources=[]}={}){
 const sourceById=new Map(arr(professionalSources).map(source=>[text(source?.id),source]));
 return freeze(arr(candidateSourceProfiles).map(item=>{
   const source=sourceById.get(text(item?.sourceId));
   const profile=item?.candidateProfile||{};
   const sourceFaithfulExperienceExcerpts=verifiedSupportExcerpts(profile,source?.content||'');
   return {
     sourceId:text(item?.sourceId),sourceRole:text(item?.sourceRole),provenance:{...(item?.provenance||{}),origin:item?.provenance?.origin||source?.provenance?.origin||null,providedBy:item?.provenance?.providedBy||source?.provenance?.providedBy||null,collectedAt:item?.provenance?.collectedAt||source?.provenance?.collectedAt||null},
     facts:profileFacts(profile),roleDescriptionFacts:roleDescriptionFacts(profile),
     domainSignals:unique(arr(profile?.domainSignals)).slice(0,5),
     experienceHighlights:unique(arr(profile?.experienceSignals?.highlights)).slice(0,6),
     sourceFaithfulExperienceExcerpts,
     activitySemantics:activitySemantics(profile,sourceFaithfulExperienceExcerpts)
   };
 }).filter(x=>x.sourceRole&&x.facts.length));
}
export default buildPrivateBetaSourceGroundedProjection;
