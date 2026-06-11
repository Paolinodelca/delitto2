import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import renderProReportSection from "../src/app/renderProReportSection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function buildHtmlDocument(sectionHtml) {
  return `
<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>FRINGE Interview - PRO Preview</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #f5f7fb;
      --card: #ffffff;
      --text: #1f2937;
      --muted: #4b5563;
      --line: #dbe3f0;
    }

    * { box-sizing: border-box; }

    body {
      font-family: Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 20px;
      line-height: 1.55;
    }

    .page {
      max-width: 1180px;
      margin: 0 auto;
    }

    .section-shell {
      background: white;
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 18px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.07);
    }

    .overview-shell {
      padding-top: 8px;
      background: #ffffff;
    }

    .overview-stage-shell {
      border-radius: 20px;
      padding: 14px;
      background: linear-gradient(180deg, #eef4fb 0%, #dfe8f3 38%, #6b7280 78%, #2b2f36 100%);
    }

    .hero-metrics-row {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .hero-metric-card {
      border-radius: 16px;
      padding: 12px 14px;
      border: 3px solid #dbe3f0;
      background: #ffffff;
      box-shadow:
        0 14px 24px rgba(15,23,42,0.16),
        0 4px 10px rgba(15,23,42,0.10);
      min-height: 96px;
    }

    .hero-metric-card-good {
      background: linear-gradient(180deg, #dcfce7 0%, #bbf7d0 100%);
      border-color: #16a34a;
    }

    .hero-metric-card-warm {
      background: linear-gradient(180deg, #ffedd5 0%, #fed7aa 100%);
      border-color: #f59e0b;
    }

    .hero-metric-card-risk {
      background: linear-gradient(180deg, #fee2e2 0%, #fecaca 100%);
      border-color: #dc2626;
    }

    .hero-metric-card-neutral {
      background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
      border-color: #94a3b8;
    }

    .hero-metric-label {
      display: inline-block;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.03em;
      color: #1f2937;
      margin-bottom: 8px;
      background: rgba(255,255,255,0.8);
      padding: 4px 8px;
      border-radius: 999px;
    }

    .hero-metric-value {
      font-size: 22px;
      line-height: 1.25;
      font-weight: 900;
      color: #111827;
    }

    .overview-reading-block {
      border-radius: 18px;
      padding: 18px;
      margin-bottom: 18px;
      background: linear-gradient(180deg, #132235 0%, #1c3552 100%);
      border: 2px solid rgba(255,255,255,0.10);
      box-shadow: 0 10px 22px rgba(10,20,35,0.26);
    }

    .overview-reading-title {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #c7dcff;
      margin-bottom: 10px;
    }

    .overview-verdict-headline {
      font-size: 30px;
      line-height: 1.35;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 10px;
    }

    .overview-verdict-text {
      font-size: 18px;
      line-height: 1.72;
      color: #e5edf8;
    }

    .overview-errors-shell {
      border-radius: 18px;
      padding: 18px;
      margin-bottom: 18px;
      background: linear-gradient(180deg, #362019 0%, #221714 100%);
      border: 2px solid rgba(255,255,255,0.10);
      box-shadow: 0 10px 22px rgba(0,0,0,0.18);
    }

    .overview-errors-title {
      font-size: 24px;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 6px;
    }

    .overview-errors-subtitle {
      font-size: 16px;
      color: rgba(255,255,255,0.86);
      line-height: 1.6;
      margin-bottom: 14px;
      font-weight: 700;
    }

    .blocking-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .blocking-item {
      display: grid;
      grid-template-columns: 64px 1fr;
      gap: 14px;
      align-items: stretch;
      border-radius: 16px;
      background: rgba(255,255,255,0.96);
      border: 2px solid rgba(255,255,255,0.16);
      padding: 14px;
    }

    .blocking-index {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      background: linear-gradient(180deg, #ea580c 0%, #c2410c 100%);
      color: white;
      font-size: 26px;
      font-weight: 900;
      min-height: 72px;
    }

    .blocking-title {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: #9a3412;
      margin-bottom: 6px;
    }

    .blocking-text {
      font-size: 18px;
      line-height: 1.6;
      color: #111827;
      font-weight: 700;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .equal-grid > .card {
      height: 100%;
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 0;
      box-shadow: 0 6px 18px rgba(0,0,0,0.07);
      border: 2px solid #dbe3f0;
    }

    .positive-card {
      background: #f0fdf4;
      border-color: #86efac;
    }

    .risk-card {
      background: #fef2f2;
      border-color: #fca5a5;
    }

    .warm-card {
      background: #fff7ed;
      border-color: #fdba74;
    }

    h3 {
      font-size: 20px;
      margin-top: 0;
      margin-bottom: 8px;
    }

    .section-shell-header {
      margin-bottom: 14px;
    }

    .section-shell-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .section-shell-subtitle,
    .section-subtitle {
      color: #475467;
      font-size: 15px;
      line-height: 1.5;
    }

    .summary-score-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      height: 100%;
    }

    .score-summary-card {
      background: #ffffff;
      border: 3px solid #e5e7eb;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      min-height: 176px;
    }

    .frame-ok {
      border-color: #16a34a;
      background: #ecfdf3;
    }

    .frame-mid {
      border-color: #f59e0b;
      background: #fff7ed;
    }

    .frame-weak {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .frame-neutral {
      border-color: #cbd5e1;
      background: #f8fafc;
    }

    .score-summary-top {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .score-summary-title {
      font-size: 15px;
      font-weight: 800;
    }

    .score-summary-subtitle {
      font-size: 14px;
      color: #4b5563;
      min-height: 42px;
      margin-bottom: 10px;
      line-height: 1.45;
    }

    .score-summary-main {
      font-size: 34px;
      font-weight: 900;
      line-height: 1;
      margin-top: auto;
      margin-bottom: 8px;
    }

    .score-summary-status {
      font-size: 15px;
      font-weight: 800;
    }

    .score-dot {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      display: inline-block;
      flex: 0 0 auto;
    }

    .dot-ok { background: #16a34a; }
    .dot-mid { background: #facc15; }
    .dot-weak { background: #dc2626; }
    .dot-neutral { background: #94a3b8; }

    .status-ok { color: #065f46; font-weight: 800; }
    .status-mid { color: #a16207; font-weight: 800; }
    .status-weak { color: #991b1b; font-weight: 800; }
    .status-neutral { color: #334155; font-weight: 800; }

    ul {
      padding-left: 20px;
      margin-top: 8px;
    }

    li {
      font-size: 15px;
      line-height: 1.55;
    }

    li + li {
      margin-top: 6px;
    }

    .muted {
      color: #6b7280;
      font-size: 15px;
      line-height: 1.5;
    }

    @media (max-width: 980px) {
      .hero-metrics-row,
      .grid-2,
      .summary-score-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    ${sectionHtml}
  </div>
</body>
</html>
  `.trim();
}

async function main() {
  const inputPath = path.join(
    projectRoot,
    "tmp",
    "pro-report",
    "pro_report_model.json"
  );

  const outputDir = path.join(projectRoot, "tmp", "pro-report");
  const outputPath = path.join(outputDir, "pro_report_preview.html");

  const raw = await readFile(inputPath, "utf8");
  const parsed = JSON.parse(raw);

  const sectionHtml = renderProReportSection({
    proReportModel: parsed?.proReportModel || {}
  });

  const html = buildHtmlDocument(sectionHtml);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, html, "utf8");

  console.log("PRO report preview generated:");
  console.log(outputPath);
}

main().catch((error) => {
  console.error("test_render_pro_report_section failed:");
  console.error(error);
  process.exit(1);
});