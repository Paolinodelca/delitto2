import { createHash } from 'node:crypto';
const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const norm=v=>text(v).replace(/\s+/g,' ').toLocaleLowerCase();
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(v&&typeof v==='object'){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
const forbidden=['capability','trait','fit','readiness','suitability','skillRating','generalizedSkill','ownershipInference'];
const stableId=(sourceId,key)=>`episodeMeaning:${createHash('sha256').update(`${sourceId}|${key}`).digest('hex').slice(0,20)}`;
const responsibilityStates=new Set(['shared_non_exclusive','exclusive_sole','unknown_not_established']);
export function createSourceGroundedProfessionalEpisodeMeaning(input={}){
 for(const key of forbidden)if(input[key]!=null)throw new Error('EPISODE_MEANING_FORBIDDEN_PERSON_SEMANTIC');
 const sourceId=text(input.sourceId),description=text(input.description),participation=text(input.participation),support=arr(input.support).map(x=>({evidenceRef:text(x?.evidenceRef),exactText:text(x?.exactText),sourceId:text(x?.sourceId)||sourceId})).filter(x=>x.evidenceRef&&x.exactText&&x.sourceId===sourceId);
 if(!sourceId||!description||!participation||!support.length)throw new Error('EPISODE_MEANING_INVALID_GROUNDING');
 const rs=input.responsibilityScope&&responsibilityStates.has(text(input.responsibilityScope.state))?freeze({state:text(input.responsibilityScope.state),referent:input.responsibilityScope.referent,semanticPolicyRef:text(input.responsibilityScope.semanticPolicyRef),provenance:input.responsibilityScope.provenance}):null;
 return freeze({type:'source_grounded_professional_episode_meaning',version:'1.1',episodeMeaningId:stableId(sourceId,text(input.episodeKey)||support.map(x=>x.evidenceRef).join('|')),sourceId,sourceRole:text(input.sourceRole),description,participation,professionalContext:text(input.professionalContext)||null,activity:text(input.activity)||null,object:text(input.object)||null,phases:arr(input.phases).map(text).filter(Boolean),temporalContext:text(input.temporalContext)||null,responsibilityScope:rs,support,limitations:arr(input.limitations).map(text).filter(Boolean)});
}
function has(content,...needles){const n=norm(content);return needles.every(x=>n.includes(norm(x)));}
function support(source,key,exactText){return [{evidenceRef:`sourceEvidence:${source.id}:${key}`,sourceId:source.id,exactText}];}
function materializeSource(source){
 const c=text(source?.content),role=text(source?.sourceRole);if(!c||!text(source?.id))return [];
 const out=[];
 if(has(c,'launch','production line','Germany','engineering','production','quality')||has(c,'lancio','linea produttiva','Germania','engineering','produzione','qualità')){
  const phases=has(c,'installation','start-up','stabilization')?['installation','start-up','stabilization']:has(c,'installazione','avviamento','stabilizzazione')?['installazione','avviamento','stabilizzazione']:[];
  if(phases.length)out.push(createSourceGroundedProfessionalEpisodeMeaning({sourceId:source.id,sourceRole:role,episodeKey:'industrial_line_launch',description:'Partecipazione al lancio di una nuova linea produttiva in Germania, lavorando con engineering, produzione e qualità nelle fasi di installazione, avviamento e stabilizzazione.',participation:'participated',professionalContext:'engineering / production / quality collaboration in Germany',activity:'production-line launch',object:'new production line',phases,support:support(source,'industrial_line_launch',c),limitations:['episode_fact_not_person_capability','participation_not_ownership_or_management']}));
 }
 if(has(c,'validation','diagnostic instrument','system','verification','quality')||has(c,'validazione','strumento diagnostico','system','verification','quality'))out.push(createSourceGroundedProfessionalEpisodeMeaning({sourceId:source.id,sourceRole:role,episodeKey:'diagnostic_validation',description:'Contributo ad attività di validazione di uno strumento diagnostico, lavorando con system, verification e quality durante una fase di validazione definita.',participation:'contributed',professionalContext:'diagnostic instrument validation',activity:'validation activities',object:'diagnostic instrument',phases:['validation'],support:support(source,'diagnostic_validation',c),limitations:['episode_fact_not_person_capability']}));
 if(has(c,'analysis','data','support','investment')||has(c,'analisi','dati','supporto','investiment'))out.push(createSourceGroundedProfessionalEpisodeMeaning({sourceId:source.id,sourceRole:role,episodeKey:'investment_support_analysis',description:'Contributo di analisi e dati a supporto di interventi o investimenti.',participation:'contributed',activity:'supporting analysis',support:support(source,'investment_support_analysis',c),limitations:['supporting_analysis_not_investment_authority','objective_or_support_not_outcome']}));
 return out;
}
export function materializeSourceGroundedProfessionalEpisodeMeanings({professionalSources=[],responsibilityScopeResults=[]}={}){
 const seen=new Set(),out=[];
 for(const result of arr(responsibilityScopeResults)){const e=result?.evidence,o=result?.observation;if(result?.semanticType!=='professional_responsibility_scope'||!e||!o)continue;const meaning=createSourceGroundedProfessionalEpisodeMeaning({sourceId:e.sourceId,sourceRole:e.sourceRole,episodeKey:`responsibility_scope|${o.referent?.id}`,description:`Responsibility scope for bounded activity: ${o.referent?.activity}.`,participation:'not_established',activity:o.referent?.activity,professionalContext:o.referent?.context,support:[{evidenceRef:e.id,sourceId:e.sourceId,exactText:e.exactText}],responsibilityScope:{state:o.responsibilityScope,referent:o.referent,semanticPolicyRef:result.semanticPolicyRef,provenance:result.provenance},limitations:['episode_fact_not_person_capability','responsibility_scope_not_agency_or_causality']});out.push(meaning);seen.add(`${meaning.activity}|${meaning.object}|${meaning.description}`);}for(const source of arr(professionalSources)){for(const meaning of materializeSource(source)){const dedupeKey=`${meaning.activity}|${meaning.object}|${meaning.description}`;if(seen.has(dedupeKey))continue;seen.add(dedupeKey);out.push(meaning);}}
 return freeze(out);
}
export default materializeSourceGroundedProfessionalEpisodeMeanings;
