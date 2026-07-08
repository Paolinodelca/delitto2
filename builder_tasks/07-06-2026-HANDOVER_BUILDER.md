# BUILDER_HANDOVER.md

## Stato

Identity Core Foundation completata.

Tutti i Builder Task fino al 0036 risultano implementati.

Tutti i test PASS.

Tutti gli Health PASS.

---

## Regole permanenti

Ogni nuovo Builder Task deve rispettare:

* CommonJS
* nessun LLM
* nessuna narrativa
* nessuna modifica ai renderer salvo esplicita richiesta
* backward compatibility
* validator
* health
* test

---

## Nuova regola

Prima di considerare completato un task verificare sempre:

* import mancanti
* export mancanti
* variabili non definite
* ReferenceError
* Errori di compilazione

Questa verifica è obbligatoria.

---

## Stato della pipeline

Input

↓

Evidence

↓

Identity

↓

Representation

↓

Pipeline

La pipeline attuale è stabile.

---

## Prossimo blocco

Reasoning Layer.

Il Builder NON deve iniziare ad implementarlo autonomamente.

Ogni Builder Task verrà definito dall'Architect.

Non introdurre interpretazioni semantiche.

Non introdurre logiche LLM.

Il Reasoning Layer sarà progettato separatamente.

---

## Stato finale

La Foundation del nuovo Core è considerata completata.
