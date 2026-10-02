import assert from 'node:assert/strict';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const summary={professionalSources:[1,2,3,4],knowledgeCount:3,reusableKnowledgeResults:[]};
const it=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary:summary});
const en=renderPrivateBetaUiJourneyHtml({locale:'en',identityAvailable:true,identitySummary:summary});

// A — intentional motto lines, not browser-dependent sentence wrapping.
assert.match(it,/<h1 class="landing-motto"><span>Ti conosce professionalmente\.<\/span><span>Ti valorizza senza inventarti\.<\/span><\/h1>/);
assert.match(it,/\.landing-motto span\{display:block\}/);
assert.match(en,/<h1 class="landing-motto"><span>It knows you professionally\.<\/span><span>It helps you present your value without inventing you\.<\/span><\/h1>/);

// B — no layout-dependent "qui sotto / below" phrasing in current IMAGO welcome.
assert.doesNotMatch(it,/Scopri qui sotto|più avanti/i);
assert.doesNotMatch(en,/Explore below|further down/i);
assert.match(it,/Esplora le funzioni di IMAGO e scopri come possono aiutarti/);

// C — unknown != absence in natural Candidate language.
assert.match(it,/Se non possiede ancora un'informazione su di te, non conclude per questo che quell'esperienza, responsabilità o caratteristica ti manchi/);
assert.doesNotMatch(it,/informazione sconosciuta come una mancanza/);
assert.match(en,/does not conclude that the corresponding experience, responsibility or characteristic is absent/);

// D — Profile detail explicitly covers persisted/acquired info, later enrichment, reuse and no reconstruction from zero.
const profilePanel=it.match(/id="landing-function-panel-profile"[\s\S]*?<\/article>/)?.[0]||'';
for(const text of ['informazioni già inserite e acquisite','nuovi documenti, dati ed esperienze professionali','riutilizzare, nei diversi strumenti di IMAGO','non devi ricostruire ogni volta da zero']) assert.ok(profilePanel.includes(text),text);
assert.doesNotMatch(profilePanel,/informazioni disponibili/);

// E/F — Come Emergo detail is one coherent narrative with the accepted semantic boundaries, not detached caveats.
const representationPanel=it.match(/id="landing-function-panel-representation"[\s\S]*?<\/article>/)?.[0]||'';
for(const text of ['Un CV tende a raccontare le esperienze una alla volta','collegamenti, continuità e pattern','La rappresentazione che ne deriva','non pretende quindi di definire chi sei in assoluto','percorso nel suo insieme','HR','CEO','intervistatore','Per analogia']) assert.ok(representationPanel.includes(text),text);
assert.doesNotMatch(representationPanel,/“Emergi così” non significa “sei così”:/);

// G/H — architecture remains the accepted explorer/navigation model and localization is complete.
assert.match(it,/data-imago-function-simulator/);
assert.match(it,/IMAGO[\s\S]*Profilo[\s\S]*Come emergo[\s\S]*Direzioni[\s\S]*Candidatura[\s\S]*Arricchisci[\s\S]*Colloquio/);
assert.doesNotMatch(en,/Ti conosce professionalmente|informazioni già inserite|Un CV tende/);

console.log('PD-094 Fourth Corrective Landing Copy Coherence / Readability: PASS');
