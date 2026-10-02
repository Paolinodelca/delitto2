const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const unique=v=>[...new Set(arr(v).map(text).filter(Boolean))];
const sameSet=(a,b)=>{const x=unique(a).sort(),y=unique(b).sort();return x.length===y.length&&x.every((v,i)=>v===y[i]);};
const patternRef=p=>text(p?.contributorRef);

// PD-071A structural composition authority only. No prose comparison occurs here.
// A Pattern is consumed only when its complete canonical professional-basis and source
// identity are exactly the same as the accepted Higher-Order structure and that
// structure was actually composed through accepted PD-069 relationship lineage.
export function deriveExplicitCrossTypePrimaryCompositionSubsumption({structures=[],contributors=[]}={}){
 const patterns=arr(contributors).filter(c=>text(c?.contributorType)==='supported_pattern'&&patternRef(c));
 return arr(structures).map(structure=>{
  if(structure?.status!=='accepted')return structure;
  const refs=unique(structure.contributorRefs),types=arr(structure.contributorTypes).map(text);
  const hasRelationshipLineage=types.includes('grounded_descriptive_professional_relationship');
  const explicit=[];
  if(hasRelationshipLineage){
   for(const pattern of patterns){
    if(refs.includes(patternRef(pattern)))continue;
    const patternBases=unique(pattern.professionalBasisRefs),structureBases=unique(structure.professionalBasisRefs);
    const patternSources=unique(pattern.sourceRefs),structureSources=unique(structure.sourceRefs);
    if(patternBases.length<2||patternSources.length<1)continue;
    if(sameSet(patternBases,structureBases)&&sameSet(patternSources,structureSources))explicit.push(patternRef(pattern));
   }
  }
  return Object.freeze({...structure,explicitlySubsumedContributorRefs:Object.freeze(unique(explicit)),provenance:Object.freeze({...structure.provenance,explicitlySubsumedContributorRefs:Object.freeze(unique(explicit))})});
 });
}
export default deriveExplicitCrossTypePrimaryCompositionSubsumption;
