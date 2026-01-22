// data/knowledge/base_knowledge.js

export const knowledgeFacts = [

  // ─────────────────────────
  // RELAZIONI SEGRETE
  // ─────────────────────────
  {
    holder: "elena_bella",
    knows: {
      type: "relationship",
      persons: ["elena_bella", "carlo_brambilla"]
    },
    truth: true
  },

  {
    holder: "carlo_brambilla",
    knows: {
      type: "pregnancy",
      person: "elena_bella"
    },
    truth: true
  },

  {
    holder: "riccardo_brambilla",
    knows: {
      type: "relationship",
      persons: ["elena_bella", "carlo_brambilla"]
    },
    truth: false
  },

  // ─────────────────────────
  // DEBITI E FINANZE
  // ─────────────────────────
  {
    holder: "dario_rossi",
    knows: {
      type: "debts",
      status: "gravi"
    },
    truth: true
  },
  {
    holder: "carlo_brambilla",
    knows: {
      type: "company_finances",
      status: "critiche"
    },
    truth: true
  },

  // ─────────────────────────
  // SPOSTAMENTI E AZIONI
  // ─────────────────────────
  {
    holder: "riccardo_brambilla",
    knows: {
      type: "own_movement",
      location: "giardino_villa",
      time: "poco_prima_del_delitto"
    },
    truth: true
  },
  {
    holder: "elena_bella",
    knows: {
      type: "own_movement",
      location: "camera_carlo",
      time: "poco_prima_del_delitto"
    },
    truth: true
  },
  {
    holder: "riccardo_brambilla",
    knows: {
      type: "movement_of_elena",
      location: "camera_carlo"
    },
    truth: false
  },

  // ─────────────────────────
  // OMICIDIO
  // ─────────────────────────
  {
    holder: "dario_rossi",
    knows: {
      type: "responsibility",
      event: "omicidio_carlo_brambilla"
    },
    truth: true
  },

  {
    holder: "camilla",
    knows: {
      type: "missing_object",
      object: "statuette"
    },
    truth: true
  }

];
