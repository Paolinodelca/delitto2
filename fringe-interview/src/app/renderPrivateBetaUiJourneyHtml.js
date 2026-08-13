import { loadPrivateBetaUiMessages } from "../i18n/loadPrivateBetaUiMessages.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
}

export function renderPrivateBetaUiJourneyHtml({ locale = "it", result = null } = {}) {
  const m = loadPrivateBetaUiMessages(locale);
  const resultJson = result ? escapeHtml(JSON.stringify(result, null, 2)) : "";
  const resultBlock = result ? `<section><h2>${escapeHtml(m.resultTitle)}</h2><pre id="beta-result">${resultJson}</pre></section>` : "";
  return `<!doctype html>
<html lang="${escapeHtml(locale)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(m.title)}</title>
<style>body{font-family:Arial,sans-serif;max-width:880px;margin:0 auto;padding:24px;background:#f5f7fb;color:#1f2937}section{background:white;border:1px solid #d9e1ea;border-radius:12px;padding:18px;margin:14px 0}label{display:block;font-weight:700;margin:10px 0 5px}input,textarea,select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #b9c4d0;border-radius:8px}button{padding:11px 16px;font-weight:700}small{color:#596579}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style></head>
<body>
<h1>${escapeHtml(m.title)}</h1><p>${escapeHtml(m.intro)}</p>
<form method="post" action="/private-beta/journey" id="private-beta-form">
<section><h2>${escapeHtml(m.onboardingTitle)}</h2>
<label>${escapeHtml(m.identityLabel)}</label><select name="identityAction"><option value="create">${escapeHtml(m.identityCreate)}</option><option value="recover">${escapeHtml(m.identityRecover)}</option></select>
<label>${escapeHtml(m.modeLabel)}</label><select name="workingMode"><option value="independent">${escapeHtml(m.modeIndependent)}</option><option value="with_tutor">${escapeHtml(m.modeTutor)}</option></select>
<label>${escapeHtml(m.goalLabel)}</label><input value="${escapeHtml(m.goalInterview)}" disabled></section>
<section><h2>${escapeHtml(m.consentTitle)}</h2><select name="consentDecision" id="consentDecision"><option value="accept">${escapeHtml(m.consentAccept)}</option><option value="refuse">${escapeHtml(m.consentRefuse)}</option></select></section>
<section id="materialsSection"><h2>${escapeHtml(m.materialsTitle)}</h2>
<label>${escapeHtml(m.targetRole)}</label><input name="targetRole">
<label>${escapeHtml(m.cv)}</label><textarea name="cvText" rows="8"></textarea>
<label>${escapeHtml(m.jd)}</label><textarea name="jdText" rows="6"></textarea></section>
<section id="interviewSection"><h2>${escapeHtml(m.interviewTitle)}</h2><small>${escapeHtml(m.answersHelp)}</small><label>${escapeHtml(m.answers)}</label><textarea name="answers" rows="12"></textarea></section>
<section id="feedbackSection"><h2>${escapeHtml(m.feedbackTitle)}</h2><label>${escapeHtml(m.feedbackAction)}</label><select name="feedbackAction"><option value="skip">${escapeHtml(m.feedbackSkip)}</option><option value="submit">${escapeHtml(m.feedbackSubmit)}</option></select><label>${escapeHtml(m.comment)}</label><textarea name="feedbackComment" rows="3"></textarea></section>
<input type="hidden" name="uiLocale" value="${escapeHtml(locale)}"><input type="hidden" name="sessionLocale" value="${escapeHtml(locale)}"><button type="submit">${escapeHtml(m.start)}</button>
</form>${resultBlock}
<script>
(() => {
  const consent = document.getElementById('consentDecision');
  const gated = ['materialsSection','interviewSection','feedbackSection'].map(id => document.getElementById(id));
  function sync(){ const allowed = consent.value === 'accept'; gated.forEach(el => { el.hidden = !allowed; el.querySelectorAll('input,textarea,select').forEach(field => { field.disabled = !allowed; }); }); }
  consent.addEventListener('change', sync); sync();
})();
</script>
</body></html>`;
}
export default renderPrivateBetaUiJourneyHtml;
