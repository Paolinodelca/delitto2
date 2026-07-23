const TOP = ["id", "measurementId", "targets", "valueStrategy", "confidenceStrategy", "metadata", "extensions"];
const TARGET = ["dimensionId", "contributionType", "weight", "confidenceFactor", "extensions"];
const META = ["version", "createdAt", "updatedAt"];
const TYPES = ["supporting", "contradicting"];
function isObject(v){return v!==null&&typeof v==="object"&&!Array.isArray(v)}
function text(v){return typeof v==="string"&&v.trim().length>0}
function unit(v){return typeof v==="number"&&Number.isFinite(v)&&v>=0&&v<=1}
function iso(v){return typeof v==="string"&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString()===v}
function unknown(value, allowed, path, errors){if(isObject(value))for(const key of Object.keys(value))if(!allowed.includes(key))errors.push(`${path}.${key} is not allowed.`)}
function validateMeasurementDimensionMapping(mapping = {}) {
  const errors=[], warnings=[];
  if(!isObject(mapping)) return {valid:false,errors:["MeasurementDimensionMapping must be an object."],warnings};
  unknown(mapping,TOP,"measurementDimensionMapping",errors);
  if(!text(mapping.id)) errors.push("id must be a non-empty string.");
  if(!text(mapping.measurementId)) errors.push("measurementId must be a non-empty string.");
  if(!Array.isArray(mapping.targets)) errors.push("targets must be an array.");
  else if(mapping.targets.length===0) errors.push("targets must contain at least one target.");
  else {
    const seen=new Set();
    mapping.targets.forEach((target,index)=>{
      const path=`targets[${index}]`;
      if(!isObject(target)){errors.push(`${path} must be an object.`);return;}
      unknown(target,TARGET,path,errors);
      if(!text(target.dimensionId)) errors.push(`${path}.dimensionId must be a non-empty string.`);
      else if(seen.has(target.dimensionId)) errors.push("targets must not contain duplicate dimensionId values.");
      else seen.add(target.dimensionId);
      if(!TYPES.includes(target.contributionType)) errors.push(`${path}.contributionType must be supporting or contradicting.`);
      if(!unit(target.weight)) errors.push(`${path}.weight must be a finite number between 0 and 1.`);
      if(!unit(target.confidenceFactor)) errors.push(`${path}.confidenceFactor must be a finite number between 0 and 1.`);
      if(!isObject(target.extensions)) errors.push(`${path}.extensions must be an object.`);
    });
  }
  if(mapping.valueStrategy!=="direct") errors.push('valueStrategy must be "direct".');
  if(mapping.confidenceStrategy!=="inherit") errors.push('confidenceStrategy must be "inherit".');
  if(!isObject(mapping.metadata)) errors.push("metadata must be an object.");
  else {
    unknown(mapping.metadata,META,"metadata",errors);
    if(mapping.metadata.version!=="1.0") errors.push('metadata.version must be "1.0".');
    if(!iso(mapping.metadata.createdAt)) errors.push("metadata.createdAt must be a valid ISO timestamp.");
    if(!iso(mapping.metadata.updatedAt)) errors.push("metadata.updatedAt must be a valid ISO timestamp.");
    if(iso(mapping.metadata.createdAt)&&iso(mapping.metadata.updatedAt)&&mapping.metadata.updatedAt<mapping.metadata.createdAt) errors.push("metadata.updatedAt must not precede metadata.createdAt.");
  }
  if(!isObject(mapping.extensions)) errors.push("extensions must be an object.");
  return {valid:errors.length===0,errors,warnings};
}
module.exports={validateMeasurementDimensionMapping};
