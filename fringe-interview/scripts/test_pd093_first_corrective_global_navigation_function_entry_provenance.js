import assert from 'assert/strict';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const source={id:'cv-current',sourceRole:'current_cv',content:'Production Supervisor. Coordinamento del lavoro di officina.'};
const peopleKnowledge={
 semanticType:'continuing_people_responsibility',
 sourceRuntimeActionRef:'interviewQuestion:people_responsibility_scope',
 sourceExecutionRef:'knowledgeAcquisitionExecution:people-1',
 observation:{observationStatus:'observed',evidenceIds:['evidence:answer'],limitations:['formal reporting authority not established']},
 specializedMeasurementResult:{
  semanticDetail:{continuity:'continuing',peopleScope:{kind:'exact',value:5},professionalContext:{description:'officina'},responsibilityKinds:['work_assignment_or_priority_setting']},
  context:{description:'officina'},evidenceIds:['evidence:answer'],limitations:['formal reporting authority not established']
 }
};
const identitySummary={professionalSources:[source],sourceAssets:[],reusableKnowledgeResults:[peopleKnowledge],knowledgeCount:1,careerPreferenceContext:{},portableRestore:null,activePurpose:'professional_representation_understand'};

const home=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary,result:{phase:'start'}});
assert.match(home,/id="imago-product-landing"/,'Home is now the product landing');
assert.doesNotMatch(home,/id="purpose-actions"|Cosa vuoi fare oggi\?/,'PD-094 removes the old five-purpose chooser');
for(const label of ['Profilo','Come emergo','Direzioni','Candidatura','Arricchisci','Colloquio'])assert.match(home,new RegExp(`>${label}<`));
assert.doesNotMatch(home,/>Home<\/a>/);
assert.match(home,/\.imago-primary-nav\{display:flex;gap:[^}]*flex-wrap:nowrap/,'desktop navigation must remain one line');
assert.match(home,/@media\(max-width:980px\)\{[\s\S]*?\.imago-candidate-header/,'compact responsive mode must be bounded below desktop width');

const purposes=[
 ['professional_representation_understand','Come emergo professionalmente','Mostrami cosa emerge'],
 ['professional_direction_explore','Direzioni professionali','Esplora le direzioni'],
 ['opportunity_application','Candidatura','Prepara una candidatura'],
 ['professional_identity_build_enrich','Arricchisci il mio profilo','Arricchisci il mio profilo'],
 ['interview_practice','Allenamento colloquio','Inizia l’allenamento']
];
for(const [purpose,title,action] of purposes){
 const html=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary:{...identitySummary,activePurpose:purpose},result:{phase:'start',navigationTarget:purpose}});
 assert.match(html,/id="function-entry"/);
 assert.match(html,new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 assert.match(html,new RegExp(action.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 assert.doesNotMatch(html,/id="purpose-actions"/,'global navigation must not route through the Home purpose chooser');
 assert.match(html,new RegExp(`name="productPurpose" value="${purpose}"`));
}

const representation=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary,result:{phase:'start',navigationTarget:'professional_representation_understand'}});
const representationEntry=representation.match(/<main id="function-entry"[\s\S]*?<\/main>/)?.[0]||'';
assert.match(representationEntry,/rilegge insieme esperienze, materiali e informazioni professionali confermate/i);
assert.match(representationEntry,/collegamenti, continuità e responsabilità/i);
assert.doesNotMatch(representationEntry,/job description|\bJD\b|fit analysis/i);
assert.match(representation,/document\.addEventListener\('submit'/,'function-entry action must retain common processing shell');

const profile=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary,result:{phase:'profile'}});
assert.match(profile,/Responsabilità continuativa su persone/);
assert.match(profile,/Da un approfondimento richiesto da IMAGO/i);
assert.doesNotMatch(profile,/L’informazione confermata riguarda il coordinamento del lavoro di 5 persone/i);
assert.doesNotMatch(profile,/<li>\s*(?:di\s+)?officina\s*<\/li>/i,'weak context-only provenance must not be rendered');
assert.doesNotMatch(profile,/evidence:answer|continuing_people_responsibility|work_assignment_or_priority_setting/,'internal provenance identifiers/enums must not leak');

const weakSummary={...identitySummary,reusableKnowledgeResults:[{semanticType:'continuing_people_responsibility',observation:{},specializedMeasurementResult:{semanticDetail:{continuity:'',peopleScope:{kind:'unknown'},professionalContext:{description:'officina'},responsibilityKinds:[]},context:{description:'officina'},limitations:[]}}]};
const weakProfile=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary:weakSummary,result:{phase:'profile'}});
assert.doesNotMatch(weakProfile,/<details class="imago-expandable profile-knowledge-detail">[\s\S]*?<li>\s*(?:di\s+)?officina\s*<\/li>/i);

const enEntry=renderPrivateBetaUiJourneyHtml({locale:'en',identityAvailable:true,identitySummary,result:{phase:'start',navigationTarget:'professional_representation_understand'}});
assert.match(enEntry,/How I emerge professionally/);
assert.match(enEntry,/Show me what emerges/);

console.log('PD-093 First Corrective Global Navigation / Function Entry / Provenance: PASS');
