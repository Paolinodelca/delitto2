import { createHash } from 'node:crypto';

export const PROFESSIONAL_SOURCE_ASSET_MAX_BYTES=2_500_000;
export const PROFESSIONAL_SOURCE_ASSET_TOTAL_MAX_BYTES=6_000_000;
export const PROFESSIONAL_SOURCE_ASSET_MAX_COUNT=12;
export const PROFESSIONAL_SOURCE_ASSET_ALLOWED_MIME=Object.freeze([
 'application/pdf',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'text/plain'
]);
const text=v=>typeof v==='string'?v.trim():'';
const obj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const sha=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(Array.isArray(v)){v.forEach(freeze);return Object.freeze(v)}if(obj(v)){Object.values(v).forEach(freeze);return Object.freeze(v)}return v};
export function safeProfessionalSourceFilename(value='source'){const base=text(value).replace(/\\/g,'/').split('/').pop()||'source';const safe=base.replace(/[\x00-\x1f\x7f<>:"|?*]/g,'_').replace(/^\.+/,'').trim().slice(0,140);return safe||'source';}
function bytesFrom(value){if(Buffer.isBuffer(value))return value;if(value instanceof Uint8Array)return Buffer.from(value);if(typeof value==='string')return Buffer.from(value,'base64');throw new Error('PROFESSIONAL_SOURCE_ASSET_BYTES_REQUIRED');}
function validateMimeBytes(mime,bytes,filename){
 if(!PROFESSIONAL_SOURCE_ASSET_ALLOWED_MIME.includes(mime))throw new Error('PROFESSIONAL_SOURCE_ASSET_MIME_UNSUPPORTED');
 if(mime==='application/pdf'&&!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))throw new Error('PROFESSIONAL_SOURCE_ASSET_TYPE_MISMATCH');
 if(mime==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
  if(!(bytes[0]===0x50&&bytes[1]===0x4b))throw new Error('PROFESSIONAL_SOURCE_ASSET_TYPE_MISMATCH');
  const raw=bytes.toString('latin1');if(!raw.includes('[Content_Types].xml')||!raw.includes('word/document.xml'))throw new Error('PROFESSIONAL_SOURCE_ASSET_TYPE_MISMATCH');
 }
 if(mime==='text/plain'&&bytes.includes(0))throw new Error('PROFESSIONAL_SOURCE_ASSET_TYPE_MISMATCH');
 const lower=filename.toLowerCase();if(mime==='application/pdf'&&!lower.endsWith('.pdf'))throw new Error('PROFESSIONAL_SOURCE_ASSET_EXTENSION_MISMATCH');
 if(mime==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'&&!lower.endsWith('.docx'))throw new Error('PROFESSIONAL_SOURCE_ASSET_EXTENSION_MISMATCH');
}
export function buildProfessionalSourceAsset({sourceRef,originalFilename,mimeType,bytes,provenanceClass='candidate_uploaded_professional_source'}={}){
 const source=text(sourceRef);if(!source)throw new Error('PROFESSIONAL_SOURCE_ASSET_SOURCE_REF_REQUIRED');const data=bytesFrom(bytes);if(!data.length)throw new Error('PROFESSIONAL_SOURCE_ASSET_EMPTY');if(data.length>PROFESSIONAL_SOURCE_ASSET_MAX_BYTES)throw new Error('PROFESSIONAL_SOURCE_ASSET_TOO_LARGE');
 const filename=safeProfessionalSourceFilename(originalFilename),mime=text(mimeType).toLowerCase();validateMimeBytes(mime,data,filename);const digest=sha(data);
 return freeze({assetId:`sourceAsset:${digest.slice(0,24)}`,sourceRefs:[source],originalFilename:filename,mimeType:mime,byteSize:data.length,sha256:digest,provenanceClass:text(provenanceClass)||'candidate_uploaded_professional_source',contentBase64:data.toString('base64')});
}
export function mergeProfessionalSourceAssets(existing=[],incoming=[]){
 const bySha=new Map();for(const item of [...(Array.isArray(existing)?existing:[]),...(Array.isArray(incoming)?incoming:[])]){const normalized=validateProfessionalSourceAsset(item);const prior=bySha.get(normalized.sha256);if(!prior){bySha.set(normalized.sha256,{...normalized,sourceRefs:[...normalized.sourceRefs]});continue;}prior.sourceRefs=[...new Set([...prior.sourceRefs,...normalized.sourceRefs])].sort();}
 const out=[...bySha.values()];validateProfessionalSourceAssetCollection(out);return freeze(out);
}
export function validateProfessionalSourceAsset(asset,{professionalSourceRefs=null,requireBytes=true}={}){
 if(!obj(asset)||!text(asset.assetId)||!Array.isArray(asset.sourceRefs)||!asset.sourceRefs.length)throw new Error('PROFESSIONAL_SOURCE_ASSET_INVALID');const refs=[...new Set(asset.sourceRefs.map(text).filter(Boolean))];if(!refs.length)throw new Error('PROFESSIONAL_SOURCE_ASSET_INVALID');if(professionalSourceRefs){const allowed=new Set(professionalSourceRefs);if(refs.some(r=>!allowed.has(r)))throw new Error('PROFESSIONAL_SOURCE_ASSET_SOURCE_LINK_INVALID');}
 const filename=safeProfessionalSourceFilename(asset.originalFilename),mime=text(asset.mimeType).toLowerCase(),size=Number(asset.byteSize),digest=text(asset.sha256).toLowerCase();if(filename!==text(asset.originalFilename)||!PROFESSIONAL_SOURCE_ASSET_ALLOWED_MIME.includes(mime)||!Number.isInteger(size)||size<=0||size>PROFESSIONAL_SOURCE_ASSET_MAX_BYTES||!/^[a-f0-9]{64}$/.test(digest))throw new Error('PROFESSIONAL_SOURCE_ASSET_INVALID');
 let data=null;if(requireBytes){data=bytesFrom(asset.contentBase64);if(data.length!==size||sha(data)!==digest)throw new Error('PROFESSIONAL_SOURCE_ASSET_CORRUPTED');validateMimeBytes(mime,data,filename);}
 return {assetId:text(asset.assetId),sourceRefs:refs,originalFilename:filename,mimeType:mime,byteSize:size,sha256:digest,provenanceClass:text(asset.provenanceClass)||'candidate_uploaded_professional_source',...(requireBytes?{contentBase64:data.toString('base64')}:{})};
}
export function validateProfessionalSourceAssetCollection(assets=[],{professionalSources=[],requireBytes=true}={}){if(!Array.isArray(assets)||assets.length>PROFESSIONAL_SOURCE_ASSET_MAX_COUNT)throw new Error('PROFESSIONAL_SOURCE_ASSET_COUNT_LIMIT');const refs=professionalSources.length?professionalSources.map(x=>text(x?.id)).filter(Boolean):null;let total=0;const seen=new Set();for(const item of assets){const a=validateProfessionalSourceAsset(item,{professionalSourceRefs:refs,requireBytes});if(seen.has(a.sha256))throw new Error('PROFESSIONAL_SOURCE_ASSET_DUPLICATE');seen.add(a.sha256);total+=a.byteSize;}if(total>PROFESSIONAL_SOURCE_ASSET_TOTAL_MAX_BYTES)throw new Error('PROFESSIONAL_SOURCE_ASSET_TOTAL_TOO_LARGE');return true;}
export function professionalSourceAssetBytes(asset){const a=validateProfessionalSourceAsset(asset);return Buffer.from(a.contentBase64,'base64');}
export function professionalSourceAssetPublicMetadata(asset){const a=validateProfessionalSourceAsset(asset);return freeze({assetId:a.assetId,sourceRefs:a.sourceRefs,originalFilename:a.originalFilename,mimeType:a.mimeType,byteSize:a.byteSize,sha256:a.sha256,provenanceClass:a.provenanceClass});}
