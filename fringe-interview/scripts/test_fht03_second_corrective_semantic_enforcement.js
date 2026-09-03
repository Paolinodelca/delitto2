import assert from 'assert';
import { enforceJobFitSemanticIntegrity } from '../src/parser/enforceFht03SemanticIntegrity.js';

const roleProfile={requirements:{mustHave:['manufacturing experience','team leadership','continuous improvement'],preferred:[],bonus:[]},skills:{technical:[],tools:[],methodologies:[],soft:[],languages:[]}};
const candidateProfile={careerSignals:{peopleLeadership:'unclear'},experienceSignals:{leadershipExposure:'unclear'}};
const result={jobFitAnalysis:{
  gaps:[{roleItem:'team leadership',gapType:'missing',explanation:'missing'},{roleItem:'Lean Six Sigma certification',gapType:'missing',explanation:'missing'}],
  ambiguities:[], questionFocusAreas:[], interviewFocus:[], cvImprovementHints:['Consider Lean Six Sigma certification if useful for positioning.'],
  missingSkills:['Lean Six Sigma certification','team leadership'],
  weakSignals:['lack of professional certifications','lack of people leadership'],
  reportHighlights:{risks:['Missing specialist professional certifications','People leadership not demonstrated'],strengths:[]}
}};
enforceJobFitSemanticIntegrity({result,roleProfile,candidateProfile});
const fit=result.jobFitAnalysis;
assert.equal(fit.gaps.length,0);
assert.deepEqual(fit.missingSkills,[]);
assert.deepEqual(fit.weakSignals,[]);
assert.deepEqual(fit.reportHighlights.risks,[]);
assert(fit.cvImprovementHints.some(x=>/six sigma/i.test(x)));
assert(fit.ambiguities.some(x=>/team leadership/i.test(x)));
assert(fit.questionFocusAreas.some(x=>/team leadership/i.test(x)));
assert(fit.interviewFocus.some(x=>/team leadership/i.test(x.topic)&&x.focusType==='clarify_ambiguity'));
console.log('FHT-03 second corrective semantic enforcement PASSED');
