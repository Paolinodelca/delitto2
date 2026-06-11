# FRINGE — Junior Ops Test Kit

Questo kit serve a fare un test rapido su un profilo junior, senza dover ricordare quali file creare.

## File inclusi

- `fixtures/test_junior_ops/cv_junior_ops.txt`
- `fixtures/test_junior_ops/role_junior_product_ops.txt`
- `fixtures/test_junior_ops/answers_junior_ops.json`
- `fixtures/test_junior_ops/test_meta.json`
- `scripts/setup_test_junior_ops.js`
- `scripts/check_junior_ops_report.js`

## Come usarlo

1. Copia le cartelle `fixtures/` e `scripts/` nella root del progetto `fringe-interview`.

2. Da terminale, dentro la root del progetto, lancia:

```bash
node scripts/setup_test_junior_ops.js
```

3. Ora hai i file fixture in:

```bash
fixtures/test_junior_ops/
```

4. Usa questi input nel tuo flusso esistente:
   - CV: `fixtures/test_junior_ops/cv_junior_ops.txt`
   - JD/ruolo: `fixtures/test_junior_ops/role_junior_product_ops.txt`
   - risposte simulate: `fixtures/test_junior_ops/answers_junior_ops.json`

5. Dopo aver generato il report PRO V2, lancia:

```bash
node scripts/check_junior_ops_report.js
```

Lo script cerca automaticamente un report in:
- `tmp/pro-report-v2/pro_report_v2.json`
- `tmp/app-mvp-session/fringe_interview_mvp_session_result.json`
- `tmp/demo-reference/demo_reference_case_result.json`

e stampa:
- Operational Action Plan
- summary risposte
- missing signals
- CV signals

## Nota importante

Questo kit NON modifica il motore FRINGE. Organizza solo fixture e controllo rapido.
Per collegarlo automaticamente alla pipeline completa potrebbe servire adattare uno degli script già esistenti, probabilmente:
- `scripts/test_run_fringe_interview_mvp_session.js`
- oppure `scripts/test_render_pro_report_v2.js`
