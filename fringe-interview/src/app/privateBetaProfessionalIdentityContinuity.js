import { validateRepresentationSnapshots } from './privateBetaProfessionalRepresentationSnapshots.js';
import { mergeProfessionalSourceAssets, validateProfessionalSourceAssetCollection } from './privateBetaProfessionalSourceAssets.js';
function object(value){return !!value&&typeof value==="object"&&!Array.isArray(value);}
function text(value){return typeof value==="string"?value.trim():"";}
function clone(value){return value==null?value:JSON.parse(JSON.stringify(value));}
function freeze(value){if(Array.isArray(value)){value.forEach(freeze);return Object.freeze(value);}if(object(value)){Object.values(value).forEach(freeze);return Object.freeze(value);}return value;}
function knowledgeKey(item){return text(item?.knowledgeRef||item?.knowledgeSnapshot?.snapshotId||item?.knowledgeSnapshot?.id)||text(item?.fhtLiveResultKey)||text(item?.sourceExecutionRef);}
function reusableKnowledge(item){
  if(!object(item)||!object(item.knowledgeSnapshot)||!knowledgeKey(item))return null;
  return {
    semanticType:text(item.semanticType),
    semanticPolicyRef:text(item.semanticPolicyRef),
    semanticAuthority:object(item.semanticAuthority)?clone(item.semanticAuthority):null,
    observation:object(item.observation)?clone(item.observation):null,
    specializedMeasurementResult:object(item.specializedMeasurementResult)?clone(item.specializedMeasurementResult):null,
    measurementResult:object(item.measurementResult)?clone(item.measurementResult):null,
    dimensionContributions:Array.isArray(item.dimensionContributions)?clone(item.dimensionContributions):[],
    knowledgeLedger:object(item.knowledgeLedger)?clone(item.knowledgeLedger):null,
    knowledgeSnapshot:clone(item.knowledgeSnapshot),
    fhtLiveResultKey:text(item.fhtLiveResultKey),
    sourceExecutionRef:text(item.sourceExecutionRef),
    sourceRuntimeSessionRef:text(item.sourceRuntimeSessionRef),
    sourceRuntimeActionRef:text(item.sourceRuntimeActionRef),
    sourceEvidenceRef:text(item.sourceEvidenceRef),
    knowledgeRef:knowledgeKey(item)
  };
}
function mergeKnowledge(existing=[],incoming=[]){
  const byKey=new Map();
  for(const source of [existing,incoming])for(const item of Array.isArray(source)?source:[]){
    const projected=reusableKnowledge(item);if(projected)byKey.set(knowledgeKey(projected),projected);
  }
  return [...byKey.values()].sort((a,b)=>knowledgeKey(a).localeCompare(knowledgeKey(b)));
}
export function buildPrivateBetaProfessionalIdentityContinuityRecord({personRef,priorRecord=null,session,now}={}){
  if(!object(personRef)||personRef.type!=="person"||!text(personRef.id))throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_PERSON_REF_REQUIRED");
  if(!object(session))throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_SESSION_REQUIRED");
  const prior=object(priorRecord)&&priorRecord.type==="private_beta_professional_identity_continuity"?priorRecord:null;
  if(prior&&prior.personRef?.id!==personRef.id)throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_PERSON_MISMATCH");
  const existing=prior?.reusableKnowledgeResults||[];
  const merged=mergeKnowledge(existing,session.runtimeKnowledgeResults||[]);
  const newKnowledgeCount=Math.max(0,merged.length-existing.length);
  const currentProfessionalSource=Array.isArray(session?.professionalSources)?session.professionalSources.find(x=>x?.sourceRole==='current_cv'):null;const cvText=text(currentProfessionalSource?.content)||text(session?.rawInput?.cvText)||text(prior?.authorizedMaterials?.cvText);
  const userNotes=text(session?.rawInput?.userNotes)||text(prior?.authorizedMaterials?.userNotes);const professionalSources=Array.isArray(session?.professionalSources)?clone(session.professionalSources):Array.isArray(prior?.professionalSources)?clone(prior.professionalSources):[];
  const savedAt=text(now)||new Date().toISOString();
  if(prior&&newKnowledgeCount===0&&cvText===text(prior?.authorizedMaterials?.cvText)&&userNotes===text(prior?.authorizedMaterials?.userNotes)&&JSON.stringify(professionalSources)===JSON.stringify(prior?.professionalSources||[]))return freeze(clone(prior));
  return freeze({
    version:"1.0",
    type:"private_beta_professional_identity_continuity",
    professionalIdentityRef:prior?.professionalIdentityRef||`professionalIdentity:${personRef.id}`,
    personRef:{type:"person",id:personRef.id},
    owner:"person",
    authorizedMaterials:{cvText,userNotes},
    professionalSources,
    sourceAssets:clone(prior?.sourceAssets||[]),
    reusableKnowledgeResults:merged,
    knowledgeRefs:merged.map(knowledgeKey),
    revision:(prior?.revision||0)+1,
    createdAt:prior?.createdAt||savedAt,
    updatedAt:savedAt,
    lastEnrichedBySessionRef:newKnowledgeCount>0?text(session?.betaSession?.sessionId):prior?.lastEnrichedBySessionRef||null,
    representationSnapshots:clone(prior?.representationSnapshots||[]),
    currentRepresentationSnapshotRefs:clone(prior?.currentRepresentationSnapshotRefs||{}),
    applicationState:clone(prior?.applicationState||{})
  });
}

