import assert from 'node:assert/strict';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const identitySummary={professionalSources:[{id:'src:cv',sourceRole:'current_cv',content:'CV content'},{id:'src:decl',sourceRole:'professional_declaration',content:'Declaration'}],knowledgeCount:3,reusableKnowledgeResults:[],portableRestore:{imported:true}};
const it=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary});
const en=renderPrivateBetaUiJourneyHtml({locale:'en',identityAvailable:true,identitySummary});

assert.match(it,/id="imago-product-landing"/);
assert.match(it,/<a class="imago-brand" href="\/private-beta"[^>]*>IMAGO<\/a>/);
assert.doesNotMatch(it,/class="imago-nav-link[^>]*>Home<\/a>/);
assert.match(it,/<h1 class="landing-motto"><span>Ti conosce professionalmente\.<\/span><span>Ti valorizza senza inventarti\.<\/span><\/h1>/);
assert.match(it,/Benvenuto nella versione Beta di IMAGO/);
assert.match(it,/IMAGO non è un test che assegna un voto complessivo alla persona/);

const sim=it.match(/<div class="landing-simulator"[\s\S]*?<\/div><\/section>/)?.[0]||'';
assert.ok(sim);
for(const key of ['imago','profile','representation','direction','application','enrich','interview']){
 assert.match(sim,new RegExp(`type="button" role="tab"[^>]*data-landing-function="${key}"`));
 assert.match(sim,new RegExp(`id="landing-function-panel-${key}"`));
}
assert.doesNotMatch(sim,/<a\b|<form\b/);
assert.match(it,/aria-selected="true"/);
assert.match(it,/addEventListener\('click'/);
assert.match(it,/addEventListener\('focus'/);

// Product principles moved under simulated IMAGO, not permanent lower controls.
assert.match(it,/Benvenuto nella versione Beta di IMAGO/);
assert.match(it,/Se non possiede ancora un'informazione su di te, non conclude per questo che quell'esperienza, responsabilità o caratteristica ti manchi/);
assert.doesNotMatch(it,/landing-principles|Come ragiona IMAGO/);

// Per-function content stays aligned with actual product capability.
assert.match(it,/Il mio profilo IMAGO/);
assert.match(it,/Materiali e informazioni → conoscenza professionale → nuovi utilizzi/);
assert.match(it,/Come emergo professionalmente/);
assert.match(it,/non pretende quindi di definire chi sei in assoluto/);
assert.match(it,/Esplora possibili direzioni professionali/);
assert.match(it,/Una informazione non ancora disponibile non viene automaticamente trattata come una mancanza/);
assert.match(it,/CV mirato e una lettera di presentazione/);
assert.match(it,/Aggiungi nuove esperienze o chiarisci aspetti/);
assert.match(it,/L’allenamento resta separato dal Profilo Professionale/);
assert.doesNotMatch(it,/performance assessment|valutazione finale|punteggio del colloquio/i);

// Local detail wording is consistently Approfondisci.
assert.match(it,/<summary>Approfondisci<\/summary>/);
assert.doesNotMatch(it,/Capisci meglio/);

// Compact status and no old purpose chooser.
assert.match(it,/Profilo IMAGO disponibile/);
assert.doesNotMatch(it,/Materiali professionali disponibili: 2/);
assert.doesNotMatch(it,/Conoscenze professionali riutilizzabili: 3/);
assert.match(it,/Apri il mio profilo/);
assert.doesNotMatch(it,/id="purpose-actions"|id="purpose-start"|Cosa vuoi fare oggi\?/);

const fresh=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:false,identitySummary:null});
assert.match(fresh,/Inizia a costruire il tuo profilo IMAGO/);
assert.match(fresh,/name="productPurpose" value="professional_identity_build_enrich"/);
assert.doesNotMatch(fresh,/Cosa vuoi fare oggi\?|id="purpose-actions"/);

assert.match(it,/\.imago-primary-nav\{[^}]*flex-wrap:nowrap[^}]*white-space:nowrap/);
assert.match(it,/\.landing-simulator-tabs\{[^}]*flex-wrap:nowrap[^}]*overflow-x:auto/);
assert.match(it,/@media\(max-width:980px\)\{[\s\S]*?\.imago-candidate-header/);

assert.match(en,/It knows you professionally/);
assert.match(en,/Welcome to the Beta version of IMAGO/);
assert.match(en,/Explore further/);
assert.doesNotMatch(en,/Come ragiona IMAGO|Capisci meglio|Ti conosce professionalmente/);

console.log('PD-094 Product Landing and Orientation Home: PASS');
