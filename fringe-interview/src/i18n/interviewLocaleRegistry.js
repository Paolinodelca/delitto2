export const INTERVIEW_LOCALES = {
  en: {
    answerShape: {
      noAnswerSummary: "No answer text provided.",
      noAnswerWeakness: "No usable answer was provided.",
      noAnswerHint: "Provide a real answer before attempting analysis.",
      summaryStrong:
        "The answer is well shaped overall, with good clarity and a credible level of specificity.",
      summaryMedium:
        "The answer is usable but still leaves room for stronger ownership, evidence, or specificity.",
      summaryWeak:
        "The answer shows a mixed shape profile and would benefit from stronger evidence and structure.",
      strengths: {
        concreteness: "The answer is concrete enough to feel grounded in real work.",
        evidence: "The answer provides evidence or outcome-oriented support.",
        ownership: "The answer communicates personal ownership clearly.",
        structure: "The answer is structured and easy to follow.",
        clarity: "The answer is expressed clearly and with good readability.",
        reflection: "The answer includes reflection or learning, which adds maturity."
      },
      weaknesses: {
        concreteness:
          "The answer remains too abstract and would benefit from a more concrete example.",
        specificity:
          "The answer is not specific enough about context, scope, or actions.",
        evidence:
          "The answer gives limited evidence of impact, result, or measurable outcome.",
        ownership:
          "The answer does not clearly separate personal contribution from team activity.",
        structure:
          "The answer would be easier to follow with a clearer structure.",
        clarity:
          "The answer risks sounding vague or underdeveloped.",
        reflection:
          "The answer does not yet show reflection, learning, or adaptation."
      },
      hints: {
        concreteness:
          "Add one concrete situation with context, action, and result instead of staying general.",
        evidence:
          "Include an outcome, metric, or visible effect of your work.",
        ownership:
          "State more clearly what you personally owned, decided, or delivered.",
        structure:
          "Use a simple sequence such as situation, action, result.",
        reflection:
          "Add a brief reflection on what you learned or how you adapted.",
        vague:
          "Reduce vague expressions and replace them with precise actions or examples."
      }
    },
    report: {
      narrativeStrong:
        "The session shows a strong answer shape overall, with consistently credible and well-supported responses.",
      narrativeMediumEvidence:
        "The session is reasonably solid, but responses would become more convincing with clearer ownership and stronger evidence.",
      narrativeMedium:
        "The session shows a usable response profile, though several answers could become sharper and more structured.",
      narrativeWeak:
        "The session currently shows a weak answer shape profile and would benefit from more concrete, structured, and evidence-based responses.",
      finalAdvice: {
        concreteness:
          "Use more concrete examples instead of speaking in general terms.",
        evidence:
          "Support more answers with outcomes, metrics, or visible business effects.",
        ownership:
          "Make personal contribution and decision scope more explicit.",
        structure:
          "Use a more repeatable answer shape such as situation, action, result.",
        reflection:
          "Add brief reflection about what you learned, changed, or improved.",
        fallback:
          "Maintain the current level of clarity while adding a few more quantified examples."
      }
    },
    interview: {
      fallbackReason:
        "Fallback family used because no more specific family was selected.",
      openingObjective:
        "Set the frame, establish relevance, and surface the most important validation areas early.",
      openingPrompt:
        "Start by framing the interview around role relevance, then move quickly toward the most important fit and risk signals.",
      coreObjectivePrefix:
        "Explore",
      coreObjectiveSuffix:
        "with emphasis on",
      coreObjectiveEnding:
        "priority fit signals.",
      closingObjective:
        "Close the session by consolidating evidence for the final report.",
      closingPrompt:
        "End by checking whether enough evidence has been collected to confirm strengths, resolve ambiguities, and support the final feedback."
    }
  },
  it: {
    answerShape: {
      noAnswerSummary: "Non è stato fornito alcun testo di risposta.",
      noAnswerWeakness: "Non è stata fornita una risposta utilizzabile.",
      noAnswerHint: "Fornisci una risposta reale prima di tentare l’analisi.",
      summaryStrong:
        "Nel complesso la risposta è ben costruita, con buona chiarezza e un livello credibile di specificità.",
      summaryMedium:
        "La risposta è utilizzabile, ma può ancora migliorare in ownership, evidenza e specificità.",
      summaryWeak:
        "La risposta mostra un profilo formale misto e beneficerebbe di maggiore evidenza e struttura.",
      strengths: {
        concreteness:
          "La risposta è abbastanza concreta da sembrare ancorata a un’esperienza reale.",
        evidence:
          "La risposta fornisce evidenze o supporto orientato ai risultati.",
        ownership:
          "La risposta comunica con chiarezza la responsabilità personale.",
        structure:
          "La risposta è strutturata e facile da seguire.",
        clarity:
          "La risposta è espressa in modo chiaro e leggibile.",
        reflection:
          "La risposta include riflessione o apprendimento, aggiungendo maturità."
      },
      weaknesses: {
        concreteness:
          "La risposta resta troppo astratta e beneficerebbe di un esempio più concreto.",
        specificity:
          "La risposta non è abbastanza specifica su contesto, scope o azioni.",
        evidence:
          "La risposta offre evidenze limitate di impatto, risultato o outcome misurabile.",
        ownership:
          "La risposta non distingue con chiarezza il contributo personale dall’attività del team.",
        structure:
          "La risposta sarebbe più facile da seguire con una struttura più chiara.",
        clarity:
          "La risposta rischia di risultare vaga o poco sviluppata.",
        reflection:
          "La risposta non mostra ancora riflessione, apprendimento o adattamento."
      },
      hints: {
        concreteness:
          "Aggiungi una situazione concreta con contesto, azione e risultato invece di restare sul generale.",
        evidence:
          "Inserisci un outcome, una metrica o un effetto visibile del tuo lavoro.",
        ownership:
          "Rendi più chiaro che cosa dipendeva davvero da te, quali decisioni hai preso e quale contributo hai portato in prima persona.",
        structure:
          "Usa una sequenza semplice come situazione, azione, risultato.",
        reflection:
          "Aggiungi una breve riflessione su ciò che hai imparato o su come ti sei adattato.",
        vague:
          "Riduci le espressioni vaghe e sostituiscile con azioni o esempi precisi."
      }
    },
    report: {
      narrativeStrong:
        "La sessione mostra nel complesso una forma delle risposte forte, con interventi credibili e ben supportati.",
      narrativeMediumEvidence:
        "La sessione è discretamente solida, ma le risposte sarebbero più convincenti con ownership più chiara ed evidenze più forti.",
      narrativeMedium:
        "La sessione mostra un profilo di risposta utilizzabile, anche se diverse risposte potrebbero diventare più nitide e strutturate.",
      narrativeWeak:
        "La sessione mostra attualmente un profilo formale debole e trarrebbe beneficio da risposte più concrete, strutturate e supportate da evidenze.",
      finalAdvice: {
        concreteness:
          "Usa esempi più concreti invece di parlare in termini troppo generali.",
        evidence:
          "Supporta più risposte con risultati, metriche o effetti di business visibili.",
        ownership:
          "Rendi più espliciti il contributo personale e lo scope delle tue decisioni.",
        structure:
          "Usa una forma di risposta più ripetibile, ad esempio situazione, azione, risultato.",
        reflection:
          "Aggiungi una breve riflessione su ciò che hai imparato, cambiato o migliorato.",
        fallback:
          "Mantieni l’attuale livello di chiarezza aggiungendo qualche esempio quantitativo in più."
      }
    },
    interview: {
      fallbackReason:
        "È stata usata la famiglia di fallback perché non è emersa una famiglia più specifica.",
      openingObjective:
        "Impostare il contesto, chiarire la rilevanza del profilo e far emergere presto le aree più importanti da validare.",
      openingPrompt:
        "Apri il colloquio inquadrando la rilevanza del profilo rispetto al ruolo, poi passa rapidamente ai segnali più importanti di fit e di rischio.",
      coreObjectivePrefix:
        "Esplora",
      coreObjectiveSuffix:
        "con enfasi sui segnali di fit a priorità",
      coreObjectiveEnding:
        ".",
      closingObjective:
        "Chiudere la sessione consolidando le evidenze utili per il report finale.",
      closingPrompt:
        "Chiudi verificando se sono state raccolte abbastanza evidenze per confermare i punti forti, sciogliere le ambiguità e sostenere il feedback finale."
    }
  }
};