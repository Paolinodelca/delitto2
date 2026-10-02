import { createHash } from "node:crypto";
const text=v=>typeof v==="string"?v.trim():"";
const arr=v=>Array.isArray(v)?v:[];
const freeze=v=>Object.freeze(v);
const hash=v=>createHash("sha256").update(String(v)).digest("hex");
const fill=(template,values={})=>String(template||"").replace(/\{([a-zA-Z0-9_]+)\}/g,(_,k)=>String(values[k]??""));
const leaf=(kind,value,extra={})=>freeze({kind,text:text(value),...extra});
function displayGeneratedDate(value,language){const iso=text(value).slice(0,10),m=iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return "";return language==="it"?`${m[3]}/${m[2]}/${m[1]}`:`${m[1]}-${m[2]}-${m[3]}`;}
function candidateHeader(identity={}){
 const name=`${text(identity.name)} ${text(identity.surname)}`.trim();
 const contacts=[text(identity.phone),text(identity.email),text(identity.linkedin),text(identity.location)].filter(Boolean);
 return freeze({name,contacts:freeze(contacts)});
}
function normalizedExperience(model={}){return freeze(arr(model.professionalExperience).map((x,index)=>freeze({
 id:text(x?.id)||`experience:${index+1}`,
 role:text(x?.role),organisation:text(x?.organisation),period:text(x?.period),location:text(x?.location),
 details:freeze(arr(x?.details||x?.responsibilities).map(v=>typeof v==="string"?text(v):text(v?.text)).filter(Boolean)),
 targetEmphasis:text(x?.targetEmphasis)||"secondary"
})).filter(x=>x.role||x.organisation||x.period||x.details.length));}
function auxiliaryItems(values){return freeze(arr(values).map(x=>typeof x==="string"?text(x):text(x?.text||x?.label)).filter(Boolean));}
function coreModel({documentType,packageRef,language,template,candidate,target,generatedAt,sections,candidateMaterialRefs=[]}){
 const payload={documentType,packageRef,language,template,candidate,target,generatedAt,sections,candidateMaterialRefs};
 return freeze({version:"1.0",type:"application_document_model",...payload,contentFingerprint:hash(JSON.stringify(payload))});
}
export function buildTargetedCvDocumentModel({cvContentModel,applicationPackage,opportunityUnderstanding,documentLanguage="it",template="essential",messages}={}){
 if(cvContentModel?.type!=="cv_content_model")throw new Error("CV_CONTENT_MODEL_REQUIRED");
 const identity=cvContentModel.identity||{},candidate=candidateHeader(identity),targetRole=text(opportunityUnderstanding?.label)||text(messages?.applicationDocTargetFallback),experience=normalizedExperience(cvContentModel);
 const sections=[];
 sections.push(freeze({kind:"cv_header",blocks:freeze([leaf("candidate_name",candidate.name),...candidate.contacts.map(x=>leaf("candidate_contact",x)),leaf("document_title",text(messages?.applicationDocCvTitle)),leaf("target_reference",targetRole)].filter(x=>x.text))}));
 if(text(cvContentModel.professionalSummary))sections.push(freeze({kind:"summary",title:text(messages?.applicationDocProfile),blocks:freeze([leaf("paragraph",cvContentModel.professionalSummary)])}));
 if(experience.length)sections.push(freeze({kind:"experience",title:text(messages?.applicationDocExperience),entries:experience}));
 const education=auxiliaryItems(cvContentModel.education),skills=auxiliaryItems(cvContentModel.skills),languages=auxiliaryItems(cvContentModel.languages);
 if(education.length)sections.push(freeze({kind:"list",title:text(messages?.applicationDocEducation),items:education}));
 if(skills.length)sections.push(freeze({kind:"list",title:text(messages?.applicationDocSkills),items:skills}));
 if(languages.length)sections.push(freeze({kind:"list",title:text(messages?.applicationDocLanguages),items:languages}));
 return coreModel({documentType:"targeted_cv",packageRef:text(applicationPackage?.packageRef),language:documentLanguage==="en"?"en":"it",template,candidate,target:freeze({role:targetRole,opportunityRef:text(opportunityUnderstanding?.opportunityRef)}),generatedAt:text(applicationPackage?.createdAt),sections:freeze(sections),candidateMaterialRefs:freeze(arr(applicationPackage?.selectedCandidateMaterials).map(x=>text(x?.id)).filter(Boolean))});
}
export function buildCoverLetterDocumentModel({applicationPackage,opportunityUnderstanding,documentLanguage="it",template="essential",messages,transformedMaterialText}={}){
 const data=applicationPackage?.candidateDocumentData||{},candidate=candidateHeader({name:text(data.displayName),phone:text(data.phone),email:text(data.email),linkedin:text(data.linkedin),location:text(data.location)}),targetRole=text(opportunityUnderstanding?.label)||text(messages?.applicationDocTargetFallback),connections=arr(applicationPackage?.selectedCandidateMaterials).slice(0,2);
 const transformed=typeof transformedMaterialText==="function"?transformedMaterialText:((_,fallback)=>text(fallback));
 const narrative=connections.map((x,i)=>fill(i===0?messages?.applicationDocNarrativeConnectionFirst:messages?.applicationDocNarrativeConnectionNext,{experience:transformed(x.id,x.statement).replace(/[.!?]+$/," ").trim()})).map(text).filter(Boolean);
 const paragraphs=[text(messages?.applicationDocOpening),fill(messages?.applicationDocNeutralApplication,{target:targetRole}),connections.length?text(messages?.applicationDocNarrativeIntro):"",...narrative,connections.length?text(messages?.applicationDocNarrativeRelation):""].filter(Boolean);
 const generatedAt=text(applicationPackage?.createdAt),sections=[freeze({kind:"letter_header",blocks:freeze([leaf("candidate_name",candidate.name),...candidate.contacts.map(x=>leaf("candidate_contact",x))].filter(x=>x.text))}),freeze({kind:"letter_reference",blocks:freeze([leaf("generated_date",displayGeneratedDate(generatedAt,documentLanguage)),leaf("document_title",text(messages?.applicationDocLetterTitle)),leaf("target_reference",fill(messages?.applicationDocApplyFor,{target:targetRole}))].filter(x=>x.text))}),freeze({kind:"letter_body",blocks:freeze(paragraphs.map(x=>leaf("paragraph",x)))}),freeze({kind:"letter_close",blocks:freeze([leaf("closing",text(messages?.applicationDocClose)),leaf("signature",candidate.name)].filter(x=>x.text))})];
 return coreModel({documentType:"cover_letter",packageRef:text(applicationPackage?.packageRef),language:documentLanguage==="en"?"en":"it",template:"essential",candidate,target:freeze({role:targetRole,opportunityRef:text(opportunityUnderstanding?.opportunityRef)}),generatedAt:text(applicationPackage?.createdAt),sections:freeze(sections),candidateMaterialRefs:freeze(connections.map(x=>text(x?.id)).filter(Boolean))});
}
export function applicationDocumentPlainText(model){if(model?.type!=="application_document_model")throw new Error("APPLICATION_DOCUMENT_MODEL_REQUIRED");const out=[];for(const section of arr(model.sections)){if(text(section.title))out.push(section.title);for(const b of arr(section.blocks))if(text(b?.text))out.push(b.text);for(const e of arr(section.entries)){const heading=[text(e.role),text(e.organisation),text(e.period)].filter(Boolean).join(" · ");if(heading)out.push(heading);for(const d of arr(e.details))out.push(`• ${d}`);}for(const item of arr(section.items))out.push(`• ${item}`);out.push("");}return out.join("\n").replace(/\n{3,}/g,"\n\n").trim();}
export function applicationDocumentClaims(model){if(model?.type!=="application_document_model")throw new Error("APPLICATION_DOCUMENT_MODEL_REQUIRED");const claims=[];for(const section of arr(model.sections)){for(const b of arr(section.blocks))if(["paragraph","closing","signature","target_reference"].includes(b?.kind)&&text(b?.text))claims.push(b.text);for(const e of arr(section.entries)){for(const d of arr(e.details))if(text(d))claims.push(text(d));}for(const item of arr(section.items))if(text(item))claims.push(text(item));}return freeze([...new Set(claims)]);}
export function sanitizeApplicationFilenamePart(value){return text(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9._-]+/g,"_").replace(/_+/g,"_").replace(/^[_\-.]+|[_\-.]+$/g,"").slice(0,72);}
export function applicationArtifactFilename({documentModel,format="pdf"}={}){if(documentModel?.type!=="application_document_model")throw new Error("APPLICATION_DOCUMENT_MODEL_REQUIRED");const ext=format==="docx"?"docx":"pdf",name=sanitizeApplicationFilenamePart(documentModel.candidate?.name),target=sanitizeApplicationFilenamePart(documentModel.target?.role),kind=documentModel.documentType==="cover_letter"?"Cover_Letter":"CV";return [name,kind,target].filter(Boolean).join("_")+`.`+ext;}
export function applicationArtifactIsCurrent({applicationArtifacts,groundedApplicationPackage}={}){const packageRef=text(groundedApplicationPackage?.packageRef);if(!packageRef||text(applicationArtifacts?.packageRef)!==packageRef)return false;return [applicationArtifacts?.targetedCv?.documentModel,applicationArtifacts?.coverLetter?.documentModel].every(m=>m?.type==="application_document_model"&&text(m.packageRef)===packageRef);}
