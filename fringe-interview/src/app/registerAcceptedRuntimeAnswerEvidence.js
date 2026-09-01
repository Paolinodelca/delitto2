import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { buildEvidenceStore, validateEvidenceStore } = require('../core/evidence/index.js');

const clean = value => typeof value === 'string' ? value.trim() : '';
const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

function questionIdentity(answerRecord = {}, answerIndex = 0) {
  const context = answerRecord.questionContext && typeof answerRecord.questionContext === 'object'
    ? answerRecord.questionContext : {};
  return clean(context.questionKey) || clean(context.questionText) || `answer_${answerIndex + 1}`;
}

export function buildAcceptedRuntimeAnswerEvidenceStore({
  betaSessionId,
  interviewSessionId,
  answers = [],
  inputBundleVersion = 'ar-02.1',
  knowledgeAcquisitionExecutionRef = null
} = {}) {
  const accepted = Array.isArray(answers) ? answers : [];
  const sources = accepted.map((answerRecord, index) => {
    const questionContext = answerRecord?.questionContext && typeof answerRecord.questionContext === 'object'
      ? answerRecord.questionContext : {};
    return {
      id: `interview_answer:${clean(interviewSessionId) || 'runtime'}:${index + 1}`,
      type: 'interview_runtime_answer',
      sourceRole: 'accepted_runtime_answer',
      label: questionIdentity(answerRecord, index),
      content: {
        answerText: clean(answerRecord?.answerText),
        questionContext: clone(questionContext),
        runtime: {
          stepType: clean(answerRecord?.stepType),
          phaseName: clean(answerRecord?.phaseName),
          answerIndex: index,
          acceptedAt: clean(answerRecord?.timestamp) || null
        },
        provenance: {
          betaSessionRef: clean(betaSessionId) ? `betaSession:${clean(betaSessionId)}` : null,
          interviewSessionRef: clean(interviewSessionId) ? `interviewSession:${clean(interviewSessionId)}` : null,
          questionRef: questionIdentity(answerRecord, index),
          answerRef: `runtimeAnswer:${index + 1}`,
          ...(clean(knowledgeAcquisitionExecutionRef) ? { knowledgeAcquisitionExecutionRef: clean(knowledgeAcquisitionExecutionRef) } : {})
        }
      }
    };
  });
  const store = buildEvidenceStore({ sources, metadata: { version: inputBundleVersion } });
  const validation = validateEvidenceStore(store);
  if (!validation.isValid) {
    const error = new Error(validation.errors.join(' | '));
    error.code = 'INVALID_RUNTIME_ANSWER_EVIDENCE_STORE';
    throw error;
  }
  return store;
}
