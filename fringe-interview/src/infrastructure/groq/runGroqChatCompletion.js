import { setTimeout as delay } from "timers/promises";
import { GROQ_CHAT_COMPLETIONS_URL, buildGroqRequestBody, resolveGroqModel, resolveGroqTaskCompletionBudget } from "./groqModelCompatibility.js";

function requiredApiKey() {
  const value = process.env.GROQ_API_KEY?.trim();
  if (!value) throw new Error("Groq provider: missing GROQ_API_KEY environment variable.");
  return value;
}
function retryable(status) { return [429, 500, 502, 503, 504].includes(status); }
const MAX_PROVIDER_WAIT_MS = 10000;
export const MAX_DEPENDENT_TOKEN_RESET_WAIT_MS = 65000;
let logicalCallSequence=0;
function boundedWaitMs(value){if(value==null||value==='')return null;const n=Number(value);return Number.isFinite(n)&&n>=0?Math.min(Math.round(n),MAX_PROVIDER_WAIT_MS):null;}
function parseResetMs(value,{maxWaitMs=MAX_PROVIDER_WAIT_MS}={}){
  if(value==null)return null;const s=String(value).trim();if(!s)return null;
  const clamp=(n)=>Number.isFinite(n)&&n>=0?Math.min(Math.round(n),maxWaitMs):null;
  const numeric=Number(s);if(Number.isFinite(numeric)&&numeric>=0)return clamp(numeric*1000);
  let total=0,matched=false;for(const m of s.matchAll(/([0-9]+(?:\.[0-9]+)?)(ms|s|m)/gi)){matched=true;const n=Number(m[1]);total+=m[2].toLowerCase()==='ms'?n:m[2].toLowerCase()==='m'?n*60000:n*1000;}
  return matched?clamp(total):null;
}
function header(response,name){const v=response?.headers?.get?.(name);return v==null?null:String(v).slice(0,80);}
export function projectGroqRateLimitMetadata(response){
 const retryAfter=header(response,'retry-after');
 const remainingTokens=header(response,'x-ratelimit-remaining-tokens');
 const remainingRequests=header(response,'x-ratelimit-remaining-requests');
 const resetTokens=header(response,'x-ratelimit-reset-tokens');
 const resetRequests=header(response,'x-ratelimit-reset-requests');
 const retryAfterMs=parseResetMs(retryAfter),tokenResetMs=parseResetMs(resetTokens,{maxWaitMs:MAX_DEPENDENT_TOKEN_RESET_WAIT_MS}),requestResetMs=parseResetMs(resetRequests);
 const tokenExhausted=remainingTokens!==null&&Number(remainingTokens)<=0;const requestExhausted=remainingRequests!==null&&Number(remainingRequests)<=0;
 const recommendedWaitMs=boundedWaitMs(retryAfterMs??(tokenExhausted?tokenResetMs:null)??(requestExhausted?requestResetMs:null));
 return Object.freeze({retryAfter,remainingTokens,remainingRequests,resetTokens,resetRequests,retryAfterMs,tokenResetMs,requestResetMs,recommendedWaitMs});
}
function emitDiagnostic(sink,record){if(typeof sink==='function')try{sink(Object.freeze(record));}catch{}}


function coarseFailureKind(status, providerMessage = "") {
  const message = providerMessage.toLowerCase();
  if (status === 429) return "rate_limit";
  if (status >= 500) return "provider_unavailable";
  if (status === 400 && /json|schema|structured/.test(message)) return "structured_output_rejected";
  if (status === 400) return "invalid_request";
  if (status === 401 || status === 403) return "provider_auth_or_permission";
  return "provider_request_failed";
}


function redactDiagnosticSecrets(value = "") {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [REDACTED]")
    .replace(/\bgsk_[A-Za-z0-9._\-]+\b/g, "[REDACTED_GROQ_KEY]")
    .replace(/Authorization\s*[:=]\s*[^,;\n]+/gi, "Authorization: [REDACTED]");
}

