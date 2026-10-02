# IMAGO — Architect Live Checkpoint
## End of day — 2026-10-01

### Session status

Current working tree remains intentionally dirty and is the technical source of truth.

Do **not** commit, push, reset, stash or clean unless explicitly authorized.

Accepted historical closures remain closed, including:
- BV06A — HUMAN ACCEPTED / CLOSED
- PDIR11 — CLOSED
- PD-090 — CLOSED / APPROVED
- PD-091 — CLOSED / APPROVED
- PD-092 — HUMAN-LIVE VERIFIED / CLOSED
- PD-093 + First + Second Corrective — functionally accepted

### PD-094 — Product Landing and Orientation Home

Applied sequence:
- PD-094
- PD-094 First Corrective
- PD-094 Second Corrective
- PD-094 Third Corrective

Current Human Test result:

**PD-094 is NOT yet HUMAN ACCEPTED / CLOSED.**

The structure is now substantially correct:
- no `Home` navigation item;
- `IMAGO` is the brand and landing entry;
- Function Explorer is the central orientation device;
- simulated menu contains `IMAGO`, `Profilo`, `Come emergo`, `Direzioni`, `Candidatura`, `Arricchisci`, `Colloquio`;
- descriptions are function-specific;
- desktop menu remains on one row;
- narrow viewport uses controlled horizontal overflow;
- `Approfondisci` replaces `Capisci meglio`;
- general Product principles are consolidated under `IMAGO`;
- the persistent profile-continuity message is visible.

### Remaining PD-094 Human-Test findings

A final bounded copy / presentation corrective is still required.

#### 1. Landing heading wrapping
Current motto wraps awkwardly:

`Ti conosce professionalmente. Ti`
`valorizza senza inventarti.`

Desired presentation:
- either keep the first sentence on line 1 and the second sentence on line 2;
- or otherwise control the desktop typography so the break looks intentional.

Do not solve this by making typography too small.

#### 2. `Qui sotto` is no longer correct
Inside the IMAGO explanation:

`Scopri qui sotto in quanti modi IMAGO può aiutarti.`

is contextually wrong because the sentence is already inside the explanatory panel.

Replace with wording that refers to the explorer without a positional expression such as `qui sotto`.

#### 3. `Cosa IMAGO non è` — unknown wording
Current concept:

`Non considera automaticamente una informazione sconosciuta come una mancanza.`

is not sufficiently natural or clear.

Preserve the semantic principle:

**not observed / not yet known != absent / missing**

but express it in Candidate language, e.g. conceptually:

`Se IMAGO non possiede ancora un'informazione su di te, non conclude per questo che quella esperienza o caratteristica ti manchi.`

Exact wording to be refined in the next corrective.

#### 4. Profilo persistence wording
Current:

`Il profilo può essere salvato e ripristinato completo delle informazioni disponibili.`

Preferred meaning:
- saved and restored with the information already entered/acquired;
- new materials, data and experiences can be added later;
- the information already known by IMAGO can then be reused across its tools without rebuilding the professional history each time.

Avoid `informazioni disponibili`, which is ambiguous.

#### 5. `Come emergo → Approfondisci` needs rewriting
Current copy is conceptually correct but reads as a sequence of architectural caveats.

It should become a fluent explanation centered on:
- a CV normally shows experiences separately;
- IMAGO can read them together;
- repeated situations, continuities, relationships and **patterns** can become visible;
- this is a representation grounded in the information available at that moment;
- it is not an absolute definition of the person;
- it is currently target-independent;
- HR/CEO/interviewer-relative perception is not yet implemented as a general model.

The phrase:

`“Emergi così” non significa “sei così”`

should remain conceptually, but be integrated naturally rather than appearing as a detached warning.

The bounded AI analogy may remain but should not dominate the paragraph.

### Important Product requirement discovered today — Interview Training

Preserve as an explicit future functional requirement:

#### Professional Representation
What emerges from the Candidate's grounded professional history.

#### Interview Performance Representation
What the Candidate managed to make visible **in one specific interview simulation for one specific target**.

It should consider at minimum:
- Professional Profile;
- target role / Job Description;
- relevant application materials where available;
- actual answers given during the simulation.

It must evaluate the **performance of that simulation**, not clone the general Professional Representation.

Guardrails:
- a weak answer does not imply that a professional capability is absent;
- a strong answer does not automatically create Professional Knowledge;
- training answers remain separate from canonical Professional Identity unless later acquired through an explicit authorised path.

This requirement is **not yet verified as implemented** and must be checked during the future Interview Training Human Test.

### PD-095 — Beta Feedback Experience

Still OPEN and next after PD-094 closure.

Desired direction:
- compact Beta thank-you / invitation on Landing;
- persistent but unobtrusive `Feedback Beta` entry across Candidate surfaces;
- contextual feedback captured at the moment it occurs;
- distinguish something that worked especially well / problem or unclear point / improvement suggestion / other;
- free-text feedback;
- optional usefulness signal;
- automatically attach safe context such as current area / build / Beta session;
- no complex analytics dashboard required for Beta.

Important Beta tone:
we want testers to report not only defects, but also moments where IMAGO creates unexpected value.

### Future Product opportunity — Batch / Campaign Application

Preserve post-Beta opportunity:

Candidate supplies a list of companies / opportunities
→ IMAGO reuses the same Professional Identity
→ produces a grounded, differentiated application package for each target
→ targeted CV + cover letter per opportunity.

Do **not** implement automatic sending at this stage.

### Current Beta open path after Landing

After PD-094 closure:
1. PD-095 — Beta Feedback Experience
2. O5 — real Valeo Application retest
3. Continue enriching Human Test
4. Interview Training Human Test, including verification of Interview Performance Representation
5. remaining Candidate artifact delivery and Beta exit items

### Recommended restart tomorrow

Do **not** start from a broad redesign.

Start with one bounded task:

**PD-094 Fourth Corrective — Landing Copy Coherence and Final Readability Cleanup**

Only address the five Human-Test findings listed above.

Do not reopen layout, navigation, Function Explorer architecture or Product semantics unless the corrective exposes a real blocker.
