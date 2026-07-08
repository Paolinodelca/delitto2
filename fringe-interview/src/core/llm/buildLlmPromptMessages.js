function buildLlmPromptMessages(llmPayload = {}) {
  const locale = llmPayload?.task?.locale || "it";

  const systemContent = [
    "You are preparing a structured JSON output from a controlled technical payload.",
    "Do not invent facts.",
    "Use only evidence and data present in the payload.",
    "Do not judge the person.",
    "Do not promise results or outcomes.",
    "Produce output as structured JSON.",
    `Respect the payload language/locale: ${locale}.`,
  ].join("\n");

  const userContent = JSON.stringify(
    {
      llmPayload,
    },
    null,
    2
  );

  return {
    promptStatus: "draft",

    messages: [
      {
        role: "system",
        content: systemContent,
      },
      {
        role: "user",
        content: userContent,
      },
    ],

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildLlmPromptMessages,
};