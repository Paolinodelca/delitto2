import assert from 'assert/strict';
import vm from 'vm';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';
import {naturalizeCandidateWording,naturalizeEpisodeMeaning} from '../src/app/candidateFacingRepresentationPresentation.js';

const source=(id,sourceRole,content,label='')=>({id,sourceRole,content,label,metadata:{}});
const identitySummary={
 professionalSources:[source('cv:current','current_cv','Industrialization Engineer — Valeo. Coordinamento industrializzazione e avviamento linee.')],
 sourceAssets:[],
 reusableKnowledgeResults:[
  {semanticType:'decision_accountability',observation:{decisionAuthority:'shared',consequenceScope:'function',context:{episode:'lancio industriale'},limitations:[]}},
  {semanticType:'quantified_outcome',observation:{measurableOutcome:'miglioramento',quantitativeValue:{value:20,unit:'percent',approximate:true},contributionRelationship:'contributed',context:{event:'miglioramento produttivo'},limitations:['contribution only']}}
 ],
 knowledgeCount:2,careerPreferenceContext:{},portableRestore:null,activePurpose:'professional_representation_understand'
};

const home=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary,result:{phase:'start'}});
assert.match(home,/<a class="imago-brand" href="\/private-beta"[^>]*>IMAGO<\/a>/);assert.doesNotMatch(home,/class="imago-nav-link[^"]*"[^>]*>Home<\/a>/);
for(const label of ['Profilo','Come emergo','Direzioni','Candidatura','Arricchisci','Colloquio'])assert.match(home,new RegExp(`>${label.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}<`));
assert.match(home,/role="tooltip"/);assert.match(home,/aria-describedby="nav-help-representation"/);assert.match(home,/focus-within \.imago-nav-tooltip/);
assert.match(home,/id="imago-product-landing"/);assert.match(home,/Scopri cosa puoi fare con IMAGO/);assert.doesNotMatch(home,/id="purpose-actions"|Cosa vuoi fare oggi\?/);assert.doesNotMatch(home,/▶/);
assert.match(home,/id="imago-processing-status"[^>]*role="status"[^>]*aria-live="polite"/);
assert.match(home,/IMAGO sta elaborando le informazioni…/);
assert.match(home,/document\.addEventListener\('submit'/);
assert.match(home,/\?purpose=professional_representation_understand/);
assert.match(home,/\?purpose=professional_direction_explore/);
assert.match(home,/\?purpose=opportunity_application/);
assert.match(home,/\?purpose=professional_identity_build_enrich/);
assert.match(home,/\?purpose=interview_practice/);
const applicationLanding=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary:{...identitySummary,activePurpose:'opportunity_application'},result:{phase:'start',navigationTarget:'opportunity_application'}});
assert.match(applicationLanding,/class="imago-nav-link active"[^>]*aria-current="page"[^>]*>Candidatura</);
assert.match(applicationLanding,/id="function-entry"/);
assert.doesNotMatch(applicationLanding,/id="purpose-actions"/);

const profile=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary,result:{phase:'profile'}});
assert.match(profile,/class="imago-nav-link active"[^>]*aria-current="page"[^>]*>Profilo</);
assert.equal((profile.match(/>CV attuale</g)||[]).length,1,'material title/type must not render as CV attualeCV attuale');
assert.doesNotMatch(profile,/CV attuale\s*CV attuale/);
assert.match(profile,/responsabilità decisionale condivisa/i);
assert.match(profile,/perimetro funzione/i);
assert.match(profile,/circa 20%/i);
assert.doesNotMatch(profile,/>shared<|>contributed<|20 percent|In nel contesto/i);
assert.match(profile,/senza attribuire causalità esclusiva/i);

const representation=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary,result:{phase:'purpose_understand',productPurpose:'professional_representation_understand',preInterview:{targetIndependentProfessionalRepresentation:null}}});
assert.match(representation,/class="imago-nav-link active"[^>]*aria-current="page"[^>]*>Come emergo</);

const direction=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary,result:{phase:'purpose_direction_acquisition',productPurpose:'professional_direction_explore',directionAcquisition:{status:'resolved',questionRequired:false,question:'',authority:{semanticType:'resource_budget_responsibility_scope'}}}});
assert.match(direction,/aria-current="page"[^>]*>Direzioni</);
const application=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary,result:{phase:'purpose_opportunity_application',productPurpose:'opportunity_application',opportunityApplication:{opportunityUnderstanding:{label:'Ruolo',source:{content:''},responsibilities:[],requirements:[],preferredRequirements:[],constraints:[],unclassified:[]},groundedApplicationPackage:{targetRelativeInformationMap:[],documentCompletenessState:{needs:[]},professionalHistory:[],profileTrace:{},materialInformationGaps:[],candidateDocumentData:{}},applicationArtifacts:{template:'essential',documentLanguage:'it',targetedCv:{content:'CV'},coverLetter:{content:'LETTER'}}}}});
assert.match(application,/aria-current="page"[^>]*>Candidatura</);

assert.equal(naturalizeEpisodeMeaning({description:'Partecipazione al lancio della linea',participation:'participated'},{locale:'it'}),'Hai partecipato al lancio della linea');
assert.equal(naturalizeCandidateWording('Hai partecipato a partecipazione al lancio della linea',{locale:'it'}),'Hai partecipato al lancio della linea');

// Execute the actual common processing bootstrap from the rendered page.
const match=[...home.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(x=>x.includes("imago-processing-status")&&x.includes("addEventListener('submit'"));
assert.ok(match,'processing bootstrap must be present');
class HTMLFormElement {}
const status={hidden:true,dataset:{}};
let virtualNow=0;
const FakeDate={now:()=>virtualNow};
const handlers={};
const document={
 documentElement:{attrs:new Map(),setAttribute(k,v){this.attrs.set(k,v)}},
 getElementById(id){return id==='imago-processing-status'?status:null},
 addEventListener(type,fn){handlers[type]=fn}
};
vm.runInNewContext(match,{document,HTMLFormElement,Date:FakeDate});
const form=new HTMLFormElement();form.dataset={};handlers.submit({target:form});
assert.equal(status.hidden,false,'processing indicator must become visible immediately');
assert.equal(document.documentElement.attrs.get('data-imago-processing'),'true');
assert.equal(status.dataset.startedAt,'0');
// Controlled virtual wait >=30s: no client-side timeout clears the state while the server/provider is still working.
virtualNow=30000;
assert.equal(status.hidden,false,'processing indicator must remain visible during a >=30s server wait');

console.log('PD-093 Persistent Candidate Navigation / Processing / Wording Cleanup: PASS');
