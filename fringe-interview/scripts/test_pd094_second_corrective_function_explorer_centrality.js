import assert from 'node:assert/strict';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const summary={professionalSources:[1,2,3,4],knowledgeCount:3,reusableKnowledgeResults:[],portableRestore:{imported:true}};
const it=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary:summary});
const en=renderPrivateBetaUiJourneyHtml({locale:'en',identityAvailable:true,identitySummary:summary});

// A — compact proposition followed immediately by full-width explorer.
const heroPos=it.indexOf('landing-hero landing-hero-compact');
const explorerPos=it.indexOf('landing-functions landing-functions-primary');
assert.ok(heroPos>=0 && explorerPos>heroPos);
assert.doesNotMatch(it,/landing-orientation-grid/);
assert.doesNotMatch(it,/landing-principles/);

// B/C — all seven simulated items, no desktop wrapping.
const sim=it.match(/<div class="landing-simulator"[\s\S]*?<\/div><\/section>/)?.[0]||'';
for(const key of ['imago','profile','representation','direction','application','enrich','interview']) assert.match(sim,new RegExp(`data-landing-function="${key}"`));
assert.match(it,/\.landing-simulator-tabs\{[^}]*flex-wrap:nowrap[^}]*overflow-x:auto/);
assert.match(it,/\.landing-simulator-tab\{[^}]*white-space:nowrap/);

// E — IMAGO owns product principles and continuity.
assert.match(it,/Benvenuto nella versione Beta di IMAGO/);
for(const text of ['Profilo Professionale cresce nel tempo',"non conclude per questo che quell'esperienza, responsabilità o caratteristica ti manchi",'preferenza non diventa automaticamente una capacità','allenamento non diventa automaticamente una verità professionale']) assert.ok(it.includes(text),text);

// F — Profile owns persistence / save-restore / reuse / growth.
for(const text of ['può essere salvato e ripristinato','Materiali e informazioni → conoscenza professionale → nuovi utilizzi','non devi ricostruire ogni volta da zero']) assert.ok(it.includes(text),text);

// G — Representation content is target-independent, emergi != sei, and bounded AI analogy.
assert.match(it,/non pretende quindi di definire chi sei in assoluto/);
assert.match(it,/percorso nel suo insieme, non una specifica posizione/);
assert.match(it,/non è ancora modulata in modo distinto sulla prospettiva di un HR, di un CEO o di uno specifico intervistatore/);
assert.match(it,/Per analogia/);

// H/I/J/K — menu-aligned function content.
assert.match(it,/ciò che richiede ancora chiarimenti/);
assert.match(it,/CV mirato e una lettera di presentazione/);
assert.match(it,/Puoi arrivare qui direttamente, oppure IMAGO può proporti un approfondimento/);
assert.match(it,/posizione o Job Description specifica/);
assert.match(it,/non viene aggiunta automaticamente alla conoscenza professionale confermata/);
assert.doesNotMatch(it,/valutazione finale|performance assessment|punteggio/i);

// L/M — one consistent disclosure label, no heavy lower interactive principle region.
const approfondisci=(it.match(/<summary>Approfondisci<\/summary>/g)||[]).length;
assert.equal(approfondisci,7);
assert.doesNotMatch(it,/Capisci meglio|Come ragiona IMAGO|landing-principle-disclosures/);

// N/O — navigation and localization stay intact.
assert.match(it,/<a class="imago-brand" href="\/private-beta"/);
assert.match(en,/Welcome to the Beta version of IMAGO/);
assert.equal((en.match(/<summary>Explore further<\/summary>/g)||[]).length,7);
assert.doesNotMatch(en,/Approfondisci|Capisci meglio|Come ragiona IMAGO/);

console.log('PD-094 Second Corrective Function Explorer Centrality: PASS');
