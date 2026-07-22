const {isObject,cleanString,normalizeRef,normalizeRefs,metadata,extensions}=require('./shared');
function buildMeasurement(input={}){const now=cleanString(input.createdAt)||new Date().toISOString();return{
 id:cleanString(input.id)||`measurement_${Date.now()}`,type:cleanString(input.type)||"bounded_analysis",
 subjectRef:normalizeRef(input.subjectRef),sourceRefs:normalizeRefs(input.sourceRefs),
 scope:isObject(input.scope)?JSON.parse(JSON.stringify(input.scope)):{type:"unspecified"},
 targetIds:Array.isArray(input.targetIds)?[...new Set(input.targetIds.map(cleanString).filter(Boolean))]:[],
 method:isObject(input.method)?JSON.parse(JSON.stringify(input.method)):{id:"unspecified",version:"1.0"},
 status:["planned","in_progress","completed","cancelled"].includes(input.status)?input.status:"planned",
 context:isObject(input.context)?JSON.parse(JSON.stringify(input.context)):{},createdAt:now,
 completedAt:cleanString(input.completedAt),metadata:metadata(input.metadata,now),extensions:extensions(input.extensions)} }
module.exports={buildMeasurement};