export function buildPrivateBetaProfessionalIdentityEnrichmentRecord({personRef,priorRecord,professionalSources,userNotes,now}={}){
  if(!object(personRef)||personRef.type!=="person"||!text(personRef.id))throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_PERSON_REF_REQUIRED");
  const prior=object(priorRecord)&&priorRecord.type==="private_beta_professional_identity_continuity"?priorRecord:null;
  if(!prior)throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_PRIOR_RECORD_REQUIRED");
  if(prior.personRef?.id!==personRef.id)throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_PERSON_MISMATCH");
  const sources=Array.isArray(professionalSources)?clone(professionalSources):clone(prior.professionalSources||[]);
  const currentProfessionalSource=sources.find(x=>x?.sourceRole==='current_cv');
  const cvText=text(currentProfessionalSource?.content)||text(prior?.authorizedMaterials?.cvText);
  const nextUserNotes=text(userNotes)||text(prior?.authorizedMaterials?.userNotes);
  const unchanged=cvText===text(prior?.authorizedMaterials?.cvText)&&nextUserNotes===text(prior?.authorizedMaterials?.userNotes)&&JSON.stringify(sources)===JSON.stringify(prior?.professionalSources||[]);
  if(unchanged)return freeze(clone(prior));
  const savedAt=text(now)||new Date().toISOString();
  return freeze({
    ...clone(prior),
    authorizedMaterials:{cvText,userNotes:nextUserNotes},
    professionalSources:sources,
    revision:(prior.revision||0)+1,
    updatedAt:savedAt
  });
}


export function attachPrivateBetaProfessionalSourceAsset({priorRecord,sourceAsset,now}={}){
  const prior=object(priorRecord)&&priorRecord.type==="private_beta_professional_identity_continuity"?priorRecord:null;
  if(!prior)throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_PRIOR_RECORD_REQUIRED");
  const assets=mergeProfessionalSourceAssets(prior.sourceAssets||[],[sourceAsset]);
  validateProfessionalSourceAssetCollection(assets,{professionalSources:prior.professionalSources||[]});
  const savedAt=text(now)||new Date().toISOString();
  return freeze({...clone(prior),sourceAssets:clone(assets),revision:(prior.revision||0)+1,updatedAt:savedAt});
}

