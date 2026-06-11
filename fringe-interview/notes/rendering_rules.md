
# CONTINUITY UPDATE — FRINGE UI STANDARD v0.9

## Decisione importante

È stato introdotto uno standard estetico/tipografico preliminare per il report PRO, chiamato:

**FRINGE UI STANDARD v0.9**

Obiettivo:
- smettere di procedere per tentativi visivi locali
- evitare colori/font/spacing casuali
- ridurre regressioni desktop/mobile
- creare una base coerente per tutte le future sezioni del report

Lo standard NON è ancora “definitivo scolpito al 100%”, ma è approvato come riferimento operativo preliminare.

Da ora in avanti:
- niente nuovi inline style casuali
- niente nuovi colori inventati
- niente font-size scelti a occhio
- nuove sezioni da costruire usando token e classi standard `fr-*`

---

## Token CSS introdotti

Nel blocco `:root` sono stati aggiunti token FRINGE, mantenendo anche i vecchi token legacy.

Categorie definite:

### Colori
- `--fr-bg`
- `--fr-ink`
- `--fr-muted`
- `--fr-primary-1`
- `--fr-primary-2`
- `--fr-dark-1`
- `--fr-dark-2`
- `--fr-positive-1`
- `--fr-positive-2`
- `--fr-risk-1`
- `--fr-risk-2`
- `--fr-warning-1`
- `--fr-warning-2`
- `--fr-soft-border`

### Tipografia desktop
- `--fr-title-main`
- `--fr-title-section`
- `--fr-title-card`
- `--fr-pill`
- `--fr-body`
- `--fr-dense`
- `--fr-caption`

### Tipografia mobile
Media query `max-width: 640px` con valori più compatti:

```css
@media (max-width: 640px) {
  :root {
    --fr-title-main: 18px;
    --fr-title-section: 16px;
    --fr-title-card: 15px;
    --fr-pill: 12px;
    --fr-body: 13px;
    --fr-dense: 12px;
    --fr-caption: 11px;
  }
}

pacing
--fr-xs
--fr-sm
--fr-md
--fr-lg
--fr-xl
Radius
--fr-radius-sm
--fr-radius-md
--fr-radius-lg
--fr-pill-radius
Ombre
--fr-shadow-sm
--fr-shadow-md
Classi standard introdotte

Sono state create classi base fr-* da usare progressivamente:

.fr-title-primary
.fr-card
.fr-note
.fr-pill
.fr-pill-positive
.fr-pill-risk
.fr-text
.fr-section-stack
.fr-close-button

Queste classi rappresentano il nuovo linguaggio UI FRINGE.

Sezione campione migrata

È stata riscritta come prova standardizzata la funzione:

renderOpeningPositioningModule(module)

La sezione “Apertura del colloquio” ora usa il nuovo sistema fr-* per:

titolo principale
pulsante chiudi
note descrittive
card
sottosezioni
pillole positive/risk
testo standard
mobile layout
Esito prova desktop/mobile
Desktop

La nuova sezione risulta:

più coerente
più leggibile
più ordinata
meno caotica rispetto ai vecchi blocchi CSS/inline style
Mobile

La prima prova era ancora troppo “grande/gridata”.

È stata corretta riducendo i token mobile:

body a 13px
dense a 12px
caption a 11px
title section a 16px
title card a 15px

Dopo il passaggio, la sezione mobile è risultata molto più leggibile e più vicina a un prodotto reale.

Regola operativa da ora in avanti

Quando si crea o modifica una sezione del report PRO:

usare token --fr-*
usare classi fr-*
evitare nuovi inline style
verificare sempre:
desktop
mobile a larghezza 390px
non correggere più a tentativi locali se il problema riguarda stile generale
se serve un nuovo pattern UI, prima lo si definisce nello standard
Standard mobile di riferimento

Per test mobile usare Edge/Chrome DevTools:

Device mode
width: 390px
height: 844px
zoom: 100%

Controlli secondari:

360px
430px

Se regge 360 / 390 / 430, il responsive è considerato stabile.

# FRINGE UI STANDARD v1.0

## Principio generale

Da ora in avanti le nuove sezioni del report PRO devono usare lo standard UI FRINGE:

- niente dimensioni testo inventate localmente
- niente colori casuali
- niente inline style salvo casi eccezionali
- usare token `--fr-*`
- usare classi standard `fr-*`
- verificare sempre desktop + mobile 390px

---

## Mobile / Desktop

Desktop:
- più densità informativa
- sezioni leggibili anche aperte
- confronto visivo possibile

Mobile:
- una cosa per volta
- navigazione tramite chip orizzontali
- pannelli verticali apribili
- un solo pannello principale aperto alla volta
- evitare 2 colonne
- evitare scroll infinito non guidato

---

## Pattern standard per sezioni lunghe

Ogni sezione lunga deve avere:

1. Titolo principale
2. Summary descrittivo visibile
3. Barra chip orizzontale
4. Pannelli verticali corrispondenti
5. Un solo pannello aperto alla volta
6. Chip attiva evidenziata in giallo
7. Click sul titolo/pannello = apre/chiude
8. Scroll automatico accettabile ma non da rifinire a pixel ora

Pattern approvato su:
`renderOpeningPositioningModule`

---

## Standard chip navigazione

Chip inattiva:
- fondo chiaro/lilla
- bordo visibile
- testo blu scuro
- deve sembrare cliccabile

Chip attiva:
- fondo giallo
- testo scuro
- indica posizione corrente

---

## Standard priorità

Usare pallini dimensionali, NON legenda testuale e NON emoji.

Priorità alta:
- pallino rosso grande

Priorità media:
- pallino arancio medio

Da tenere presente:
- pallino grigio piccolo

CSS approvato:

```css
.weighted-item {
  display: grid !important;
  grid-template-columns: 24px minmax(0, 1fr) !important;
  gap: 8px !important;
  align-items: start !important;
  margin-top: 12px !important;
}

.weighted-priority-dot {
  display: inline-block;
  border-radius: 999px;
  margin-top: 4px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.45);
}

.weighted-priority-dot.high {
  width: 18px;
  height: 18px;
  background: #ef4444;
}

.weighted-priority-dot.mid {
  width: 15px;
  height: 15px;
  background: #f59e0b;
  margin-left: 1px;
}

.weighted-priority-dot.low {
  width: 11px;
  height: 11px;
  background: #94a3b8;
  margin-left: 3px;
}

.weighted-text {
  font-size: var(--fr-body) !important;
  line-height: 1.45 !important;
  font-weight: 700 !important;
  color: var(--fr-ink) !important;
}

@media (max-width: 640px) {
  .weighted-item {
    grid-template-columns: 24px minmax(0, 1fr) !important;
    gap: 8px !important;
  }

  .weighted-priority-dot.high {
    width: 17px;
    height: 17px;
  }

  .weighted-priority-dot.mid {
    width: 14px;
    height: 14px;
  }

  .weighted-priority-dot.low {
    width: 10px;
    height: 10px;
  }
}

function renderWeightedList(items = []) {
  return items.map((text, index) => {
    const level = index === 0 ? "high" : index === 1 ? "mid" : "low";

    return `
      <div class="weighted-item ${level}">
        <span class="weighted-priority-dot ${level}"></span>
        <span class="weighted-text">${escapeHtml(text)}</span>
      </div>
    `;
  }).join("");
}
