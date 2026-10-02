import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runRoleProfileParser } from '../src/parser/runRoleProfileParser.js';
import buildProReportV2 from '../src/report/buildProReportV2.js';

const fixture=JSON.parse(fs.readFileSync(new URL('../fixtures/expected_role_profile_01.json',import.meta.url),'utf8'));
const controlledJd=`Operations Manager\nResponsabile del coordinamento delle operations di stabilimento e del raggiungimento degli obiettivi operativi.\n- monitorare KPI, performance, efficienza e qualità dei processi;\n- identificare criticità operative e guidare iniziative di miglioramento;\n- contribuire alla definizione e all'implementazione di iniziative di continuous improvement.`;

function roleModel(requirements){
  return async()=>JSON.stringify({
    roleProfile:{
      ...structuredClone(fixture.roleProfile),
      title:'Operations Manager',
      requirements:{mustHave:requirements,preferred:[],bonus:[]},
      skills:{...structuredClone(fixture.roleProfile.skills),methodologies:['Lean','Six Sigma','continuous improvement']}
    }
  });
}

const inferred=await runRoleProfileParser({
  jdText:controlledJd,
  modelAdapter:roleModel(['continuous improvement','Lean/Six Sigma'])
});
assert.deepEqual(inferred.parsed.roleProfile.requirements.mustHave,['continuous improvement']);
assert(inferred.parsed.roleProfile.skills.methodologies.includes('Lean'));
assert(inferred.parsed.roleProfile.skills.methodologies.includes('Six Sigma'));

const explicitJd=`${controlledJd}\nRequisito: esperienza con Lean e Six Sigma.`;
const explicit=await runRoleProfileParser({
  jdText:explicitJd,
  modelAdapter:roleModel(['continuous improvement','Lean/Six Sigma'])
});
assert(explicit.parsed.roleProfile.requirements.mustHave.includes('Lean/Six Sigma'));

function reportFor({roleProfile,targetSourceText,risks=[]}){
  return buildProReportV2({
    candidate:{candidateProfile:{}},
    role:{roleProfile},
    fit:{jobFitAnalysis:{}},
    finalCandidateReport:{
      overall:{roleTitle:'Operations Manager',metrics:{}},
      roleFit:{risks,missingSkills:[],strengths:[],matchedSkills:[],transferableStrengths:[],clarificationsNeeded:[]},
      cvAdvice:{risks:[],missingSkills:[],strengths:[],matchedSkills:[],transferableStrengths:[],clarificationsNeeded:[],positioningHints:[],cvRewritePriorities:[]},
      questionQuality:{},runtimeRead:{}
    },
    rawInput:{targetRole:'Operations Manager',targetSourceText},
    roleFamily:'generic_professional'
  }).proReportV2;
}

const unsupportedRisk='Gap su metodologie Lean/Six Sigma.';
const unsupportedReport=reportFor({
  roleProfile:inferred.parsed.roleProfile,
  targetSourceText:controlledJd,
  risks:[unsupportedRisk]
});
assert(!JSON.stringify(unsupportedReport.professionalPerception.perceptionV2.targetDistance).includes('Lean/Six Sigma'));

// Defense in depth: even a contaminated RoleProfile cannot authorize the legacy gap
// when the actual supplied target source does not ground it.
const contaminatedRole={...structuredClone(inferred.parsed.roleProfile),requirements:{mustHave:['continuous improvement','Lean/Six Sigma'],preferred:[],bonus:[]}};
const defendedReport=reportFor({roleProfile:contaminatedRole,targetSourceText:controlledJd,risks:[unsupportedRisk]});
assert(!JSON.stringify(defendedReport.professionalPerception.perceptionV2.targetDistance).includes('Lean/Six Sigma'));

const authorizedReport=reportFor({roleProfile:explicit.parsed.roleProfile,targetSourceText:explicitJd,risks:[unsupportedRisk]});
assert(JSON.stringify(authorizedReport.professionalPerception.perceptionV2.targetDistance).includes('Lean/Six Sigma'));

const uncertaintyOnly=reportFor({
  roleProfile:inferred.parsed.roleProfile,
  targetSourceText:controlledJd,
  risks:['Capacity planning da chiarire']
});
assert(!JSON.stringify(uncertaintyOnly.professionalPerception.perceptionV2.targetDistance).includes('Capacity planning'));

console.log('FHT-DR02 target authority source enforcement PASSED');
