import assert from 'node:assert/strict';
import {buildOpportunityUnderstanding,buildGroundedApplicationPackage,buildApplicationArtifacts,candidateArtifactRequiresLanguageTransformation} from '../src/app/opportunityApplication/groundedApplicationPackage.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';
import {loadPrivateBetaUiMessages} from '../src/i18n/loadPrivateBetaUiMessages.js';
const jd=`Industrialization Project Engineer
We are looking for an Industrialization Project Engineer to support the installation, start-up and stabilization of new production lines.
Main responsibilities:
- Support the installation, commissioning, start-up and stabilization of new production lines.
- Collaborate with Engineering, Production and Quality during industrialization activities.
- Coordinate cross-functional activities and ensure project milestones and targets are achieved.
Requirements:
- Engineering degree or equivalent technical education.
- Knowledge of project management methodologies.
- Ability to work with Engineering, Production and Quality.
- Budget or investment management experience is considered an advantage.
- Availability to travel.`;
const u=buildOpportunityUnderstanding({opportunityText:jd,opportunityLabel:'Industrialization Project Engineer'});
assert.ok(u.responsibilities.some(x=>/installation/.test(x.statement)));
assert.ok(u.requirements.some(x=>/Engineering degree/.test(x.statement)));
assert.ok(u.requirements.some(x=>/project management/.test(x.statement)));
assert.ok(u.requirements.some(x=>/Ability to work/.test(x.statement)));
assert.ok(u.preferredRequirements.some(x=>/advantage/.test(x.statement)));
assert.ok(u.constraints.some(x=>/travel/.test(x.statement)));
assert.ok(!u.requirements.some(x=>x.statement==='Industrialization Project Engineer'));
const identity={revision:4,professionalSources:[
{id:'cv1',sourceRole:'current_cv',role:'Production Supervisor',content:'Marco Bianchi. Production Supervisor. Ha collaborato con Produzione e Manutenzione. Responsabilità condivisa sul follow-up operativo.'},
{id:'cv2',sourceRole:'previous_cv',role:'Industrialization Engineer',content:'Industrialization Engineer. Ha partecipato al lancio industriale di una nuova linea produttiva in Germany.'},
{id:'d1',sourceRole:'professional_declaration',content:'Ha contribuito alla preparazione del supplier ramp-up Atlas.'},
{id:'d2',sourceRole:'professional_declaration',content:'Risultato del progetto: circa 20%.'}
],representationSnapshots:[]};
const pkg=buildGroundedApplicationPackage({professionalIdentity:identity,opportunityUnderstanding:u,documentData:{displayName:'Marco Bianchi'}});
const it=loadPrivateBetaUiMessages('it');const arts=buildApplicationArtifacts({applicationPackage:pkg,opportunityUnderstanding:u,documentLanguage:'it',messages:it});
assert.ok(!arts.cvContentModel.professionalExperience.flatMap(x=>x.details).includes('Marco Bianchi'));
assert.ok(!arts.cvContentModel.professionalSummary.includes('Marco Bianchi'));
assert.ok(!arts.coverLetter.content.includes('..'));
assert.equal(candidateArtifactRequiresLanguageTransformation({applicationPackage:pkg,documentLanguage:'en'}),true);
const page=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_opportunity_application',opportunityApplication:{opportunityUnderstanding:u,groundedApplicationPackage:pkg,applicationArtifacts:arts}}});
assert.ok(page.includes('Marco Bianchi'));
assert.ok(page.includes(it.applicationContentPreviewStyleNote));
const entry=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary:{professionalSources:[{sourceRole:'professional_declaration'},{sourceRole:'professional_declaration'}]}});
assert.ok(!entry.includes('Materiali professionali disponibili: 2'));assert.ok(entry.includes('Profilo IMAGO disponibile'));assert.ok(entry.includes('Apri il mio profilo'));assert.ok(entry.includes('Scopri cosa puoi fare con IMAGO')); // PD-094 Third Corrective keeps only subtle profile availability on Landing
console.log('PD-062I Second Corrective Candidate Quality: PASS (CQ-05 bounded fail-closed need detected; transformation not implemented)');
