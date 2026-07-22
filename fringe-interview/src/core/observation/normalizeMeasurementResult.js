const {buildMeasurementResult}=require('./buildMeasurementResult');
const {validateMeasurement}=require('./validateMeasurement');
const {validateObservation}=require('./validateObservation');
const DIRECTION={positive:1,negative:-1,neutral:0,mixed:0};
const DEFAULTS={expectedIndependentSignals:3,neutralThreshold:0.1};
function round(v){return Math.round(v*10000)/10000}
function key(o){return o.independenceGroup||[o.sourceRef?.type,o.sourceRef?.id,o.locationRef?.type,o.locationRef?.id,o.characteristicId,o.signalType,o.evidenceFingerprint].map(x=>x||"").join("|")}
function normalizeMeasurementResult({measurement,observations=[],characteristicId,normalizationContext={}}={}){
 const mv=validateMeasurement(measurement);if(!mv.valid)throw new Error(`Invalid Measurement: ${mv.errors.join(' ')}`);
 const matching=observations.filter(o=>o&&o.measurementId===measurement.id&&o.characteristicId===characteristicId);
 matching.forEach(o=>{const v=validateObservation(o);if(!v.valid)throw new Error(`Invalid Observation ${o?.id||''}: ${v.errors.join(' ')}`)});
 const observed=matching.filter(o=>o.observationStatus==='observed');
 const groups=new Map();for(const o of observed){const k=key(o);const weight=o.confidence*o.evidenceQuality*o.sourceReliability;const prev=groups.get(k);if(!prev||weight>prev.weight)groups.set(k,{o,weight});}
 const unique=[...groups.values()];const refs=matching.map(o=>({type:'observation',id:o.id}));
 if(unique.length===0)return buildMeasurementResult({measurementId:measurement.id,characteristicId,observationRefs:refs,status:'insufficient_data',normalizedValue:null,direction:null,confidence:0,coverage:0,evidenceQuality:0,sourceReliability:0,independence:matching.length?0:1,consistency:0,calculatedBy:'deterministic_baseline_v1'});
 let weighted=0,total=0;for(const {o,weight} of unique){const score=DIRECTION[o.direction]*o.strength;weighted+=score*(weight||1);total+=(weight||1)}
 const value=round(weighted/total);const abs=Math.abs(value);const threshold=normalizationContext.neutralThreshold??DEFAULTS.neutralThreshold;const direction=abs<=threshold?'neutral':value>0?'positive':'negative';
 const avg=(field)=>round(unique.reduce((s,x)=>s+x.o[field],0)/unique.length);const expected=Math.max(1,normalizationContext.expectedIndependentSignals??DEFAULTS.expectedIndependentSignals);const coverage=round(Math.min(1,unique.length/expected));const independence=round(observed.length?unique.length/observed.length:1);const confidence=round(avg('confidence')*avg('evidenceQuality')*(0.5+0.5*coverage));const scores=unique.map(x=>DIRECTION[x.o.direction]*x.o.strength);const mean=scores.reduce((a,b)=>a+b,0)/scores.length;const variance=scores.reduce((s,x)=>s+(x-mean)**2,0)/scores.length;const consistency=round(Math.max(0,1-Math.sqrt(variance)));
 return buildMeasurementResult({measurementId:measurement.id,characteristicId,observationRefs:refs,normalizedValue:value,direction,confidence,coverage,evidenceQuality:avg('evidenceQuality'),sourceReliability:avg('sourceReliability'),independence,consistency,status:'calculated',calculatedBy:'deterministic_baseline_v1'});
}
module.exports={normalizeMeasurementResult,MEASUREMENT_NORMALIZATION_DEFAULTS:DEFAULTS};
