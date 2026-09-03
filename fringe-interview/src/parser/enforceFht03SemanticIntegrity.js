function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function norm(value) {
  return clean(value)
    .toLocaleLowerCase("en")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const STOP = new Set(["a","ad","al","alla","and","as","con","da","de","del","della","di","e","ed","for","il","in","la","le","of","or","per","the","to","un","una","with"]);
function tokens(value) {
  return new Set(norm(value).split(/\s+/).filter(x => x.length > 2 && !STOP.has(x)));
}
function overlap(a, b) {
  const aa=tokens(a), bb=tokens(b);
  if (!aa.size || !bb.size) return 0;
  let common=0; for (const x of aa) if (bb.has(x)) common++;
  return common / Math.min(aa.size, bb.size);
}
function semanticallyMatches(a,b) {
  const na=norm(a), nb=norm(b);
  return Boolean(na && nb && (na===nb || na.includes(nb) || nb.includes(na) || overlap(a,b)>=0.6));
}

function hasBoundedNoDirectLeadershipEvidence(sourceText) {
  const text=norm(sourceText);
  const noDirect=/(non|nessun|senza|no|not|without).{0,45}(responsabilit|responsibility|report|riport|gerarch|hierarch|people management|gestione diretta)/.test(text);
  const bounded=/(progett|project|episod|esperienz|experience|descrit|described|in quel|in that|nello specific|specific context|contesto)/.test(text);
  return noDirect && bounded;
}
function leadershipRisk(value) {
  const text=norm(value);
  const leadership=/(leadership|gestione|management|personale|people|team|gerarch|hierarch|direct report)/.test(text);
  const absence=/(assen|manc|nessun|none|no |not |without|limited|limit|weak|insufficient)/.test(text);
  return leadership && absence;
}

function hasIndependentGlobalPeopleLeadershipEvidence(sourceText) {
  const text=norm(sourceText);
  return [
    /(?:gestisc|gestit|managed|manages|managing).{0,35}(?:team|person|people|staff|collaborator)/,
    /(?:team|person|people|staff|collaborator).{0,35}(?:gestisc|gestit|managed|manages|managing)/,
    /(?:direct reports?|riporti diretti).{0,20}(?:[1-9][0-9]*|uno|due|tre|quattro|cinque|sei|sette|otto|nove|dieci)/,
    /(?:[1-9][0-9]*|uno|due|tre|quattro|cinque|sei|sette|otto|nove|dieci).{0,20}(?:direct reports?|riporti diretti)/,
    /(?:people manager|line manager|responsabile gerarchico).{0,35}(?:team|person|people|staff|collaborator)/
  ].some(pattern=>pattern.test(text));
}

export function enforceCandidateProfileSemanticIntegrity({ result, sourceText = "" }) {
  if (!result?.candidateProfile || !hasBoundedNoDirectLeadershipEvidence(sourceText)) return result;
  const cp=result.candidateProfile;
  const career=cp.careerSignals;
  const experience=cp.experienceSignals;
  const hasGlobalPeopleLeadershipAuthority=hasIndependentGlobalPeopleLeadershipEvidence(sourceText);
  if (career && !hasGlobalPeopleLeadershipAuthority && ["none","weak","limited"].includes(norm(career.peopleLeadership))) career.peopleLeadership="unclear";
  if (experience && ["none","limited"].includes(norm(experience.leadershipExposure))) experience.leadershipExposure="unclear";
  if (Array.isArray(cp.riskAreas)) cp.riskAreas=cp.riskAreas.filter(x=>!leadershipRisk(x));
  if (Array.isArray(cp.ambiguities)) {
    const note="Direct people leadership is not established beyond the scope of the described context.";
    if (!cp.ambiguities.some(x=>semanticallyMatches(x,note))) cp.ambiguities.push(note);
  }
  return result;
}

function requirementItems(roleProfile) {
  const r=roleProfile?.requirements || {};
  return [r.mustHave,r.preferred,r.bonus].flatMap(x=>Array.isArray(x)?x:[]).filter(x=>clean(x));
}
function hasRequirementAuthority(item, requirements) {
  return requirements.some(req=>semanticallyMatches(item,req));
}

function collectUnclearCandidateSignals(candidateProfile) {
  if (!candidateProfile || typeof candidateProfile !== "object") return [];
  const signals=[];
  const visit=(value,path=[])=>{
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    for (const [key,child] of Object.entries(value)) {
      const next=[...path,key];
      if (typeof child === "string" && norm(child)==="unclear") {
        signals.push(key.replace(/([a-z])([A-Z])/g,"$1 $2"));
      } else if (child && typeof child === "object" && !Array.isArray(child)) {
        visit(child,next);
      }
    }
  };
  visit(candidateProfile);
  return signals;
}
function matchesAny(text, items) {
  return items.some(item=>semanticallyMatches(text,item) || overlap(text,item)>=0.5);
}
function ensureClarification(fit, requirement) {
  const ambiguity=`Evidence for ${requirement} is not established and requires clarification.`;
  if (Array.isArray(fit.ambiguities) && !fit.ambiguities.some(x=>semanticallyMatches(x,requirement))) fit.ambiguities.push(ambiguity);
  if (Array.isArray(fit.questionFocusAreas) && !fit.questionFocusAreas.some(x=>semanticallyMatches(x,requirement))) fit.questionFocusAreas.push(requirement);
  if (Array.isArray(fit.interviewFocus) && !fit.interviewFocus.some(x=>semanticallyMatches(x?.topic,requirement))) {
    fit.interviewFocus.push({priority:"high",focusType:"clarify_ambiguity",topic:requirement,reason:`Candidate evidence for ${requirement} is unclear.`});
  }
}

export function enforceJobFitSemanticIntegrity({ result, roleProfile, candidateProfile }) {
  const fit=result?.jobFitAnalysis;
  if (!fit || !roleProfile) return result;
  const requirements=requirementItems(roleProfile);
  const unclearSignals=collectUnclearCandidateSignals(candidateProfile?.candidateProfile || candidateProfile);
  const unclearRequirements=requirements.filter(req=>matchesAny(req,unclearSignals));

  // FHT-03: factual/gap-oriented output needs positive target authority.
  // LLM-generated text is not authority merely because it resembles a plausible role concern.
  if (Array.isArray(fit.gaps)) {
    fit.gaps=fit.gaps.filter(gap=>{
      const req=requirements.find(x=>semanticallyMatches(gap?.roleItem,x));
      if (!req) return false;
      if (matchesAny(req,unclearRequirements)) {
        ensureClarification(fit,req);
        return false;
      }
      return true;
    });
  }
  const factualAllowed=item=>hasRequirementAuthority(item,requirements) && !matchesAny(item,unclearRequirements);
  if (Array.isArray(fit.missingSkills)) fit.missingSkills=fit.missingSkills.filter(factualAllowed);
  if (Array.isArray(fit.weakSignals)) fit.weakSignals=fit.weakSignals.filter(factualAllowed);
  const risks=fit.reportHighlights?.risks;
  if (Array.isArray(risks)) fit.reportHighlights.risks=risks.filter(factualAllowed);

  for (const req of unclearRequirements) ensureClarification(fit,req);

  // FHT-03 third corrective: shortRationale is generated before deterministic
  // enforcement and can retain claims that have just been removed from the
  // authoritative structured state. There is no canonical deterministic
  // natural-language authority available here to prove every clause safe.
  // Fail closed at this narrow JobFit boundary instead of leaking stale prose
  // downstream or introducing another interpretation/generation pass.
  if (fit.fitSummary && typeof fit.fitSummary === "object") {
    fit.fitSummary.shortRationale = "";
  }

  return result;
}
