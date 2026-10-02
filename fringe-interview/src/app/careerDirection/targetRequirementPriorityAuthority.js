const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const freeze=v=>Object.freeze(clone(v));

export const TARGET_REQUIREMENT_PRIORITY_AUTHORITY='target_requirement_priority_authority:onet_task:v1';
export const ONET_SOURCE_VERSION='O*NET 31.0 / O*NET OnLine Updated 2026';

// Curated Beta slice. Exact task identities/rating values are source-native O*NET authority,
// not IMAGO normalization. Task importance is kept distinct from Level.
export const CURATED_ONET_TASK_DESCRIPTORS=Object.freeze({
 '11-1021.00:933':{occupationCode:'11-1021.00',taskId:933,taskType:'Core',importance:79,statement:'Direct and coordinate activities of businesses or departments concerned with the production, pricing, sales, or distribution of products.'},
 '11-1021.00:20701':{occupationCode:'11-1021.00',taskId:20701,taskType:'Core',importance:75,statement:'Prepare staff work schedules and assign specific duties.'},
 '11-1021.00:20703':{occupationCode:'11-1021.00',taskId:20703,taskType:'Core',importance:73,statement:'Direct or coordinate financial or budget activities to fund operations, maximize investments, or increase efficiency.'},
 '11-1021.00:20705':{occupationCode:'11-1021.00',taskId:20705,taskType:'Core',importance:70,statement:'Perform personnel functions, such as selection, training, or evaluation.'},
 '11-1021.00:20706':{occupationCode:'11-1021.00',taskId:20706,taskType:'Core',importance:71,statement:'Plan or direct activities, such as sales promotions, that require coordination with other department managers.'},
 '11-3051.00:32':{occupationCode:'11-3051.00',taskId:32,taskType:'Core',importance:75,statement:'Direct or coordinate production, processing, distribution, or marketing activities of industrial organizations.'},
 '11-3051.00:33':{occupationCode:'11-3051.00',taskId:33,taskType:'Core',importance:64,statement:'Develop budgets or approve expenditures for supplies, materials, or human resources, ensuring that materials, labor, or equipment are used efficiently to meet production targets.'},
 '11-3051.00:34':{occupationCode:'11-3051.00',taskId:34,taskType:'Core',importance:75,statement:'Review processing schedules or production orders to make decisions concerning inventory requirements, staffing requirements, work procedures, or duty assignments, considering budgetary limitations and time constraints.'},
 '11-3051.00:35':{occupationCode:'11-3051.00',taskId:35,taskType:'Core',importance:71,statement:'Review operations and confer with technical or administrative staff to resolve production or processing problems.'},
 '11-3051.00:36':{occupationCode:'11-3051.00',taskId:36,taskType:'Core',importance:71,statement:'Hire, train, evaluate, or discharge staff or resolve personnel grievances.'},
 '11-3051.00:40':{occupationCode:'11-3051.00',taskId:40,taskType:'Core',importance:70,statement:'Develop or implement production tracking or quality control systems, analyzing production, quality control, maintenance, or other operational reports to detect production problems.'}
});

export const CURATED_REQUIREMENT_DESCRIPTOR_MAP=Object.freeze({
 'operations_manager.cross_functional_operational_coordination':['11-1021.00:20706'],
 'operations_manager.broader_operational_decision_context':['11-1021.00:933'],
 'operations_manager.people_responsibility':['11-1021.00:20701','11-1021.00:20705'],
 'operations_manager.budget_operational_resources':['11-1021.00:20703'],
 'industrial_production_manager.cross_functional_operational_coordination':['11-3051.00:35'],
 'industrial_production_manager.production_performance_scope':['11-3051.00:40'],
 'industrial_production_manager.people_responsibility':['11-3051.00:36'],
 'industrial_production_manager.budget_schedule_scope':['11-3051.00:34','11-3051.00:33']
});

const occupationFromSourceRef=sourceRef=>{const m=text(sourceRef).match(/roleSource:onet:(\d{2}-\d{4}\.\d{2}):/);return m?.[1]||null;};
export function createTargetRequirementPriority({targetDirectionRef,targetRequirement,roleSourceRefs=[],descriptorKeys=[]}={}){
 const requirementRef=text(targetRequirement?.id); if(!text(targetDirectionRef)||!requirementRef)return freeze({accepted:false,rejectionCategory:'identity_missing'});
 const occupationCodes=new Set(arr(roleSourceRefs).map(occupationFromSourceRef).filter(Boolean));
 if(!occupationCodes.size)return freeze({accepted:false,rejectionCategory:'occupation_identity_missing'});
 const mapped=arr(CURATED_REQUIREMENT_DESCRIPTOR_MAP[requirementRef]);
 if(!mapped.length)return freeze({accepted:false,rejectionCategory:'no_curated_descriptor_mapping'});
 const requested=arr(descriptorKeys).length?arr(descriptorKeys):mapped;
 if(requested.some(k=>!mapped.includes(k)))return freeze({accepted:false,rejectionCategory:'descriptor_not_curated_for_requirement'});
 const descriptors=[];
 for(const key of requested){const d=CURATED_ONET_TASK_DESCRIPTORS[key]; if(!d)return freeze({accepted:false,rejectionCategory:'descriptor_identity_unknown'}); if(!occupationCodes.has(d.occupationCode))return freeze({accepted:false,rejectionCategory:'descriptor_wrong_occupation'}); descriptors.push({externalAuthority:'ONET',occupationIdentity:{type:'ONET_SOC',code:d.occupationCode},descriptorIdentity:{type:'ONET_TASK',taskId:d.taskId},descriptorType:'task',rawPriorityRelation:{taskType:d.taskType},rawImportanceRating:{scaleId:'IM',scaleName:'Importance',displayValue:d.importance},rawLevelRating:null,sourceVersion:ONET_SOURCE_VERSION,sourceRef:`roleSource:onet:${d.occupationCode}:2026`,mappingBasis:{kind:'curated_beta_exact_descriptor',requirementRef,authorityRef:TARGET_REQUIREMENT_PRIORITY_AUTHORITY},provenance:{descriptorStatement:d.statement,authorityRef:TARGET_REQUIREMENT_PRIORITY_AUTHORITY}});}
 return freeze({type:'target_requirement_priority',targetDirectionRef,targetRequirementRef:requirementRef,externalAuthority:'ONET',acceptanceState:'accepted',accepted:true,descriptors,aggregation:{state:descriptors.length>1?'descriptor_level_only_no_aggregation':'single_descriptor',normalizedPriority:null},limitations:['Target-role knowledge only; does not establish Candidate support, fit, readiness, or capability.','O*NET Importance and task type remain source-native; no IMAGO normalized priority category is authorised.']});
}
export function buildTargetRequirementPriorities(role){return freeze(arr(role?.requirements).map(r=>createTargetRequirementPriority({targetDirectionRef:role.id,targetRequirement:r,roleSourceRefs:role.sourceRefs})).filter(x=>x.accepted));}
export function buildTargetRequirementPriorityDiagnostics(role){return freeze(buildTargetRequirementPriorities(role).map(p=>({targetDirectionRef:p.targetDirectionRef,targetRequirementRef:p.targetRequirementRef,externalAuthority:p.externalAuthority,descriptorIdentities:p.descriptors.map(d=>d.descriptorIdentity),rawPriority:p.descriptors.map(d=>({taskType:d.rawPriorityRelation.taskType,importance:d.rawImportanceRating?.displayValue??null,level:d.rawLevelRating})),accepted:p.accepted,aggregation:p.aggregation.state})));}
