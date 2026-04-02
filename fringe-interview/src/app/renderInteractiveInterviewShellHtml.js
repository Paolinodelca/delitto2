function safeJsonForHtml(value) {
  return JSON.stringify(value ?? {}, null, 2).replace(/</g, "\u003c");
}

export function renderInteractiveInterviewShellHtml({
  sessionResult = {},
  shellOptions = {}
} = {}) {
  const payloadJson = safeJsonForHtml(sessionResult);
  const shellOptionsJson = safeJsonForHtml(shellOptions);

  return `
<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>FRINGE Interview Setup</title>

<style>
  :root {
    --bg: #f4f6fb;
    --card: #ffffff;
    --text: #1f2937;
    --muted: #5b6472;
    --line: #cfd8e3;
    --line-strong: #94a3b8;
    --shadow: 0 10px 24px rgba(15, 23, 42, 0.08);

    --header: #9a3412;
    --header-2: #c2410c;

    --prep-bg: #fff7ed;
    --prep-border: #fdba74;
    --prep-active: #ea580c;
    --prep-text: #7c2d12;

    --free-bg: #fffbeb;
    --free-border: #f59e0b;
    --free-active: #d97706;

    --pro-bg: #f5f3ff;
    --pro-border: #c4b5fd;
    --pro-active: #7c3aed;
    --pro-text: #4c1d95;

    --premium-bg: #faf5ff;
    --premium-border: #d8b4fe;
    --premium-active: #9333ea;
    --premium-text: #581c87;

    --ok-bg: #ecfdf3;
    --ok-border: #86efac;
    --ok-text: #166534;

    --warn-bg: #fff7ed;
    --warn-border: #fdba74;
    --warn-text: #9a3412;

    --soft: #f8fafc;
  }

  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--text);
    font-family: Arial, Helvetica, sans-serif;
  }

  body {
    min-height: 100vh;
  }

  .top-shell-wrap {
    position: sticky;
    top: 0;
    z-index: 100;
    padding-top: 0;
    background: transparent;
  }

.top-shell {
  max-width: 1180px;
  margin: 0 auto;
  background: linear-gradient(180deg, #4a1708 0%, #7c2d12 34%, #9a3412 66%, #c2410c 100%);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  border-radius: 0 0 18px 18px;
}

  .top-shell-inner {
    padding: 10px 18px 12px 18px;
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    color: white;
    margin-bottom: 10px;
  }

  .title-main {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .title-sub {
    font-size: 15px;
    color: rgba(255,255,255,0.96);
    margin-top: 4px;
    font-weight: 700;
    line-height: 1.35;
  }

  .title-help {
    font-size: 13px;
    color: rgba(255,255,255,0.88);
    margin-top: 6px;
    line-height: 1.35;
    font-weight: 600;
  }

  .nav-strip-wrap {
    position: relative;
  }

  .nav-strip {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
    align-items: stretch;
  }

  .nav-scroll-hint {
    display: none;
  }

  .nav-btn,
  .nav-link {
    position: relative;
    display: block;
    min-height: 92px;
    padding: 12px 58px 12px 12px;
    border-radius: 15px;
    overflow: hidden;
    background: white;
    border: 2px solid #d8e0ea;
    text-align: left;
    box-shadow:
      0 8px 18px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255,255,255,0.9);
    transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background 0.16s ease;
  }

  .nav-btn:hover,
  .nav-link:hover {
    transform: translateY(-1px);
  }

  .nav-btn {
    cursor: pointer;
  }

  .nav-link {
    text-decoration: none;
    color: inherit;
  }

  .nav-btn.prep,
  .nav-link.prep {
    background: linear-gradient(180deg, #ffffff 0%, var(--prep-bg) 100%);
    border-color: var(--prep-border);
  }

  .nav-btn.free,
  .nav-link.free {
    background: linear-gradient(180deg, #ffffff 0%, #fffaf0 100%);
    border-color: var(--free-border);
  }

  .nav-btn.pro,
  .nav-link.pro {
    background: linear-gradient(180deg, #ffffff 0%, var(--pro-bg) 100%);
    border-color: var(--pro-border);
  }

  .nav-btn.premium,
  .nav-link.premium {
    background: linear-gradient(180deg, #ffffff 0%, var(--premium-bg) 100%);
    border-color: var(--premium-border);
  }

  .nav-btn.active,
  .nav-link.active {
    transform: translateY(-1px);
    border-width: 3px;
    border-color: #111827;
    box-shadow:
      0 18px 28px rgba(15, 23, 42, 0.18),
      0 0 0 4px rgba(255,255,255,0.60),
      0 0 0 7px rgba(17,24,39,0.14),
      inset 0 1px 0 rgba(255,255,255,0.95);
  }

  .nav-btn.prep.active,
  .nav-link.prep.active {
    border-color: var(--prep-active);
    box-shadow:
      0 18px 28px rgba(15, 23, 42, 0.18),
      0 0 0 4px rgba(255,255,255,0.62),
      0 0 0 7px rgba(234,88,12,0.22),
      inset 0 1px 0 rgba(255,255,255,0.95);
  }

  .nav-btn.free.active,
  .nav-link.free.active {
    border-color: var(--free-active);
    box-shadow:
      0 18px 28px rgba(15, 23, 42, 0.18),
      0 0 0 4px rgba(255,255,255,0.62),
      0 0 0 7px rgba(217,119,6,0.22),
      inset 0 1px 0 rgba(255,255,255,0.95);
  }

  .nav-btn.pro.active,
  .nav-link.pro.active {
    border-color: var(--pro-active);
    box-shadow:
      0 18px 28px rgba(15, 23, 42, 0.18),
      0 0 0 4px rgba(255,255,255,0.62),
      0 0 0 7px rgba(124,58,237,0.22),
      inset 0 1px 0 rgba(255,255,255,0.95);
  }

  .nav-btn.premium.active,
  .nav-link.premium.active {
    border-color: var(--premium-active);
    box-shadow:
      0 18px 28px rgba(15, 23, 42, 0.18),
      0 0 0 4px rgba(255,255,255,0.62),
      0 0 0 7px rgba(147,51,234,0.22),
      inset 0 1px 0 rgba(255,255,255,0.95);
  }

  .nav-row {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 10px;
    align-items: start;
  }

  .nav-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 1px;
  }

.nav-index {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 999px;
  background: #111827;
  color: white;
  font-size: 14px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
  text-shadow: 0 0 1px rgba(255,255,255,0.22);
  letter-spacing: -0.02em;
  margin-top: 1px;
}

  .nav-btn.prep.active .nav-index,
  .nav-link.prep.active .nav-index {
    background: var(--prep-active);
  }

  .nav-btn.free.active .nav-index,
  .nav-link.free.active .nav-index {
    background: var(--free-active);
  }

  .nav-btn.pro.active .nav-index,
  .nav-link.pro.active .nav-index {
    background: var(--pro-active);
  }

  .nav-btn.premium.active .nav-index,
  .nav-link.premium.active .nav-index {
    background: var(--premium-active);
  }

  .nav-title {
    font-size: 16px;
    font-weight: 900;
    line-height: 1.04;
    color: #111827;
    padding-right: 2px;
  }

  .nav-desc {
    font-size: 12px;
    font-weight: 800;
    line-height: 1.2;
    color: #475467;
    margin-top: 4px;
    padding-right: 2px;
  }

  .prep-checks {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px 8px;
    margin-top: 8px;
    margin-left: -28px;
    width: calc(100% + 28px);
  }

  .prep-check {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .prep-dot {
    width: 10px;
    height: 10px;
    min-width: 10px;
    border-radius: 999px;
    background: #d1d5db;
    border: 1px solid #aeb7c2;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.65);
  }

  .prep-dot.ok {
    background: #16a34a;
    border-color: #166534;
  }

  .prep-check-label {
    font-size: 10px;
    font-weight: 900;
    color: #475467;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-side-tag {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 36px;
    border-radius: 14px 0 0 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: white;
    text-shadow: 0 1px 1px rgba(0,0,0,0.18);
    box-shadow: inset 1px 0 0 rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.18);
  }

  .nav-side-tag.free { background: linear-gradient(180deg, #22c55e 0%, #15803d 100%); }
  .nav-side-tag.pro { background: linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%); }
  .nav-side-tag.premium { background: linear-gradient(180deg, #a855f7 0%, #7e22ce 100%); }

 .nav-lock {
  position: absolute;
  right: 0;
  bottom: 5px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  filter: drop-shadow(0 1px 0 rgba(255,255,255,0.45));
  pointer-events: none;
}

  .page {
    max-width: 1180px;
    margin: 16px auto 0 auto;
    padding: 0 18px 28px 18px;
  }

  .panel {
    display: none;
  }

  .panel.active {
    display: block;
  }

  .card {
    background: var(--card);
    border: 2px solid var(--line);
    border-radius: 16px;
    padding: 18px;
    box-shadow: var(--shadow);
  }

  .card + .card {
    margin-top: 16px;
  }

  .card.emphasis {
    border-color: #f59e0b;
    background: linear-gradient(180deg, #fffdf8 0%, #fff7ed 100%);
  }

  .card.paid {
    border-color: #c4b5fd;
    background: linear-gradient(180deg, #ffffff 0%, #faf5ff 100%);
  }

  .card.paid-premium {
    border-color: #d8b4fe;
    background: linear-gradient(180deg, #ffffff 0%, #fdf4ff 100%);
  }

  .mode-highlight {
    margin-top: 16px;
    padding: 14px;
    border-radius: 14px;
    border: 2px solid #fcd34d;
    background: linear-gradient(180deg, #fffef7 0%, #fff7ed 100%);
  }

  .mode-highlight-title {
    font-size: 14px;
    font-weight: 900;
    color: #9a3412;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .mode-highlight-text {
    font-size: 14px;
    line-height: 1.5;
    color: #7c2d12;
    font-weight: 700;
  }

  .kicker {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #6b7280;
    margin-bottom: 8px;
  }

  h1, h2, h3 {
    margin: 0;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .intro {
    font-size: 16px;
    line-height: 1.48;
    color: #374151;
    font-weight: 600;
  }

  .field-grid {
    display: grid;
    gap: 14px;
    margin-top: 16px;
  }

  .field-box {
    border: 2px solid var(--line);
    border-radius: 14px;
    padding: 14px;
    background: var(--soft);
  }

  .field-box.complete {
    border-color: var(--ok-border);
    background: var(--ok-bg);
  }

  .field-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
  }

  .field-title {
    font-size: 15px;
    font-weight: 800;
  }

  .field-state {
    font-size: 11px;
    font-weight: 900;
    border-radius: 999px;
    padding: 4px 8px;
    border: 1px solid transparent;
  }

  .field-state.ok {
    background: var(--ok-bg);
    border-color: var(--ok-border);
    color: var(--ok-text);
  }

  .field-state.missing {
    background: var(--warn-bg);
    border-color: var(--warn-border);
    color: var(--warn-text);
  }

  label {
    display: block;
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 6px;
  }

  input, textarea, select {
    width: 100%;
    border: 2px solid #cbd5e1;
    border-radius: 10px;
    padding: 11px 12px;
    font: inherit;
    background: white;
    color: #111827;
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }

  .help {
    margin-top: 6px;
    font-size: 13px;
    color: var(--muted);
  }

  .mini-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 16px;
  }

  .mini-card {
    border: 2px solid var(--line);
    border-radius: 14px;
    background: white;
    padding: 14px;
  }

  .mini-card-title {
    font-size: 13px;
    color: #6b7280;
    font-weight: 800;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .mini-card-value {
    font-size: 16px;
    font-weight: 800;
    color: #111827;
  }

  .prep-next-hint {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #9a3412;
  }

  .prep-next-hint.ok {
    color: #166534;
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }

  .demo-section-title {
    margin-top: 14px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #7c2d12;
  }

  .demo-button {
    width: 100%;
    border: 2px solid #d8dee8;
    background: #ffffff;
    border-radius: 12px;
    padding: 10px 11px;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.05);
  }

  .demo-button:hover {
    border-color: #f59e0b;
    background: #fffaf2;
  }

.demo-button-title {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
  line-height: 1.18;
}

  .demo-button-desc {
    margin-top: 3px;
    font-size: 12px;
    font-weight: 700;
    color: #475467;
    line-height: 1.25;
  }

  .cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }

  .cta {
    appearance: none;
    border: 0;
    border-radius: 12px;
    padding: 12px 16px;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    background: var(--header);
    color: white;
    box-shadow: 0 8px 18px rgba(154, 52, 18, 0.18);
  }

  .cta.secondary {
    background: white;
    color: #7c2d12;
    border: 2px solid #fdba74;
    box-shadow: none;
  }

  .sim-box {
    border: 2px solid var(--line);
    border-radius: 14px;
    background: white;
    padding: 16px;
    margin-top: 16px;
  }

  .sim-box-title {
    font-size: 15px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .sim-note {
    font-size: 15px;
    line-height: 1.45;
    color: #374151;
  }

  .locked-title {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 10px;
  }

  .locked-text {
    font-size: 15px;
    line-height: 1.55;
    color: #374151;
  }

  .locked-highlight {
    margin-top: 12px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(255,255,255,0.84);
    border: 2px dashed #cbd5e1;
    font-size: 14px;
    line-height: 1.5;
  }

  .locked-highlight strong {
    color: #111827;
  }

  .footer-note {
    margin-top: 18px;
    font-size: 13px;
    color: #6b7280;
    text-align: center;
  }

  @media (max-width: 1120px) {
    .mini-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .title-row {
      flex-direction: column;
      align-items: stretch;
      margin-bottom: 6px;
    }

    .top-shell-inner {
      padding: 8px 10px 9px 10px;
    }

    .page {
      padding: 0 12px 24px 12px;
    }

    .title-main {
      font-size: 15px;
    }

    .title-sub {
      font-size: 12px;
      margin-top: 3px;
      line-height: 1.2;
    }

    .title-help {
      font-size: 11px;
      margin-top: 4px;
      line-height: 1.2;
    }

    .nav-strip-wrap {
      padding: 0 22px;
      margin: 0 -10px;
    }

    .nav-strip {
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
      gap: 8px;
      padding: 2px 1px 6px 1px;
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
    }

    .nav-strip::-webkit-scrollbar {
      height: 6px;
    }

    .nav-strip::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.35);
      border-radius: 999px;
    }

    .nav-scroll-hint {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(226,232,240,0.92);
      font-size: 42px;
      font-weight: 900;
      pointer-events: none;
      z-index: 2;
      text-shadow: 0 1px 1px rgba(0,0,0,0.16);
      line-height: 1;
    }

    .nav-scroll-hint.left {
      left: -2px;
    }

    .nav-scroll-hint.right {
      right: -2px;
    }

    .nav-btn,
    .nav-link {
      flex: 0 0 168px;
      min-height: 84px;
      padding: 10px 46px 10px 10px;
      border-radius: 13px;
    }

    .nav-btn.active,
    .nav-link.active {
      border-width: 3px;
      transform: none;
      box-shadow:
        0 12px 22px rgba(0,0,0,0.16),
        0 0 0 3px rgba(255,255,255,0.62),
        0 0 0 6px rgba(17,24,39,0.15),
        inset 0 1px 0 rgba(255,255,255,0.95);
    }

    .nav-btn.prep.active,
    .nav-link.prep.active {
      box-shadow:
        0 12px 22px rgba(0,0,0,0.16),
        0 0 0 3px rgba(255,255,255,0.62),
        0 0 0 6px rgba(234,88,12,0.22),
        inset 0 1px 0 rgba(255,255,255,0.95);
    }

    .nav-btn.free.active,
    .nav-link.free.active {
      box-shadow:
        0 12px 22px rgba(0,0,0,0.16),
        0 0 0 3px rgba(255,255,255,0.62),
        0 0 0 6px rgba(217,119,6,0.22),
        inset 0 1px 0 rgba(255,255,255,0.95);
    }

    .nav-btn.pro.active,
    .nav-link.pro.active {
      box-shadow:
        0 12px 22px rgba(0,0,0,0.16),
        0 0 0 3px rgba(255,255,255,0.62),
        0 0 0 6px rgba(124,58,237,0.22),
        inset 0 1px 0 rgba(255,255,255,0.95);
    }

    .nav-btn.premium.active,
    .nav-link.premium.active {
      box-shadow:
        0 12px 22px rgba(0,0,0,0.16),
        0 0 0 3px rgba(255,255,255,0.62),
        0 0 0 6px rgba(147,51,234,0.22),
        inset 0 1px 0 rgba(255,255,255,0.95);
    }

   .nav-row {
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  align-items: start;
}

    .nav-copy {
      justify-content: flex-start;
      padding-top: 2px;
    }

.nav-index {
  display: none;
}

    .nav-title {
      font-size: 14px;
      font-weight: 900;
      line-height: 1.05;
    }

.nav-desc {
  font-size: 11px;
  font-weight: 800;
  line-height: 1.15;
  margin-top: 4px;
  width: 100%;
}
.prep-checks {
  gap: 5px 6px;
  margin-top: 7px;
  margin-left: 0;
  width: 100%;
}
    .prep-check {
      gap: 5px;
      align-items: center;
    }

    .prep-dot {
      width: 9px;
      height: 9px;
      min-width: 9px;
    }

    .prep-check-label {
      font-size: 10px;
      font-weight: 900;
      color: #374151;
    }

 .nav-side-tag {
  width: 24px;
  border-radius: 10px 0 0 10px;
  font-size: 8px;
  letter-spacing: 0.08em;
}

.nav-btn::after,
.nav-link::after {
  position: absolute;
  top: 6px;
  right: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 1px 1px rgba(0,0,0,0.2);
  background: rgba(17,24,39,0.28);
  border: 1px solid rgba(255,255,255,0.35);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
}


.nav-btn.prep::after,
.nav-link.prep::after { content: "1"; }
.nav-btn.free[data-panel="simulation"]::after { content: "2"; }
.nav-link.free[href="./fringe_interview_interactive_shell_report.html"]::after { content: "3"; }
.nav-btn.pro::after { content: "4"; }
.nav-btn.premium::after { content: "5"; }


.nav-lock {
  bottom: 8px;
  width: 24px;
  font-size: 14px;
}
    .card {
      padding: 14px;
      border-radius: 14px;
    }

    h2 {
      font-size: 20px;
    }

    h3 {
      font-size: 16px;
    }

    .intro {
      font-size: 14px;
      line-height: 1.4;
    }

    .field-box,
    .mini-card,
    .sim-box,
    .demo-button {
      padding: 12px;
      border-radius: 12px;
    }

    .demo-grid {
      grid-template-columns: 1fr;
    }

    .demo-section-title {
      font-size: 11px;
    }

    .cta {
      width: 100%;
      justify-content: center;
    }
  }

@media (max-height: 520px) and (orientation: landscape) {
  .nav-strip-wrap {
    padding: 0 22px;
    margin: 0 -10px;
  }

  .nav-strip {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    gap: 8px;
    padding: 2px 1px 6px 1px;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
  }

  .nav-scroll-hint {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 22px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(226,232,240,0.92);
    font-size: 42px;
    font-weight: 900;
    pointer-events: none;
    z-index: 2;
    text-shadow: 0 1px 1px rgba(0,0,0,0.16);
    line-height: 1;
  }

  .nav-scroll-hint.left {
    left: -2px;
  }

  .nav-scroll-hint.right {
    right: -2px;
  }

  .nav-btn,
  .nav-link {
    flex: 0 0 168px;
    min-height: 84px;
    padding: 10px 42px 10px 10px;
    border-radius: 13px;
  }

  .nav-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    align-items: start;
  }

  .nav-index {
    display: none;
  }

  .nav-copy {
    justify-content: flex-start;
    padding-top: 2px;
  }

  .nav-title {
    font-size: 14px;
    font-weight: 900;
    line-height: 1.05;
  }

  .nav-desc {
    font-size: 11px;
    font-weight: 800;
    line-height: 1.15;
    margin-top: 4px;
    width: 100%;
  }

  .prep-checks {
    gap: 5px 6px;
    margin-top: 7px;
    margin-left: 0;
    width: 100%;
  }

  .prep-dot {
    width: 9px;
    height: 9px;
    min-width: 9px;
  }

  .prep-check-label {
    font-size: 10px;
    font-weight: 900;
    color: #374151;
  }

  .nav-side-tag {
    width: 24px;
    border-radius: 10px 0 0 10px;
    font-size: 8px;
    letter-spacing: 0.08em;
  }

  .nav-lock {
    bottom: 8px;
    width: 24px;
    font-size: 14px;
  }

  .nav-btn::after,
  .nav-link::after {
    top: 6px;
    right: 3px;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 11px;
    font-weight: 900;
    line-height: 1;
    text-shadow: 0 1px 1px rgba(0,0,0,0.2);
    background: rgba(17,24,39,0.28);
    border: 1px solid rgba(255,255,255,0.35);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
  }
}



</style>
</head>

<body>
  <div class="top-shell-wrap">
    <div class="top-shell">
      <div class="top-shell-inner">
        <div class="title-row">
          <div>
            <div class="title-main">CONFIGURAZIONE DELLA SIMULAZIONE</div>
            <div class="title-sub">Un flusso semplice: prepari i dati, scegli il formato del colloquio, lanci la simulazione e poi apri il report.</div>
            <div class="title-help">Seleziona dalla barra: 1) preparazione, 2) simulazione, 3) report. Le aree PRO e PREMIUM mostrano i livelli di supporto avanzato.</div>
          </div>
        </div>
        <div class="nav-strip-wrap">
          <div class="nav-scroll-hint left">‹</div>
          <div class="nav-scroll-hint right">›</div>
          <div class="nav-strip">
            <button class="nav-btn prep active" type="button" data-panel="prep">
              <span class="nav-side-tag free">FREE</span>
              <div class="nav-row">
                <span class="nav-index prep">1</span>
                <div class="nav-copy">
                  <div class="nav-title">Preparazione</div>
                  <div class="nav-desc">Dati essenziali</div>
                  <div class="prep-checks">
                    <div class="prep-check"><span class="prep-dot" id="dotRole"></span><span class="prep-check-label">Ruolo</span></div>
                    <div class="prep-check"><span class="prep-dot" id="dotCv"></span><span class="prep-check-label">CV</span></div>
                    <div class="prep-check"><span class="prep-dot" id="dotJd"></span><span class="prep-check-label">Job Descr.</span></div>
                    <div class="prep-check"><span class="prep-dot ok" id="dotLang"></span><span class="prep-check-label">Lingua</span></div>
                  </div>
                </div>
              </div>
            </button>

            <button class="nav-btn free" type="button" data-panel="simulation">
              <span class="nav-side-tag free">FREE</span>
              <div class="nav-row">
                <span class="nav-index free">2</span>
                <div class="nav-copy">
                  <div class="nav-title">Simulazione</div>
                  <div class="nav-desc">Controllo finale<br>e avvio</div>
                </div>
              </div>
            </button>

            <a class="nav-link free" href="./fringe_interview_interactive_shell_report.html">
              <span class="nav-side-tag free">FREE</span>
              <div class="nav-row">
                <span class="nav-index free">3</span>
                <div class="nav-copy">
                  <div class="nav-title">Report</div>
                  <div class="nav-desc">Apri il report<br>della simulazione</div>
                </div>
              </div>
            </a>

            <button class="nav-btn pro" type="button" data-panel="pro">
              <span class="nav-side-tag pro">PRO</span>
              <div class="nav-row">
                <span class="nav-index pro">4</span>
                <div class="nav-copy">
                  <div class="nav-title">Training</div>
                  <div class="nav-desc">Feedback mirato<br>e guida</div>
                </div>
              </div>
              <div class="nav-lock">🔒</div>
            </button>

            <button class="nav-btn premium" type="button" data-panel="premium">
              <span class="nav-side-tag premium">PREMIUM</span>
              <div class="nav-row">
                <span class="nav-index premium">5</span>
                <div class="nav-copy">
                  <div class="nav-title">Selezione</div>
                  <div class="nav-desc">Visione recruiter<br>e CV avanzato</div>
                </div>
              </div>
              <div class="nav-lock">🔒</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <main class="page">
    <section class="panel active" id="panel_prep">
      <div class="card emphasis">
        <div class="kicker">Step 1 · Preparazione</div>
        <h2>Inserisci i dati per iniziare</h2>
        <div class="intro">
  Per partire davvero servono il CV e il ruolo target.<br>
  La job description non è obbligatoria, ma migliora la qualità della simulazione e rende il feedback più centrato.
</div>

        <div class="field-grid">
          <div class="field-box" id="boxRole">
            <div class="field-head">
              <div class="field-title">Ruolo target</div>
              <div class="field-state missing" id="stateRole">Da inserire</div>
            </div>
            <label for="targetRoleInput">Inserisci il ruolo</label>
            <input id="targetRoleInput" type="text" placeholder="Es. Product Operations Manager" />
            <div class="help">Serve per orientare simulazione, domande e lettura finale del profilo.</div>
          </div>

          <div class="field-box" id="boxCv">
            <div class="field-head">
              <div class="field-title">CV</div>
              <div class="field-state missing" id="stateCv">Da inserire</div>
            </div>
            <label for="cvTextInput">Incolla il CV</label>
            <textarea id="cvTextInput" rows="8" placeholder="Incolla qui il CV oppure un estratto significativo..."></textarea>
            <div class="help">Qui metti il contenuto che useremo per capire esperienza, responsabilità, strumenti e segnali di seniority.</div>
          </div>

          <div class="field-box" id="boxJd">
            <div class="field-head">
              <div class="field-title">Job description</div>
              <div class="field-state missing" id="stateJd">Consigliata</div>
            </div>
            <label for="jdTextInput">Incolla la job description</label>
            <textarea id="jdTextInput" rows="6" placeholder="Incolla qui la job description o i requisiti principali del ruolo..."></textarea>
            <div class="help">Aiuta a rendere più preciso il fit col ruolo e più credibili le domande della simulazione.</div>
          </div>
        </div>

        <div class="mini-grid">
          <div class="mini-card">
            <div class="mini-card-title">Lingua interfaccia</div>
            <select id="uiLocaleSelect">
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="mini-card">
            <div class="mini-card-title">Lingua colloquio</div>
            <select id="sessionLocaleSelect">
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div class="mini-grid">
          <div class="mini-card">
            <div class="mini-card-title">Formato colloquio</div>
            <select id="interviewLengthModeSelect">
              <option value="short">Quick Interview · breve e incisiva</option>
              <option value="standard" selected>Standard Interview · equilibrio</option>
              <option value="deep">Deep Interview · più esplorazione</option>
            </select>
            <div class="help" id="interviewLengthModeHelp">
              Versione rapida: poche domande ma con un affondo adattivo se emerge una debolezza forte.
            </div>
          </div>

          <div class="mini-card">
            <div class="mini-card-title">Modalità risposta</div>
            <select id="inputModeSelect">
              <option value="text">Text</option>
              <option value="voice">Voice ready</option>
            </select>
          </div>
        </div>

        <div class="mini-grid">
          <div class="mini-card">
            <div class="mini-card-title">Stato preparazione</div>
            <div class="mini-card-value" id="statusPrepValue">Da completare</div>
            <div class="prep-next-hint" id="prepNextHint">Completa almeno CV e ruolo target</div>
          </div>

          <div class="mini-card">
            <div class="mini-card-title">Formato selezionato</div>
            <div class="mini-card-value" id="selectedModeValue">Standard Interview</div>
            <div class="help" id="selectedModeSubtext">Equilibrio tra rapidità, copertura e approfondimento.</div>
          </div>
        </div>

        <div class="mode-highlight">
          <div class="mode-highlight-title">Suggerimento pratico</div>
          <div class="mode-highlight-text" id="modeHighlightText">
            Quick Interview è la scelta migliore per una prova veloce o una demo: resta breve, ma se trova una debolezza importante stringe comunque il punto con un approfondimento mirato.
          </div>
        </div>

        <div class="demo-section-title">Carica dati essenziali di esempio</div>
        <div class="demo-grid">
          <button class="demo-button" type="button" data-demo="pom">
            <div class="demo-button-title">Product Operations Manager</div>
            <div class="demo-button-desc">Profilo orientato a processi, stakeholder e coordinamento cross-funzionale.</div>
          </button>
          <button class="demo-button" type="button" data-demo="pm">
            <div class="demo-button-title">Project Manager</div>
            <div class="demo-button-desc">Scenario centrato su delivery, priorità, coordinamento e gestione avanzamento.</div>
          </button>
          <button class="demo-button" type="button" data-demo="ops">
            <div class="demo-button-title">Operations Manager</div>
            <div class="demo-button-desc">Esempio più vicino a organizzazione operativa, efficienza e miglioramento continuo.</div>
          </button>
          <button class="demo-button" type="button" data-demo="ba">
            <div class="demo-button-title">Business Analyst</div>
            <div class="demo-button-desc">Profilo basato su analisi, reporting, dashboard e lettura dati per decisioni.</div>
          </button>
        </div>
      </div>
    </section>

    <section class="panel" id="panel_simulation">
      <div class="card emphasis">
        <div class="kicker">Step 2 · Simulazione</div>
        <h2>Controllo finale e avvio</h2>
        <div class="intro">
          Quando CV e ruolo target sono presenti, la simulazione può partire. La job description resta fortemente consigliata, ma non blocca l’avvio.
        </div>

        <div class="sim-box">
          <div class="sim-box-title">Prontezza attuale</div>
          <div class="sim-note" id="simulationReadinessText">
            Per abilitare davvero la simulazione servono almeno CV e ruolo target.
          </div>
        </div>

        <div class="mini-grid">
          <div class="mini-card">
            <div class="mini-card-title">Ruolo target</div>
            <div class="mini-card-value" id="simRoleValue">Non inserito</div>
          </div>
          <div class="mini-card">
            <div class="mini-card-title">CV</div>
            <div class="mini-card-value" id="simCvValue">Non inserito</div>
          </div>
          <div class="mini-card">
            <div class="mini-card-title">Job description</div>
            <div class="mini-card-value" id="simJdValue">Non inserita</div>
          </div>
          <div class="mini-card">
            <div class="mini-card-title">Lingua colloquio</div>
            <div class="mini-card-value" id="simLangValue">Italiano</div>
          </div>
          <div class="mini-card">
            <div class="mini-card-title">Formato</div>
            <div class="mini-card-value" id="simModeValue">Standard Interview</div>
          </div>
          <div class="mini-card">
            <div class="mini-card-title">Input</div>
            <div class="mini-card-value" id="simInputModeValue">Text</div>
          </div>
        </div>

        <div class="cta-row">
          <button class="cta" id="fakeStartButton" type="button">Avvia simulazione</button>
        </div>
      </div>
    </section>

    <section class="panel" id="panel_pro">
      <div class="card paid">
        <div class="kicker">PRO · Training guidato</div>
        <div class="locked-title">Allenamento più leggibile, concreto e mirato</div>
        <div class="locked-text">
          Il livello PRO non aggiunge solo più testo: aggiunge una guida ragionata. Ti aiuta a capire cosa cercava la domanda, che cosa è davvero emerso nella risposta e dove conviene intervenire per migliorare.
        </div>
        <div class="locked-highlight">
          <strong>Con PRO puoi ottenere:</strong><br>
          analisi risposta per risposta, focus sui punti deboli ricorrenti, suggerimenti di riformulazione e una lettura più utile per prepararti davvero.
        </div>
      </div>
    </section>

    <section class="panel" id="panel_premium">
      <div class="card paid-premium">
        <div class="kicker">PREMIUM · Lettura selezione</div>
        <div class="locked-title">Una visione più vicina a quella di chi seleziona</div>
        <div class="locked-text">
          Il livello PREMIUM include tutto il PRO e aggiunge una lettura più vicina a una valutazione reale: posizionamento, coerenza del percorso, tenuta del CV e percezione complessiva del candidato.
        </div>
        <div class="locked-highlight">
          <strong>Con PREMIUM puoi ottenere:</strong><br>
          lettura recruiter-oriented, osservazioni più severe sul CV, segnali di rischio, punti forti sintetici e supporto più concreto sul modo in cui il profilo viene percepito.
        </div>
      </div>
    </section>

    <div class="footer-note">
      Demo shell locale · FRINGE Interview setup
    </div>
  </main>

  <script id="session-result-json" type="application/json">${payloadJson}</script>
  <script id="shell-options-json" type="application/json">${shellOptionsJson}</script>
  <script>
    const sessionResult = JSON.parse(document.getElementById("session-result-json").textContent || "{}");
    const shellOptions = JSON.parse(document.getElementById("shell-options-json").textContent || "{}");

    const defaultIntakeState = {
      targetRole: sessionResult.targetRole || "",
      cvText: sessionResult.cvText || "",
      jdText: sessionResult.jobDescriptionText || "",
      uiLocale: sessionResult.uiLocale || "it",
      sessionLocale: sessionResult.sessionLocale || "it",
      interviewLengthMode: sessionResult.interviewLengthMode || "standard",
      inputMode: sessionResult.inputMode || "text"
    };

    const demoPresets = {
      pom: {
        targetRole: "Product Operations Manager",
        cvText: "Business Analyst con 6 anni di esperienza in contesti digitali, reporting, dashboard, stakeholder management, analisi SQL/Tableau e coordinamento tra team prodotto e operations.",
        jdText: "Ricerchiamo una figura capace di coordinare processi cross-funzionali, lavorare con team prodotto e operations, gestire priorità, stakeholder e miglioramento continuo.",
        uiLocale: "it",
        sessionLocale: "it",
        interviewLengthMode: "short",
        inputMode: "text"
      },
      pm: {
        targetRole: "Project Manager",
        cvText: "Project coordinator con 7 anni di esperienza nella gestione piani di lavoro, avanzamenti, dipendenze, stakeholder interni, fornitori e monitoraggio deliverable.",
        jdText: "Cerchiamo un Project Manager capace di guidare planning, execution, risk tracking, comunicazione interfunzionale e rispetto delle milestone.",
        uiLocale: "it",
        sessionLocale: "it",
        interviewLengthMode: "standard",
        inputMode: "text"
      },
      ops: {
        targetRole: "Operations Manager",
        cvText: "Responsabile operations con esperienza in organizzazione flussi, KPI operativi, turni, qualità, riduzione inefficienze e coordinamento team di processo.",
        jdText: "La posizione richiede presidio dei processi, miglioramento continuo, gestione criticità operative, lettura KPI e capacità di coordinare più funzioni.",
        uiLocale: "it",
        sessionLocale: "it",
        interviewLengthMode: "standard",
        inputMode: "text"
      },
      ba: {
        targetRole: "Business Analyst",
        cvText: "Analista con esperienza su reporting, raccolta requisiti, strutturazione dati, insight per decisioni, dashboard e supporto al business in ambienti SaaS.",
        jdText: "Cerchiamo un Business Analyst capace di tradurre esigenze business in analisi chiare, dashboard utili, KPI coerenti e raccomandazioni operative.",
        uiLocale: "it",
        sessionLocale: "it",
        interviewLengthMode: "short",
        inputMode: "text"
      }
    };

    const intakeState = { ...defaultIntakeState };

    const panelMap = {
      prep: document.getElementById("panel_prep"),
      simulation: document.getElementById("panel_simulation"),
      pro: document.getElementById("panel_pro"),
      premium: document.getElementById("panel_premium")
    };

    const navButtons = Array.from(document.querySelectorAll(".nav-btn[data-panel]"));

    const targetRoleInput = document.getElementById("targetRoleInput");
    const cvTextInput = document.getElementById("cvTextInput");
    const jdTextInput = document.getElementById("jdTextInput");
    const uiLocaleSelect = document.getElementById("uiLocaleSelect");
    const sessionLocaleSelect = document.getElementById("sessionLocaleSelect");
    const interviewLengthModeSelect = document.getElementById("interviewLengthModeSelect");
    const inputModeSelect = document.getElementById("inputModeSelect");

    const boxRole = document.getElementById("boxRole");
    const boxCv = document.getElementById("boxCv");
    const boxJd = document.getElementById("boxJd");
    const stateRole = document.getElementById("stateRole");
    const stateCv = document.getElementById("stateCv");
    const stateJd = document.getElementById("stateJd");

    const dotRole = document.getElementById("dotRole");
    const dotCv = document.getElementById("dotCv");
    const dotJd = document.getElementById("dotJd");

    const statusPrepValue = document.getElementById("statusPrepValue");
    const prepNextHint = document.getElementById("prepNextHint");

    const selectedModeValue = document.getElementById("selectedModeValue");
    const selectedModeSubtext = document.getElementById("selectedModeSubtext");
    const interviewLengthModeHelp = document.getElementById("interviewLengthModeHelp");
    const modeHighlightText = document.getElementById("modeHighlightText");

    const simRoleValue = document.getElementById("simRoleValue");
    const simCvValue = document.getElementById("simCvValue");
    const simJdValue = document.getElementById("simJdValue");
    const simLangValue = document.getElementById("simLangValue");
    const simModeValue = document.getElementById("simModeValue");
    const simInputModeValue = document.getElementById("simInputModeValue");
    const simulationReadinessText = document.getElementById("simulationReadinessText");

    const fakeStartButton = document.getElementById("fakeStartButton");
const demoButtons = Array.from(document.querySelectorAll(".demo-button[data-demo]"));

const modeCopy = {
  short: {
    label: "Quick Interview",
    subtext: "Breve, veloce, utile per demo o prima prova.",
    help: "Versione rapida: poche domande ma con un affondo adattivo se emerge una debolezza forte.",
    highlight: "Quick Interview è la scelta migliore per una prova veloce o una demo: resta breve, ma se trova una debolezza importante stringe comunque il punto con un approfondimento mirato."
  },
  standard: {
    label: "Standard Interview",
    subtext: "Equilibrio tra rapidità, copertura e approfondimento.",
    help: "Versione bilanciata: copre più aree, mantiene ritmo e lascia spazio a segnali utili per il report.",
    highlight: "Standard Interview è la scelta più equilibrata: copre bene il profilo, lascia emergere i punti deboli e mantiene una durata credibile per un uso reale."
  },
  deep: {
    label: "Deep Interview",
    subtext: "Più esplorazione, più pressione, più materiale per il report.",
    help: "Versione estesa: più spazio per follow-up, coerenza narrativa, attriti e approfondimento.",
    highlight: "Deep Interview è la scelta giusta quando vuoi una lettura più ricca: aumenta l’esplorazione, stressa meglio la tenuta delle risposte e rende il report più denso."
  }
};

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function setCompleteState({ boxEl, stateEl, complete, okLabel = "Completo", missingLabel = "Da inserire" }) {
  boxEl.classList.toggle("complete", complete);
  stateEl.classList.toggle("ok", complete);
  stateEl.classList.toggle("missing", !complete);
  stateEl.textContent = complete ? okLabel : missingLabel;
}

function setDotState(dotEl, complete) {
  dotEl.classList.toggle("ok", complete);
}

function switchPanel(panelKey) {
  Object.entries(panelMap).forEach(([key, panel]) => {
    panel.classList.toggle("active", key === panelKey);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.getAttribute("data-panel") === panelKey);
  });
}

function updateUi() {
  intakeState.targetRole = targetRoleInput.value;
  intakeState.cvText = cvTextInput.value;
  intakeState.jdText = jdTextInput.value;
  intakeState.uiLocale = uiLocaleSelect.value;
  intakeState.sessionLocale = sessionLocaleSelect.value;
  intakeState.interviewLengthMode = interviewLengthModeSelect.value;
  intakeState.inputMode = inputModeSelect.value;

  const roleReady = hasText(intakeState.targetRole);
  const cvReady = hasText(intakeState.cvText);
  const jdReady = hasText(intakeState.jdText);
  const prepReady = roleReady && cvReady;

  setCompleteState({
    boxEl: boxRole,
    stateEl: stateRole,
    complete: roleReady,
    okLabel: "Completo",
    missingLabel: "Da inserire"
  });

  setCompleteState({
    boxEl: boxCv,
    stateEl: stateCv,
    complete: cvReady,
    okLabel: "Completo",
    missingLabel: "Da inserire"
  });

  setCompleteState({
    boxEl: boxJd,
    stateEl: stateJd,
    complete: jdReady,
    okLabel: "Presente",
    missingLabel: "Consigliata"
  });

  setDotState(dotRole, roleReady);
  setDotState(dotCv, cvReady);
  setDotState(dotJd, jdReady);

  if (prepReady) {
    statusPrepValue.textContent = jdReady ? "Pronta" : "Quasi pronta";
    prepNextHint.textContent = jdReady
      ? "Hai tutto il necessario per una simulazione ben centrata"
      : "Puoi partire già ora, ma con la job description il risultato migliora";
    prepNextHint.classList.add("ok");
  } else {
    statusPrepValue.textContent = "Da completare";
    prepNextHint.textContent = "Completa almeno CV e ruolo target";
    prepNextHint.classList.remove("ok");
  }

  const selectedMode = modeCopy[intakeState.interviewLengthMode] || modeCopy.standard;
  selectedModeValue.textContent = selectedMode.label;
  selectedModeSubtext.textContent = selectedMode.subtext;
  interviewLengthModeHelp.textContent = selectedMode.help;
  modeHighlightText.textContent = selectedMode.highlight;

  simRoleValue.textContent = roleReady ? intakeState.targetRole.trim() : "Non inserito";
  simCvValue.textContent = cvReady ? "Presente" : "Non inserito";
  simJdValue.textContent = jdReady ? "Presente" : "Non inserita";
  simLangValue.textContent = intakeState.sessionLocale === "en" ? "English" : "Italiano";
  simModeValue.textContent = selectedMode.label;
  simInputModeValue.textContent = intakeState.inputMode === "voice" ? "Voice ready" : "Text";

  simulationReadinessText.textContent = prepReady
    ? (jdReady
        ? "La simulazione può partire con una base completa e più credibile."
        : "La simulazione può partire. Aggiungere la job description renderebbe il contesto ancora più preciso.")
    : "Per abilitare davvero la simulazione servono almeno CV e ruolo target.";
}

[
  targetRoleInput,
  cvTextInput,
  jdTextInput,
  uiLocaleSelect,
  sessionLocaleSelect,
  interviewLengthModeSelect,
  inputModeSelect
].forEach((el) => {
  el.addEventListener("input", updateUi);
  el.addEventListener("change", updateUi);
});

targetRoleInput.value = intakeState.targetRole;
cvTextInput.value = intakeState.cvText;
jdTextInput.value = intakeState.jdText;
uiLocaleSelect.value = intakeState.uiLocale;
sessionLocaleSelect.value = intakeState.sessionLocale;
interviewLengthModeSelect.value = intakeState.interviewLengthMode;
inputModeSelect.value = intakeState.inputMode;

demoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const presetKey = button.getAttribute("data-demo");
    const preset = demoPresets[presetKey];
    if (!preset) return;

    targetRoleInput.value = preset.targetRole;
    cvTextInput.value = preset.cvText;
    jdTextInput.value = preset.jdText;
    uiLocaleSelect.value = preset.uiLocale;
    sessionLocaleSelect.value = preset.sessionLocale;
    interviewLengthModeSelect.value = preset.interviewLengthMode;
    inputModeSelect.value = preset.inputMode;
    updateUi();
  });
});

if (fakeStartButton) {
  fakeStartButton.addEventListener("click", () => {
    switchPanel("simulation");
    updateUi();
  });
}

document.querySelectorAll(".nav-btn[data-panel]").forEach((button) => {
  button.addEventListener("click", () => {
    switchPanel(button.getAttribute("data-panel"));
  });
});

updateUi();
switchPanel("prep");
  </script>
</body>
</html>
  `.trim();
}

export default renderInteractiveInterviewShellHtml;