const { buildMeasurementDimensionMapping } = require("./buildMeasurementDimensionMapping");
const { validateMeasurementDimensionMapping } = require("./validateMeasurementDimensionMapping");
const { mapMeasurementResultToDimensionContributions } = require("./mapMeasurementResultToDimensionContributions");
const { buildMeasurementResult, validateMeasurementResult } = require("../observation");
const { validateDimensionContribution } = require("./validateDimensionContribution");
function healthMeasurementDimensionMapping(){
  try {
    const at="2026-07-23T10:00:00.000Z";
    const result=buildMeasurementResult({id:"health_result",measurementId:"health_measurement",characteristicId:"health_signal",observationRefs:[{type:"observation",id:"health_observation"}],normalizedValue:0.8,direction:"positive",confidence:0.75,coverage:0.6,evidenceQuality:0.8,sourceReliability:0.9,independence:1,consistency:0.9,status:"calculated",calculatedAt:at,calculatedBy:"health"});
    if(!validateMeasurementResult(result).valid) throw new Error("MeasurementResult invalid.");
    const mapping=buildMeasurementDimensionMapping({id:"health_mapping",measurementId:"health_measurement",targets:[{dimensionId:"ownership",contributionType:"supporting",weight:0.5}],metadata:{createdAt:at,updatedAt:at}},{now:at});
    if(!validateMeasurementDimensionMapping(mapping).valid) throw new Error("Mapping invalid.");
    const contributions=mapMeasurementResultToDimensionContributions(result,mapping);
    if(contributions.length!==1||!validateDimensionContribution(contributions[0]).valid) throw new Error("Contribution pipeline invalid.");
    if(contributions[0].contributionValue!==0.4||contributions[0].confidence!==0.75) throw new Error("Mapping values invalid.");
    return {ok:true};
  } catch(error){return {ok:false,error:error.message};}
}
module.exports={healthMeasurementDimensionMapping};
