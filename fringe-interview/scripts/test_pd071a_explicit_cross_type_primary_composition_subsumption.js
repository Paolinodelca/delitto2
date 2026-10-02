import assert from 'node:assert/strict';
import { deriveExplicitCrossTypePrimaryCompositionSubsumption } from '../src/app/crossTypePrimaryCompositionSubsumption.js';
import { composeProfessionalThreads,selectLevel1ProfessionalThreads } from '../src/app/professionalThreadComposition.js';
const rel=(ref,bases,sources)=>({contributorRef:ref,contributorType:'grounded_descriptive_professional_relationship',professionalBasisRefs:bases,sourceRefs:sources,status:'accepted'});
const pat=(ref,bases,sources)=>({contributorRef:ref,contributorType:'supported_pattern',professionalBasisRefs:bases,sourceRefs:sources,status:'accepted'});
const hs=(bases,sources)=>({status:'accepted',structureId:'higherOrderStructure:h1',kind:'higher_order_descriptive_professional_structure',contributorRefs:['relationship:r1','relationship:r2'],contributorTypes:['grounded_descriptive_professional_relationship','grounded_descriptive_professional_relationship'],materialRefs:['m1','m2'],professionalBasisRefs:bases,sourceRefs:sources,structureWording:'Struttura documentata',compositionBasis:'basis',claimShape:{subjectScope:'documented_material_structure'},provenance:{}});
const contributors=[rel('relationship:r1',['e1'],['s1']),rel('relationship:r2',['e2'],['s2']),pat('pattern:documented_cross_functional_coordination_recurrence:x',['e1','e2'],['s1','s2'])];
let [h]=deriveExplicitCrossTypePrimaryCompositionSubsumption({structures:[hs(['e1','e2'],['s1','s2'])],contributors});
assert.deepEqual(h.explicitlySubsumedContributorRefs,['pattern:documented_cross_functional_coordination_recurrence:x']);
// Partial overlap: not enough.
[h]=deriveExplicitCrossTypePrimaryCompositionSubsumption({structures:[hs(['e1','e2','e3'],['s1','s2','s3'])],contributors});assert.deepEqual(h.explicitlySubsumedContributorRefs,[]);
// Lexical similarity is irrelevant without canonical lineage.
[h]=deriveExplicitCrossTypePrimaryCompositionSubsumption({structures:[{...hs(['e9','e10'],['s9','s10']),structureWording:'cross functional coordination recurrence'}],contributors});assert.deepEqual(h.explicitlySubsumedContributorRefs,[]);
// Different professional basis: no suppression.
[h]=deriveExplicitCrossTypePrimaryCompositionSubsumption({structures:[hs(['e3','e4'],['s1','s2'])],contributors});assert.deepEqual(h.explicitlySubsumedContributorRefs,[]);
// Candidate composition consumes explicit relation only.
[h]=deriveExplicitCrossTypePrimaryCompositionSubsumption({structures:[hs(['e1','e2'],['s1','s2'])],contributors});
const pm={higherOrderDescriptiveProfessionalStructures:[h],groundedDescriptiveRelationships:[],supportedPatterns:[{kind:'documented_cross_functional_coordination_recurrence',domain:'x',supportCount:2,sourceRefs:['s1','s2'],episodeRefs:['e1','e2']}],selectedEpisodeContributions:[],knowledgeContribution:[]};
const threads=composeProfessionalThreads({professionalMeaning:pm});const selected=selectLevel1ProfessionalThreads(threads);
assert.equal(selected[0].kind,'higher_order_descriptive_structure');assert.equal(selected.some(x=>x.kind==='recurring_pattern'),false);
// Existing direct relationship subsumption remains intact.
assert.ok(h.contributorRefs.includes('relationship:r1'));
// No semantic fields are strengthened or written.
assert.equal(h.claimShape.subjectScope,'documented_material_structure');assert.equal('personKnowledge' in h,false);
console.log('PD-071A explicit cross-type primary composition subsumption: PASS');