export function updatePrivateBetaCareerPreferenceContext({priorRecord,careerPreferenceContext,now}={}){
  const prior=object(priorRecord)&&priorRecord.type==='private_beta_professional_identity_continuity'?priorRecord:null;
  if(!prior)throw new Error('PRIVATE_BETA_PROFESSIONAL_IDENTITY_PRIOR_RECORD_REQUIRED');
  if(!object(careerPreferenceContext)||careerPreferenceContext.candidateDeclared!==true)throw new Error('PRIVATE_BETA_CAREER_PREFERENCE_CONTEXT_REQUIRED');
  const existing=prior?.applicationState?.careerPreferenceContext||null;
  if(JSON.stringify(existing)===JSON.stringify(careerPreferenceContext))return freeze(clone(prior));
  const savedAt=text(now)||new Date().toISOString();
  return freeze({...clone(prior),applicationState:{...clone(prior.applicationState||{}),careerPreferenceContext:clone(careerPreferenceContext)},revision:(prior.revision||0)+1,updatedAt:savedAt});
}


export function updatePrivateBetaApplicationState({priorRecord,opportunityUnderstanding,groundedApplicationPackage,applicationArtifacts,now}={}){
 const prior=object(priorRecord)&&priorRecord.type==="private_beta_professional_identity_continuity"?priorRecord:null;
 if(!prior)throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_PRIOR_RECORD_REQUIRED");
 if(!object(opportunityUnderstanding)||opportunityUnderstanding.type!=="opportunity_understanding")throw new Error("PRIVATE_BETA_OPPORTUNITY_UNDERSTANDING_REQUIRED");
 if(!object(groundedApplicationPackage)||groundedApplicationPackage.type!=="grounded_application_package")throw new Error("PRIVATE_BETA_APPLICATION_PACKAGE_REQUIRED");
 if(!object(applicationArtifacts)||applicationArtifacts.type!=="grounded_application_artifacts")throw new Error("PRIVATE_BETA_APPLICATION_ARTIFACTS_REQUIRED");
 const savedAt=text(now)||new Date().toISOString();
 return freeze({...clone(prior),applicationState:{...clone(prior.applicationState||{}),activePurpose:'opportunity_application',opportunityUnderstanding:clone(opportunityUnderstanding),groundedApplicationPackage:clone(groundedApplicationPackage),applicationArtifacts:clone(applicationArtifacts)},revision:(prior.revision||0)+1,updatedAt:savedAt});
}

export function validatePrivateBetaProfessionalIdentityContinuityRecord(record,{personRef}={}){
  if(!object(record)||record.type!=="private_beta_professional_identity_continuity"||record.owner!=="person")throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_INVALID_RECORD");
  if(!object(record.personRef)||record.personRef.type!=="person"||!text(record.personRef.id))throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_INVALID_RECORD");
  if(personRef&&text(personRef.id)!==text(record.personRef.id))throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_PERSON_MISMATCH");
  if(!text(record.professionalIdentityRef)||!Array.isArray(record.professionalSources)||!Array.isArray(record.reusableKnowledgeResults))throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_INVALID_RECORD");
  if(record.sourceAssets!=null&&!Array.isArray(record.sourceAssets))throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_INVALID_RECORD");
  validateProfessionalSourceAssetCollection(record.sourceAssets||[],{professionalSources:record.professionalSources||[]});
  if(!object(record.authorizedMaterials)||!Number.isInteger(record.revision)||record.revision<1)throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_INVALID_RECORD");
  for(const item of record.reusableKnowledgeResults){if(!reusableKnowledge(item))throw new Error("PRIVATE_BETA_PROFESSIONAL_IDENTITY_INVALID_RECORD");}
  validateRepresentationSnapshots(record);
  return true;
}
export function createMemoryPrivateBetaProfessionalIdentityStore(){
  const records=new Map();
  return {
    async load({personRef}={}){const id=text(personRef?.id);return id&&records.has(id)?clone(records.get(id)):null;},
    async save({record}={}){validatePrivateBetaProfessionalIdentityContinuityRecord(record);records.set(record.personRef.id,clone(record));return clone(record);}
  };
}
export function privateBetaPersonRefFromContext(contextId){const id=text(contextId);if(!id)throw new Error("PRIVATE_BETA_PERSON_CONTEXT_REQUIRED");return Object.freeze({type:"person",id:`private-beta-person:${id}`});}
