import assert from 'assert';
import { readFile } from 'fs/promises';
import { createCandidateProfilePrompt, createJobFitAnalysisPrompt } from '../src/parser/index.js';
import { buildRepresentationValueProofProjection } from '../src/app/buildRepresentationValueProofProjection.js';

const candidatePrompt=await createCandidateProfilePrompt({cvText:'Senior Process Engineer. Coordinamento tecnico cross-funzionale. Nel progetto descritto nessuna responsabilità gerarchica diretta.'});
assert(candidatePrompt.modelInput.system.includes('bounded evidence about that context'));
assert(candidatePrompt.modelInput.system.includes('Do not generalize absence of a responsibility in one project'));

const role={roleProfile:{title:'Operations Manager',requirements:{mustHave:['manufacturing experience','leadership capability','continuous improvement'],preferred:[],bonus:[]},skills:{technical:[],tools:[],methodologies:['lean manufacturing','six sigma','continuous improvement'],soft:[],languages:[]}}};
const candidate={candidateProfile:{summary:'Senior Process Engineer',experienceSignals:{leadershipExposure:'unclear'},careerSignals:{peopleLeadership:'unclear'},ambiguities:['Direct people leadership not established beyond the described project.']}};
const fitPrompt=await createJobFitAnalysisPrompt({candidateProfile:candidate,roleProfile:role});
assert(fitPrompt.modelInput.system.includes('appears only under roleProfile.skills is contextual role knowledge'));
assert(fitPrompt.modelInput.system.includes('may still be used in cvImprovementHints'));

const report={professionalPerception:{perceptionV2:{targetDistance:{bridgeNarrative:'La leadership resta da caratterizzare.'}},underVisibleSignals:[{label:'Leadership gerarchica diretta'}],perceptionGap:[{area:'Leadership gerarchica diretta',narrative:'Questo elemento non va letto necessariamente come assente, ma oggi non emerge con sufficiente forza rispetto al ruolo target.'}]}};
const projection=buildRepresentationValueProofProjection({professionalPerceptionReport:report,targetRole:'Operations Manager'});
const target=projection.claims.find(x=>x.id==='target_relation');
assert(target);
assert(target.supportingEvidence.some(x=>x.summary==='Leadership gerarchica diretta'));
assert(!target.supportingEvidence.some(x=>/^Questo elemento/i.test(x.summary)));

const generic=await readFile('src/report/narrativeData/proReport/generic_professional.json','utf8');
assert(generic.includes('{{area}} non va letto necessariamente come assente'));
assert(!generic.includes('"riskPerceptionGapNarrative": "Questo elemento'));
console.log('FHT-03 semantic integrity regression tests PASSED');
