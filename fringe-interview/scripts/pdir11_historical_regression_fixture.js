import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {buildEvidence}=require('../src/core/evidence/buildEvidence');

export const live='Da circa due anni coordino stabilmente una decina di operatori nel reparto produttivo. Mi occupo di definire le priorità e distribuire le attività giornaliere, organizzo i turni e partecipo insieme al mio responsabile alle valutazioni periodiche delle persone.';
export const exactFallback='partecipo insieme al mio responsabile alle valutazioni periodiche delle persone';
export const kinds=['work_assignment_or_priority_setting','workload_shift_or_schedule_coordination','performance_follow_up_or_feedback'];

export function evidence(text=live,ref='runtime:pdir11-historical-realignment'){
  return buildEvidence({sourceType:'runtime_answer',sourceRef:ref,content:{answerText:text},provenance:{capturedAt:'2026-09-11T22:00:00.000Z'},metadata:{version:'1.0'}});
}

export function candidate({kindCount=3,mutatedLast=true}={}){
  const selectedKinds=kinds.slice(0,kindCount);
  const supports=[
    'definire le priorità e distribuire le attività giornaliere',
    'organizzo i turni',
    mutatedLast?'partecipò insieme al mio responsabile alle valutazioni periodiche delle persone':exactFallback
  ].slice(0,kindCount);
  return {
    interpretationStatus:'SUPPORTED',
    responsibilityPresence:'supported',
    continuity:'continuing',
    responsibilityMode:'informal_operational',
    responsibilityKinds:selectedKinds,
    peopleScope:{kind:'category',value:'una decina di operatori',min:null,max:null},
    professionalContext:{description:'reparto produttivo',current:true},
    eventTime:{description:'Da circa due anni'},
    support:{
      presence:'coordino stabilmente una decina di operatori',
      continuity:'Da circa due anni',
      mode:'coordino stabilmente',
      peopleScope:'una decina di operatori',
      professionalContext:'reparto produttivo',
      responsibilityKinds:supports
    },
    limitations:['formal reporting authority not established']
  };
}

export function selectionRepair(entries){
  return {selections:entries};
}

export function repairPayloadFromArgs(args){
  const line=String(args?.userText||'').split('\n').find(value=>value.startsWith('{"validatedCandidate"'));
  return line?JSON.parse(line):null;
}

export function selectionForExactExcerpt(args,field='responsibilityKinds[2]',excerpt=exactFallback){
  const payload=repairPayloadFromArgs(args);
  const entry=payload?.unresolvedSelectionMap?.find(item=>item.field===field);
  const candidate=entry?.candidates?.find(item=>item.excerpt===excerpt);
  return {field,candidateId:candidate?.candidateId||''};
}

export function fallbackSelection(args,field='responsibilityKinds[2]',excerpt=exactFallback){
  return selectionRepair([selectionForExactExcerpt(args,field,excerpt)]);
}

export function assertCanonicalFinal(result,{kindCount=3}={}){
  assert.equal(result.supported,true);
  assert.equal(result.candidate.support.presence,'coordino stabilmente una decina di operatori');
  assert.equal(result.candidate.support.continuity,'Da circa due anni');
  assert.equal(result.candidate.support.mode,'coordino stabilmente');
  assert.equal(result.candidate.support.peopleScope,'una decina di operatori');
  assert.equal(result.candidate.support.professionalContext,'reparto produttivo');
  assert.equal(result.candidate.eventTime.description,'Da circa due anni');
  assert.equal(result.candidate.support.responsibilityKinds.length,kindCount);
  if(kindCount>=1)assert.equal(result.candidate.support.responsibilityKinds[0],'definire le priorità e distribuire le attività giornaliere');
  if(kindCount>=2)assert.equal(result.candidate.support.responsibilityKinds[1],'organizzo i turni');
  if(kindCount>=3)assert.equal(result.candidate.support.responsibilityKinds[2],exactFallback);
}

export function structuredError(){
  return Object.assign(new Error('structured'),{providerDiagnostic:{failureKind:'structured_output_rejected'}});
}
