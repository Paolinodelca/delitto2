import assert from 'assert';
import { runCandidateProfileParser } from '../src/parser/runCandidateProfileParser.js';
import { runJobFitAnalysis } from '../src/parser/runJobFitAnalysis.js';

const candidateModel=async()=>JSON.stringify({candidateProfile:{summary:'Senior Process Engineer',experienceSignals:{leadershipExposure:'limited'},careerSignals:{peopleLeadership:'none'},riskAreas:['assenza di esperienza di gestione diretta del personale','rischio operativo da approfondire'],ambiguities:[]}});
const candidate=await runCandidateProfileParser({cvText:'Senior Process Engineer. Nel progetto descritto non avevo responsabilità gerarchica diretta sulle persone coinvolte, ma coordinavo tecnicamente il progetto.',modelAdapter:candidateModel});
assert.equal(candidate.parsed.candidateProfile.experienceSignals.leadershipExposure,'unclear');
assert.equal(candidate.parsed.candidateProfile.careerSignals.peopleLeadership,'unclear');
assert(!candidate.parsed.candidateProfile.riskAreas.some(x=>/gestione diretta/i.test(x)));
assert(candidate.parsed.candidateProfile.riskAreas.some(x=>/rischio operativo/i.test(x)));

const role={roleProfile:{requirements:{mustHave:['manufacturing experience','team leadership','continuous improvement'],preferred:[],bonus:[]},skills:{technical:[],tools:[],methodologies:['Lean','Six Sigma'],soft:[],languages:[]}}};
const fitModel=async()=>JSON.stringify({jobFitAnalysis:{fitSummary:{},dimensionScores:{},matches:[],gaps:[{dimension:'technical_fit',roleItem:'Six Sigma',gapType:'missing',severity:'medium',recoverability:'easy_to_learn',explanation:'assente'},{dimension:'responsibility_fit',roleItem:'team leadership',gapType:'weak_signal',severity:'high',recoverability:'interview_clarifiable',explanation:'da chiarire'}],ambiguities:[],transferableStrengths:[],strongSignals:[],weakSignals:['nessuna certificazione Six Sigma','leadership da chiarire'],matchedSkills:[],missingSkills:['Six Sigma'],questionFocusAreas:[],interviewFocus:[],followupTriggers:[],cvImprovementHints:['Valutare una certificazione Six Sigma se utile al posizionamento.'],reportHighlights:{strengths:[],risks:['mancanza di certificazione Six Sigma','leadership da approfondire']}}});
const fit=await runJobFitAnalysis({candidateProfile:candidate.parsed,roleProfile:role,modelAdapter:fitModel});
assert(!fit.parsed.jobFitAnalysis.gaps.some(x=>/six sigma/i.test(x.roleItem)));
assert(!fit.parsed.jobFitAnalysis.missingSkills.some(x=>/six sigma/i.test(x)));
assert(!fit.parsed.jobFitAnalysis.weakSignals.some(x=>/six sigma/i.test(x)));
assert(!fit.parsed.jobFitAnalysis.reportHighlights.risks.some(x=>/six sigma/i.test(x)));
assert(!fit.parsed.jobFitAnalysis.gaps.some(x=>/team leadership/i.test(x.roleItem)));
assert(fit.parsed.jobFitAnalysis.questionFocusAreas.some(x=>/team leadership/i.test(x)));
assert(fit.parsed.jobFitAnalysis.interviewFocus.some(x=>/team leadership/i.test(x.topic)&&x.focusType==='clarify_ambiguity'));
assert(fit.parsed.jobFitAnalysis.cvImprovementHints.some(x=>/six sigma/i.test(x)));
console.log('FHT-03 corrective deterministic semantic enforcement PASSED');
