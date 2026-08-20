import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { deriveAnswerAnnotationProviderSchema } from "../src/interview/deriveAnswerAnnotationProviderSchema.js";
import { DEFAULT_GROQ_MODEL, resolveGroqOutputContract } from "../src/infrastructure/groq/groqModelCompatibility.js";
import { normalizeAnswerAnnotation } from "../src/interview/normalizeAnswerAnnotation.js";
import { buildAnswerAnnotationPrompt } from "../src/interview/buildAnswerAnnotationPrompt.js";
const text=await readFile(new URL("../config/answer_annotation_schema.json",import.meta.url),"utf8"), canonical=JSON.parse(text), provider=deriveAnswerAnnotationProviderSchema(canonical);
const ca=canonical.properties.answerAnnotation.properties.annotations.items, pa=provider.properties.answerAnnotation.properties.annotations.items;
for(const f of ["start","end"]){assert.ok(ca.required.includes(f));assert.equal(pa.required.includes(f),false);assert.equal(f in pa.properties,false)}
for(const f of ["annotationId","type","dimension","label","reason","excerpt"]){assert.ok(pa.required.includes(f));assert.deepEqual(pa.properties[f],ca.properties[f])}
assert.equal(resolveGroqOutputContract({task:"answerAnnotation",model:DEFAULT_GROQ_MODEL,jsonSchema:provider,strictSchemaCompatible:true}).mode,"json_schema");
const pr=(await buildAnswerAnnotationPrompt({answerId:"x",questionLabel:"Q",questionPrompt:"P",answerText:"A distinctive passage with surrounding context.",nativeSchemaEnforced:true})).answerAnnotationPrompt; assert.ok((pr.systemPrompt+pr.userPrompt).includes("do not calculate character offsets"));
function raw(answerText,annotations){return {answerAnnotation:{answerId:"a",questionLabel:"Q",questionPrompt:"P",answerText,reviewMode:"interview",summary:{overallBand:"medium",oneLineDiagnosis:"D",topStrength:"S",topImprovementArea:"I"},tags:[],annotations,strengths:[{title:"S",explanation:"Concrete contribution"}],weaknesses:[{title:"I",explanation:"Add detail"}],coachTip:{title:"T",message:"Add detail"},upgradeSuggestion:{goal:"G",instruction:"Do it"},improvedAnswerDraft:{isProvided:false,text:""}}}}
function ann(id,excerpt,type="strength",dimension="specificity"){return {annotationId:id,type,dimension,label:"Label "+id,reason:"Detailed reason for "+id,excerpt}}
let a="Alpha context. Beta contribution with detail."; let n=normalizeAnswerAnnotation(raw(a,[ann("u","Beta contribution")])).answerAnnotation.annotations; assert.equal(n.length,1);assert.equal(a.slice(n[0].start,n[0].end),n[0].excerpt);
a="😀 Alpha contribution with additional surrounding context."; n=normalizeAnswerAnnotation(raw(a,[ann("utf","Alpha contribution")])).answerAnnotation.annotations;assert.equal(n[0].start,3);assert.equal(a.slice(n[0].start,n[0].end),n[0].excerpt);
a="same useful passage and same useful passage again";assert.equal(normalizeAnswerAnnotation(raw(a,[ann("r","same useful passage")])).answerAnnotation.annotations.length,0);
assert.equal(normalizeAnswerAnnotation(raw("Only authoritative text with context.",[ann("m","invented excerpt")])).answerAnnotation.annotations.length,0);
a="A concrete contribution with evidence and ownership.";n=normalizeAnswerAnnotation(raw(a,[ann("s","concrete contribution with evidence","strength","evidence"),ann("w","contribution with evidence and ownership","weakness","ownership")])).answerAnnotation.annotations;assert.equal(n.length,1);assert.equal(n[0].annotationId,"w");
for(const f of ["annotationId","type","dimension","label","reason","start","end","excerpt"])assert.ok(f in n[0]);
console.log("GM-01D deterministic Answer Annotation span-resolution tests passed.");
