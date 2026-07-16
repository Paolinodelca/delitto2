const { renderTemplate } = require("../tools/imago-builder/core/renderTemplate");
const { validateTemplateDefinition } = require("../tools/imago-builder/core/validateTemplateDefinition");

const failures = [];
function expect(condition, message) { if (!condition) failures.push(message); }
function createTemplate(overrides = {}) {
  return {
    templateId: "test_template",
    templateVersion: "1.0",
    outputType: "text",
    targetCategory: "other",
    requiredPlaceholders: ["NAME"],
    optionalPlaceholders: [],
    content: "Hello {{NAME}}",
    metadata: {},
    extensions: {},
    ...overrides,
  };
}

const validTemplate = createTemplate();
const validResult = renderTemplate({ template: validTemplate, context: { NAME: "IMAGO" } });
expect(validResult.rendered === true, "A: rendered");
expect(validResult.content === "Hello IMAGO\n", `A: content ${JSON.stringify(validResult.content)}`);

const repeatedResult = renderTemplate({
  template: createTemplate({ content: "{{NAME}}/{{NAME}}" }),
  context: { NAME: "x" },
});
expect(repeatedResult.content === "x/x\n", "B: repeated placeholder");

const missingResult = renderTemplate({ template: validTemplate, context: {} });
expect(missingResult.rendered === false, "C: rendered false");
expect(missingResult.missingRequiredPlaceholders.includes("NAME"), "C: missing NAME");

const optionalResult = renderTemplate({
  template: createTemplate({ optionalPlaceholders: ["SUFFIX"], content: "{{NAME}}{{SUFFIX}}" }),
  context: { NAME: "IMAGO" },
});
expect(optionalResult.rendered === true, "D: rendered");
expect(optionalResult.content === "IMAGO\n", "D: optional empty");
expect(optionalResult.warnings.some((warning) => warning.includes("Optional placeholder missing")), "D: warning");

const unusedResult = renderTemplate({ template: validTemplate, context: { NAME: "IMAGO", UNUSED_KEY: "ignored" } });
expect(unusedResult.rendered === true, "E: rendered");
expect(unusedResult.unusedContextKeys.includes("UNUSED_KEY"), "E: unused key");
expect(unusedResult.warnings.some((warning) => warning.includes("Unused context keys")), "E: strict warning");
const nonStrictResult = renderTemplate({ template: validTemplate, context: { NAME: "IMAGO", UNUSED_KEY: "ignored" }, strict: false });
expect(nonStrictResult.unusedContextKeys.includes("UNUSED_KEY"), "E: non-strict unused");
expect(!nonStrictResult.warnings.some((warning) => warning.includes("Unused context keys")), "E: non-strict no warning");

[{}, [], () => {}].forEach((invalidValue, index) => {
  const result = renderTemplate({ template: validTemplate, context: { NAME: invalidValue } });
  expect(result.rendered === false, `F${index}: rendered`);
  expect(result.errors.some((error) => error.includes("not supported")), `F${index}: error`);
});

const recursiveTemplate = createTemplate({
  requiredPlaceholders: ["FIRST_PLACEHOLDER", "SECOND_PLACEHOLDER"],
  content: "{{FIRST_PLACEHOLDER}}|{{SECOND_PLACEHOLDER}}",
});
const recursiveResult = renderTemplate({
  template: recursiveTemplate,
  context: { FIRST_PLACEHOLDER: "{{SECOND_PLACEHOLDER}}", SECOND_PLACEHOLDER: "resolved" },
});
expect(recursiveResult.rendered === true, "G: rendered");
expect(recursiveResult.content === "{{SECOND_PLACEHOLDER}}|resolved\n", `G: no recursion ${JSON.stringify(recursiveResult.content)}`);
expect(recursiveResult.unresolvedPlaceholders.length === 0, "G: inserted literal not unresolved");

const newlineResult = renderTemplate({
  template: createTemplate({ content: "A\r\n{{NAME}}\r\n\r\n" }),
  context: { NAME: "B" },
});
expect(newlineResult.content === "A\nB\n", `H: newline ${JSON.stringify(newlineResult.content)}`);

const invalidTemplate = createTemplate({ content: "{{#if NAME}}{{NAME}}{{/if}}" });
const invalidValidation = validateTemplateDefinition(invalidTemplate);
const invalidResult = renderTemplate({ template: invalidTemplate, context: { NAME: "IMAGO" } });
expect(invalidValidation.isValid === false, "I: invalid validation");
expect(invalidResult.rendered === false, "I: render failed");
expect(invalidResult.content === "", "I: empty content");

const immutableTemplate = createTemplate();
const immutableContext = { NAME: "IMAGO" };
const templateBefore = JSON.stringify(immutableTemplate);
const contextBefore = JSON.stringify(immutableContext);
renderTemplate({ template: immutableTemplate, context: immutableContext });
expect(JSON.stringify(immutableTemplate) === templateBefore, "J: template mutated");
expect(JSON.stringify(immutableContext) === contextBefore, "J: context mutated");

console.log(JSON.stringify({
  test: "Template Renderer Foundation",
  status: failures.length === 0 ? "PASS" : "FAIL",
  usedPlaceholders: validResult.usedPlaceholders,
  warnings: optionalResult.warnings,
}, null, 2));

if (failures.length > 0) {
  console.error("Template Renderer Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
console.log("Template Renderer Test: PASS");
