import assert from 'node:assert/strict';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const summary={professionalSources:[1,2,3,4],knowledgeCount:3,reusableKnowledgeResults:[],portableRestore:{imported:true}};
const it=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary:summary});
const en=renderPrivateBetaUiJourneyHtml({locale:'en',identityAvailable:true,identitySummary:summary});

// A/B — IMAGO default selection owns the practical Beta welcome.
assert.match(it,/data-landing-function="imago"[^>]*aria-selected="true"/);
assert.match(it,/Benvenuto nella versione Beta di IMAGO\./);
for(const text of ['Carica i tuoi CV','anche quelli precedenti','documenti e informazioni','ruolo o una Job Description','candidature mirate','colloqui specifici']) assert.ok(it.includes(text),text);

// C/D — long intro is contextual: it lives only inside the IMAGO tabpanel, not permanent hero copy.
const hero=it.match(/<section class="landing-hero landing-hero-compact">[\s\S]*?<\/section>/)?.[0]||'';
assert.match(hero,/<h1 class="landing-motto"><span>Ti conosce professionalmente\.<\/span><span>Ti valorizza senza inventarti\.<\/span><\/h1>/);
assert.doesNotMatch(hero,/Carica i tuoi CV|Job Description|Non ti assegna un voto/);
const imagoPanel=it.match(/id="landing-function-panel-imago"[\s\S]*?<\/article>/)?.[0]||'';
assert.match(imagoPanel,/Benvenuto nella versione Beta di IMAGO/);
assert.match(imagoPanel,/Cosa IMAGO non è/);
assert.match(imagoPanel,/IMAGO non è un test che assegna un voto complessivo alla persona/);

// E/F — non-evaluative boundary moved into detail; profile counts removed from primary landing status.
assert.doesNotMatch(hero,/Non ti assegna un voto/);
assert.doesNotMatch(it,/Materiali professionali disponibili: 4|Conoscenze professionali riutilizzabili: 3/);
assert.match(it,/Profilo IMAGO disponibile/);
assert.match(it,/Apri il mio profilo/);

// G — continuity is promoted to a visible anchor, not a tiny footer.
assert.match(it,/class="landing-continuity-anchor"/);
assert.match(it,/Il tuo profilo professionale cresce con te e resta il punto di continuità tra tutti gli strumenti di IMAGO/);
assert.doesNotMatch(it,/class="landing-closing"/);

// H/I — selected tab and panel share canonical visual emphasis, and typography uses PD-083 tokens.
assert.match(it,/\.landing-simulator-tab\.active\{[^}]*var\(--imago-nav-active-bg\)/);
assert.match(it,/\.landing-function-panel\{[^}]*var\(--imago-color-info-surface\)[^}]*var\(--imago-color-navigation-active\)/);
assert.match(it,/\.landing-function-panel h3\{[^}]*var\(--imago-font-size-section-title\)/);
assert.match(it,/\.landing-function-short\{[^}]*var\(--imago-font-size-card-title\)/);

// J/K — mobile behavior and localization remain bounded.
assert.match(it,/@media\(max-width:720px\)\{[\s\S]*?\.landing-simulator\{padding:/);
assert.match(en,/Welcome to the Beta version of IMAGO/);
assert.match(en,/What IMAGO is not/);
assert.match(en,/Your professional profile grows with you and remains the continuity point across all IMAGO tools/);
assert.doesNotMatch(en,/Benvenuto|Cosa IMAGO non è|Il tuo profilo professionale cresce con te/);

console.log('PD-094 Third Corrective Beta Landing Voice / Contextual Introduction: PASS');
