const REF_KEYS = ["type", "id"];
function isObject(v){return v!==null&&typeof v==="object"&&!Array.isArray(v)}
function cleanString(v){return typeof v==="string"&&v.trim()?v.trim():null}
function clamp01(v,d=null){return typeof v==="number"&&Number.isFinite(v)?Math.min(1,Math.max(0,v)):d}
function normalizeRef(v){if(!isObject(v))return null; const type=cleanString(v.type),id=cleanString(v.id); return type&&id?{type,id}:null}
function normalizeRefs(v){if(!Array.isArray(v))return[];const out=[];const seen=new Set();for(const x of v){const r=normalizeRef(x);if(!r)continue;const k=`${r.type}:${r.id}`;if(!seen.has(k)){seen.add(k);out.push(r)}}return out}
function metadata(v,now){v=isObject(v)?v:{};return{version:cleanString(v.version)||"1.0",createdAt:cleanString(v.createdAt)||now}}
function extensions(v){return isObject(v)?JSON.parse(JSON.stringify(v)): {}}
function unknownKeys(obj,allowed,path,errors){if(!isObject(obj))return;for(const k of Object.keys(obj))if(!allowed.includes(k))errors.push(`${path}.${k} is not allowed.`)}
function validDate(v){return typeof v==="string"&&!Number.isNaN(Date.parse(v))}
function validateRef(v,path,errors){if(!isObject(v)){errors.push(`${path} must be an object.`);return}unknownKeys(v,REF_KEYS,path,errors);if(!cleanString(v.type))errors.push(`${path}.type is required.`);if(!cleanString(v.id))errors.push(`${path}.id is required.`)}
function hasRawPayload(obj){const banned=["content","rawContent","sourceContent","transcript","prompt","fullText","cv","answerText"];return isObject(obj)&&Object.keys(obj).some(k=>banned.includes(k))}
module.exports={isObject,cleanString,clamp01,normalizeRef,normalizeRefs,metadata,extensions,unknownKeys,validDate,validateRef,hasRawPayload};
