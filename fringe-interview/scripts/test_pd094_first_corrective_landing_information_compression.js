import assert from 'node:assert/strict';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const identitySummary={professionalSources:[{id:'a'},{id:'b'},{id:'c'},{id:'d'}],knowledgeCount:3,reusableKnowledgeResults:[],portableRestore:{imported:true}};
const it=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary});
const en=renderPrivateBetaUiJourneyHtml({locale:'en',identityAvailable:true,identitySummary});

// First Corrective compression remains: no standalone explanatory chapters.
assert.match(it,/class="landing-hero landing-hero-compact"/);
assert.match(it,/class="landing-functions landing-functions-primary"/);
assert.doesNotMatch(it,/class="landing-emerge"|class="landing-growth"|landing-principles/);
assert.match(it,/Profilo IMAGO disponibile/);
assert.doesNotMatch(it,/Materiali professionali disponibili: 4/);
assert.doesNotMatch(it,/Conoscenze professionali riutilizzabili: 3/);

// Second Corrective further centralizes all explanation in the full-width explorer.
assert.doesNotMatch(it,/landing-orientation-grid/);
assert.match(it,/data-landing-function="imago"/);
assert.match(it,/Un CV tende a raccontare le esperienze una alla volta/);
assert.match(it,/non pretende quindi di definire chi sei in assoluto/);
assert.match(it,/Materiali e informazioni → conoscenza professionale → nuovi utilizzi/);
assert.match(it,/Approfondisci/);
assert.doesNotMatch(it,/Capisci meglio|Come ragiona IMAGO/);

// No sticky overengineering; responsive handling relies on compact full-width layout and scrollable tabs.
assert.doesNotMatch(it,/\.landing-functions-primary\{[^}]*position:sticky/);
assert.match(it,/\.landing-simulator-tabs\{[^}]*flex-wrap:nowrap[^}]*overflow-x:auto/);
assert.match(it,/@media\(max-width:720px\)\{[\s\S]*?\.landing-simulator\{padding:/);

assert.match(it,/<a class="imago-brand" href="\/private-beta"/);
assert.doesNotMatch(it,/class="imago-nav-link[^>]*>Home<\/a>/);
assert.doesNotMatch(it,/id="purpose-actions"|Cosa vuoi fare oggi\?/);

assert.match(en,/Welcome to the Beta version of IMAGO/);
assert.match(en,/Explore further/);
assert.doesNotMatch(en,/How IMAGO reasons|A profile that grows with you/);

console.log('PD-094 First Corrective Landing Information Compression: PASS');
