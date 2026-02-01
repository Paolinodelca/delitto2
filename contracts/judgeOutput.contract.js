// Questo è l’unico formato che il Judge è autorizzato a produrre
export const JudgeOutputContract = {
  status: "completed",        // string
  success: false,             // boolean
  score: 0,                   // number
  breakdown: {
    accused: false,
    motive: false,
    method: false,
    time: false
  },
  accusation: {
    accused: "",
    motive: "",
    method: "",
    time: ""
  }
};
