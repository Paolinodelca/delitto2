// data/world/base_world.js

export const worldFacts = [

  // ─────────────────────────
  // SETTING
  // ─────────────────────────
  {
    type: "setting",
    id: "villa_lago_como",
    location: "Lago di Como",
    era: "anni_50"
  },

  // ─────────────────────────
  // PERSONE
  // ─────────────────────────
  {
    type: "person",
    id: "carlo_brambilla",
    age: 65,
    role: "industriale"
  },
  {
    type: "person",
    id: "riccardo_brambilla",
    role: "figlio"
  },
  {
    type: "person",
    id: "elena_bella",
    role: "fidanzata"
  },
  {
    type: "person",
    id: "dario_rossi",
    role: "socio_minoranza"
  },
  {
    type: "person",
    id: "ernesto",
    role: "giardiniere"
  },
  {
    type: "person",
    id: "camilla",
    role: "cuoca_governante"
  },

  // ─────────────────────────
  // RELAZIONI OGGETTIVE
  // ─────────────────────────
  {
    type: "family_relation",
    parent: "carlo_brambilla",
    child: "riccardo_brambilla"
  },
  {
    type: "engagement",
    person_a: "riccardo_brambilla",
    person_b: "elena_bella"
  },
  {
    type: "employment",
    employer: "carlo_brambilla",
    employee: "ernesto"
  },
  {
    type: "employment",
    employer: "carlo_brambilla",
    employee: "camilla"
  },
  {
    type: "business_relation",
    partners: ["carlo_brambilla", "dario_rossi"]
  },

  // ─────────────────────────
  // OGGETTI E LUOGHI INTERNI
  // ─────────────────────────
  {
    type: "room",
    id: "camera_carlo",
    location: "villa_lago_como"
  },
  {
    type: "room",
    id: "camera_dario",
    location: "villa_lago_como"
  },
  {
    type: "room",
    id: "giardino_villa",
    location: "villa_lago_como"
  },
  {
    type: "object",
    id: "statuette",
    quantity_initial: 2,
    location: "camera_dario"
  },
  {
    type: "object",
    id: "scaletta",
    location: "villa_lago_como"
  },

  // ─────────────────────────
  // EVENTI OGGETTIVI
  // ─────────────────────────
  {
    type: "event",
    id: "telegramma_fondi_mancanti",
    time: "sera",
    recipient: "carlo_brambilla"
  },
  {
    type: "event",
    id: "omicidio_carlo_brambilla",
    victim: "carlo_brambilla",
    time: "circa_23_00",
    location: "camera_dario",
    cause: "trauma_cranico"
  },
  {
    type: "event",
    id: "spostamento_corpo",
    from: "camera_dario",
    to: "camera_carlo"
  },
  {
    type: "event",
    id: "inscenamento_incidente",
    method: "caduta_da_scaletta"
  },

  // ─────────────────────────
  // STATO FINALE OSSERVABILE
  // ─────────────────────────
  {
    type: "object_state",
    object: "statuette",
    quantity_after: 1,
    note: "frammenti_presenti_sotto_armadio"
  },
  // ─────────────────────────
// VERITÀ OGGETTIVE (NON OSSERVABILI)
// ─────────────────────────
{
  type: "truth",
  id: "murderer",
  value: "riccardo_brambilla"
},
{
  type: "truth",
  id: "motive",
  value: "appropriazione_fondi"
},
{
  type: "truth",
  id: "method",
  value: "colpo_con_statuetta"
},
{
  type: "truth",
  id: "time",
  value: "22_30"
}




];
