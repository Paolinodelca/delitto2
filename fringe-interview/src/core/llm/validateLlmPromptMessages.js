function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateLlmPromptMessages(promptMessages = {}) {
  const errors = [];

  if (!isObject(promptMessages)) {
    return {
      isValid: false,
      errors: ["LlmPromptMessages must be an object."],
    };
  }

  if (!promptMessages.promptStatus) {
    errors.push("promptStatus is required.");
  }

  if (!Array.isArray(promptMessages.messages)) {
    errors.push("messages must be an array.");
  } else {
    if (promptMessages.messages.length < 2) {
      errors.push("messages must contain at least 2 messages.");
    }

    promptMessages.messages.forEach((message, index) => {
      if (!isObject(message)) {
        errors.push(`messages[${index}] must be an object.`);
        return;
      }

      if (!message.role) {
        errors.push(`messages[${index}].role is required.`);
      }

      if (!message.content) {
        errors.push(`messages[${index}].content is required.`);
      }
    });
  }

  if (!isObject(promptMessages.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!promptMessages.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!promptMessages.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(promptMessages.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateLlmPromptMessages,
};