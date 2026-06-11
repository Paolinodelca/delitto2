import {
  getAllReportLayoutsForPlan,
  getReportSectionLayout,
  getModuleVisibility
} from "../src/report/getReportSectionLayout.js";

function printLayout(title, layout) {
  console.log(`\n=== ${title} ===`);

  console.log("\nEnabled:");
  if (!layout.enabled.length) {
    console.log("- none");
  } else {
    layout.enabled.forEach((item) => {
      console.log(`- ${item.key} [section=${item.sectionKey}] (${item.title})`);
    });
  }

  console.log("\nPreview:");
  if (!layout.preview.length) {
    console.log("- none");
  } else {
    layout.preview.forEach((item) => {
      console.log(`- ${item.key} [section=${item.sectionKey}] (${item.title})`);
    });
  }

  console.log("\nLocked:");
  if (!layout.locked.length) {
    console.log("- none");
  } else {
    layout.locked.forEach((item) => {
      console.log(`- ${item.key} [section=${item.sectionKey}] (${item.title})`);
    });
  }
}

function main() {
  const freeOverview = getReportSectionLayout({
    planKey: "free",
    sectionKey: "overview"
  });

  const proOverview = getReportSectionLayout({
    planKey: "pro",
    sectionKey: "overview"
  });

  const premiumAnswers = getReportSectionLayout({
    planKey: "premium",
    sectionKey: "answers"
  });

  printLayout("FREE / overview", freeOverview);
  printLayout("PRO / overview", proOverview);
  printLayout("PREMIUM / answers", premiumAnswers);

  console.log("\n=== Visibility checks ===");
  console.log(
    "free / overview / openingPositioning:",
    getModuleVisibility({
      planKey: "free",
      sectionKey: "overview",
      moduleKey: "openingPositioning"
    })
  );

  console.log(
    "pro / overview / openingPositioning:",
    getModuleVisibility({
      planKey: "pro",
      sectionKey: "overview",
      moduleKey: "openingPositioning"
    })
  );

  console.log(
    "premium / answers / trainerMode:",
    getModuleVisibility({
      planKey: "premium",
      sectionKey: "answers",
      moduleKey: "trainerMode"
    })
  );

  console.log("\n=== All layouts for PRO ===");
  console.log(JSON.stringify(getAllReportLayoutsForPlan("pro"), null, 2));
}

main();