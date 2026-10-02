const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
const unique=v=>[...new Set(arr(v).map(text).filter(Boolean))];
function refForKnowledge(k,i){return text(k?.sourceRef)||`knowledge:${text(k?.semanticType)||'unknown'}:${i}`;}
function stableThreadOrder(a,b){
 const rank={higher_order_descriptive_structure:-1,grounded_descriptive_relationship:0,recurring_pattern:1,documented_continuity:2,distinct_episode:3,bounded_knowledge_meaning:4};
 return (rank[a.kind]??9)-(rank[b.kind]??9)||text(a.threadId).localeCompare(text(b.threadId));
}
function level1Class(t){
 if(t.kind==='higher_order_descriptive_structure')return 'higher_order_structure';
 if(t.kind==='grounded_descriptive_relationship'&&Number(t?.meaning?.materialCount)>=2)return 'cross_material_relationship';
 if(t.kind==='recurring_pattern'&&Number(t?.meaning?.supportCount)>=2)return 'cross_material_relationship';
 if(t.kind==='documented_continuity'&&Number(t?.meaning?.supportCount)>=2)return 'cross_role_authorised_pattern';
 if(t.kind==='distinct_episode'&&arr(t?.meaning?.distinctUnitRefs).length)return 'standalone_distinct_contribution';
 if(t.kind==='bounded_knowledge_meaning')return 'standalone_canonical_knowledge';
 return 'support_only';
}
export function composeProfessionalThreads({professionalMeaning={}}={}){
 const patterns=arr(professionalMeaning.supportedPatterns),episodes=arr(professionalMeaning.selectedEpisodeContributions),knowledge=arr(professionalMeaning.knowledgeContribution),threads=[];
 for(const h of arr(professionalMeaning.higherOrderDescriptiveProfessionalStructures)){if(h?.status!=='accepted')continue;threads.push({threadId:`professionalThread:pd070:${text(h.structureId)}`,kind:'higher_order_descriptive_structure',relationshipBasis:text(h.compositionBasis),meaning:{structureRef:text(h.structureId),structureWording:text(h.structureWording),claimShape:h.claimShape?{...h.claimShape}:null,contributorRefs:unique(h.contributorRefs),explicitlySubsumedContributorRefs:unique(h.explicitlySubsumedContributorRefs),contributorTypes:arr(h.contributorTypes).map(text),materialCount:unique(h.materialRefs).length},contributingMaterialRefs:unique([...(h.materialRefs||[]),...(h.contributorRefs||[])]),manifestations:arr(h.contributorRefs).map(x=>({relationshipRef:text(x)})),supportRefs:unique(h.sourceRefs),semanticProtectionRefs:['pd070_representation_only','no_person_level_inference','no_semantic_strengthening'],persistent:false});}
 for(const r of arr(professionalMeaning.groundedDescriptiveRelationships)){if(r?.status!=='accepted')continue;threads.push({threadId:`professionalThread:pd069:${text(r.relationshipId)}`,kind:'grounded_descriptive_relationship',relationshipBasis:text(r.relationshipBasis),meaning:{relationshipRef:text(r.relationshipId),relationshipWording:text(r.relationshipWording),materialCount:unique(r.materialRefs).length},contributingMaterialRefs:unique([...(r.materialRefs||[]),...(r.descriptorRefs||[])]),manifestations:arr(r.support).map(x=>({...x})),supportRefs:unique(r.sourceRefs),semanticProtectionRefs:['pd069_representation_only','no_person_level_inference'],persistent:false});}
 for(const p of patterns){
  if(p?.kind!=='documented_cross_functional_coordination_recurrence'&&p?.kind!=='documented_domain_continuity')continue;
  const kind=p.kind==='documented_cross_functional_coordination_recurrence'?'recurring_pattern':'documented_continuity';
  threads.push({threadId:`professionalThread:pattern:${text(p.kind)}:${text(p.domain)||unique(p.sourceRefs).join('|')}`,kind,relationshipBasis:p.kind,meaning:{patternKind:p.kind,domain:text(p.domain),supportCount:Number(p.supportCount)||0},contributingMaterialRefs:unique([...(p.sourceRefs||[]),...(p.episodeRefs||[])]),manifestations:arr(p.supports).map(s=>({sourceId:text(s?.sourceId),sourceRole:text(s?.sourceRole),supportExcerpt:text(s?.supportExcerpt)})).filter(x=>x.sourceId||x.supportExcerpt),supportRefs:unique(p.sourceRefs),semanticProtectionRefs:[],persistent:false});
 }
 // Role chronology remains available in roleHistory. It is deliberately not promoted
 // into a Professional Thread unless an authorised pattern above establishes what continues.
 for(const c of episodes){threads.push({threadId:`professionalThread:episode:${text(c?.episodeMeaningRef)||text(c?.sourceId)}`,kind:'distinct_episode',relationshipBasis:'pd058_distinct_informational_contribution',meaning:{description:text(c?.description),participation:text(c?.participation),distinctUnitRefs:unique(c?.distinctUnitRefs)},contributingMaterialRefs:unique([c?.episodeMeaningRef,c?.sourceId,...arr(c?.distinctUnitRefs)]),manifestations:[{episodeMeaningRef:text(c?.episodeMeaningRef),sourceId:text(c?.sourceId),description:text(c?.description)}],supportRefs:unique([c?.sourceId]),semanticProtectionRefs:[],persistent:false});}
 // Shared Runtime lineage remains reconstructable on knowledgeContribution.lineage, but is
 // provenance/acquisition identity only. It is not promoted into professional episode meaning.
 knowledge.forEach((k,i)=>threads.push({threadId:`professionalThread:knowledge:${refForKnowledge(k,i)}`,kind:'bounded_knowledge_meaning',relationshipBasis:'canonical_knowledge_identity',meaning:{semanticType:text(k?.semanticType),primaryProfessionalMeaning:k?.primaryProfessionalMeaning||null,professionalMeaning:text(k?.professionalMeaning)},contributingMaterialRefs:unique([refForKnowledge(k,i)]),manifestations:[{semanticType:text(k?.semanticType),sourceRef:refForKnowledge(k,i)}],supportRefs:unique([k?.lineage?.sourceEvidenceRef,k?.sourceRef]),semanticProtectionRefs:unique(k?.limitations),persistent:false}));
 const classified=threads.map(t=>({...t,level1SelectionClass:level1Class(t)})).sort(stableThreadOrder);
 return freeze(classified);
}
export function selectLevel1ProfessionalThreads(threads=[]){
 const eligible=arr(threads).filter(t=>['higher_order_structure','cross_material_relationship','cross_role_authorised_pattern','standalone_distinct_contribution','standalone_canonical_knowledge'].includes(t?.level1SelectionClass));
 const higher=eligible.filter(t=>t.level1SelectionClass==='higher_order_structure').sort(stableThreadOrder).filter((t,i,a)=>!a.slice(0,i).some(x=>text(x?.meaning?.structureWording)===text(t?.meaning?.structureWording)));
 const selected=higher.slice(0,3),subsumed=new Set(selected.flatMap(t=>[...arr(t?.meaning?.contributorRefs),...arr(t?.meaning?.explicitlySubsumedContributorRefs)]));
 const isSubsumed=t=>{if(t.kind==='grounded_descriptive_relationship')return subsumed.has(`relationship:${text(t?.meaning?.relationshipRef)}`)||subsumed.has(text(t?.meaning?.relationshipRef));if(t.kind==='recurring_pattern'||t.kind==='documented_continuity')return [...subsumed].some(r=>r.startsWith('pattern:')&&r.slice(8)===text(t.threadId).replace(/^professionalThread:pattern:/,''));if(t.kind==='distinct_episode')return subsumed.has(`episodeMeaning:${text(t?.manifestations?.[0]?.episodeMeaningRef)}`);if(t.kind==='bounded_knowledge_meaning')return subsumed.has(`knowledge:${text(t?.manifestations?.[0]?.sourceRef)}`);return false};
 if(selected.length>=3)return freeze(selected);
 const cross=eligible.filter(t=>['cross_material_relationship','cross_role_authorised_pattern'].includes(t.level1SelectionClass)).sort(stableThreadOrder).filter(t=>!isSubsumed(t));
 for(const t of cross){if(selected.length>=3)break;selected.push(t)}
 const episodes=eligible.filter(t=>t.level1SelectionClass==='standalone_distinct_contribution').sort((a,b)=>arr(b?.meaning?.distinctUnitRefs).length-arr(a?.meaning?.distinctUnitRefs).length||stableThreadOrder(a,b)).filter(t=>!isSubsumed(t));
 for(const t of episodes){if(selected.length>=3)break;selected.push(t)}
 const boundedKnowledge=eligible.filter(t=>t.level1SelectionClass==='standalone_canonical_knowledge').sort(stableThreadOrder).filter(t=>!isSubsumed(t));
 for(const t of boundedKnowledge){if(selected.length>=3)break;selected.push(t)}
 return freeze(selected);
}
export default composeProfessionalThreads;