function boundedDiagnosticText(value, maxLength) {
  let text = "";
  if (typeof value === "string") text = value;
  else if (value != null) {
    try { text = JSON.stringify(value); } catch { text = String(value); }
  }
  text = redactDiagnosticSecrets(text.replace(/\s+/g, " ").trim());
  if (!text) return null;
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function boundedProviderErrorMessage(value) {
  if (typeof value !== "string") return null;
  const normalized = redactDiagnosticSecrets(value.replace(/\s+/g, " ").trim());
  if (!normalized) return null;
  const sentence = normalized.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || normalized;
  return sentence.length > 600 ? `${sentence.slice(0, 600)}…` : sentence;
}
function safeProviderMessage(status, message = "") {
  const normalized = typeof message === "string" ? message.replace(/\s+/g, " ").trim() : "";
  if (!normalized) return null;
  if (/generated json does not match|json.*schema|structured output/i.test(normalized)) return "Provider rejected generated structured output.";
  if (/rate limit|too many requests/i.test(normalized)) return "Provider rate limit reached.";
  if (/model.*(not found|decommissioned|blocked|permission)/i.test(normalized)) return "Provider rejected the configured model or model permission.";
  if (/invalid.*(request|parameter)|unsupported.*parameter/i.test(normalized)) return "Provider rejected request parameters.";
  return status === 400 ? "Provider rejected the request." : "Provider request failed.";
}

export function parseSafeGroqErrorDiagnostic({ rawText = "", status, task, model, retryAfter = null } = {}) {
  let envelope = null;
  try { envelope = JSON.parse(rawText); } catch { /* deliberately discard unstructured body */ }
  const providerError = envelope && typeof envelope.error === "object" ? envelope.error : {};
  const code = typeof providerError.code === "string" || typeof providerError.code === "number" ? String(providerError.code).slice(0, 80) : null;
  const type = typeof providerError.type === "string" ? providerError.type.slice(0, 80) : null;
  const rawMessage = typeof providerError.message === "string" ? providerError.message : "";
  const failedGeneration = Object.prototype.hasOwnProperty.call(providerError, "failed_generation") ? providerError.failed_generation : null;
  return Object.freeze({
    task,
    model,
    status,
    providerCode: code,
    providerType: type,
    providerMessage: safeProviderMessage(status, rawMessage),
    providerErrorMessage: boundedProviderErrorMessage(rawMessage),
    providerFailedGeneration: boundedDiagnosticText(failedGeneration, 1200),
    retryAfter: retryAfter ? String(retryAfter).slice(0, 40) : null,
    failureKind: coarseFailureKind(status, rawMessage)
  });
}

export async function runGroqChatCompletion({ task = "unknown", systemText, userText, temperature = 0.2, maxTokens, maxRetries = 2, retryDelayMs = 1200, jsonSchema = null, strictSchemaCompatible = false, executionDiagnosticSink } = {}) {
  if (!systemText?.trim() || !userText?.trim()) throw new Error("Groq provider: systemText and userText are required.");
  const apiKey = requiredApiKey();
  const model = resolveGroqModel();
  const { body, contract } = buildGroqRequestBody({ task, model, systemText: systemText.trim(), userText: userText.trim(), temperature, maxTokens, jsonSchema, strictSchemaCompatible });
  const logicalCallRef=`groq:${task}:${++logicalCallSequence}`;
  const inputChars=systemText.trim().length+userText.trim().length,inputUtf8Bytes=Buffer.byteLength(systemText.trim(),'utf8')+Buffer.byteLength(userText.trim(),'utf8');
  const completionTokenBudget=resolveGroqTaskCompletionBudget({task,maxTokens});let totalWaitMs=0;const started=Date.now();
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(body) });
    const rawText = await response.text().catch(() => "");const rateLimitMetadata=projectGroqRateLimitMetadata(response);
    if (!response.ok) {
      const diagnostic = parseSafeGroqErrorDiagnostic({ rawText, status: response.status, task, model, retryAfter: rateLimitMetadata.retryAfter });
      const error = new Error(`Groq provider request failed for ${task} with status ${response.status}.`);
      error.status = response.status; error.model = model; error.task = task; error.providerDiagnostic = {...diagnostic,rateLimitMetadata,outputMode:contract.mode,structuredOutput:contract.mode==='json_schema'||contract.mode==='json_object',elapsedMs:Date.now()-started,httpAttemptsUsed:attempt+1};
      if (retryable(response.status) && attempt < maxRetries) {
        const retryAfterSeconds = Number(diagnostic.retryAfter);
        const waitMs = boundedWaitMs((Number.isFinite(retryAfterSeconds)&&retryAfterSeconds>=0?retryAfterSeconds*1000:null)??rateLimitMetadata.recommendedWaitMs??retryDelayMs*(attempt+1));
        totalWaitMs+=waitMs||0;emitDiagnostic(executionDiagnosticSink,{boundary:'groq_model_execution',stage:'retry_wait',task,model,logicalCallRef,attemptCount:attempt+1,httpAttemptsUsed:attempt+1,outputMode:contract.mode,completionTokenBudget,inputChars,inputUtf8Bytes,retryWaitMs:waitMs||0,rateLimitClassification:diagnostic.failureKind,retryAfter:rateLimitMetadata.retryAfter,rateLimitMetadata});
        await delay(waitMs||0); continue;
      }
      emitDiagnostic(executionDiagnosticSink,{boundary:'groq_model_execution',stage:'failed',task,model,logicalCallRef,attemptCount:attempt+1,httpAttemptsUsed:attempt+1,elapsedMs:Date.now()-started,retryWaitMs:totalWaitMs,outputMode:contract.mode,completionTokenBudget,inputChars,inputUtf8Bytes,rateLimitClassification:diagnostic.failureKind,httpStatus:diagnostic.status,providerCode:diagnostic.providerCode,providerType:diagnostic.providerType,providerMessage:diagnostic.providerMessage,providerErrorMessage:diagnostic.providerErrorMessage,providerFailedGeneration:diagnostic.providerFailedGeneration,retryAfter:rateLimitMetadata.retryAfter,rateLimitMetadata});throw error;
    }
    let data;
    try { data = JSON.parse(rawText); } catch { throw new Error(`Groq provider returned an invalid response envelope for ${task}.`); }
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) throw new Error(`Groq provider returned empty model content for ${task}.`);
    const usage=data?.usage&&typeof data.usage==='object'?data.usage:{};const execution={logicalCallRef,attemptCount:attempt+1,httpAttemptsUsed:attempt+1,elapsedMs:Date.now()-started,retryWaitMs:totalWaitMs,inputChars,inputUtf8Bytes,completionTokenBudget,outputCompletionTokens:Number.isFinite(Number(usage.completion_tokens))?Number(usage.completion_tokens):null,inputPromptTokens:Number.isFinite(Number(usage.prompt_tokens))?Number(usage.prompt_tokens):null,totalTokens:Number.isFinite(Number(usage.total_tokens))?Number(usage.total_tokens):null,rateLimitMetadata};
    emitDiagnostic(executionDiagnosticSink,{boundary:'groq_model_execution',stage:'completed',task,model,outputMode:contract.mode,...execution});
    return { content: content.trim(), model, task, outputMode: contract.mode, attemptsUsed: attempt + 1, execution, rateLimitMetadata };
  }
  throw new Error(`Groq provider request failed for ${task}.`);
}
