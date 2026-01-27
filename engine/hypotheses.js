export class Hypotheses {
  constructor(initial = []) {
    this.list = initial;
  }

  add(hypothesis) {
    this.list.push({
      id: `hyp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...hypothesis
    });
  }

  getByActor(actor) {
    return this.list.filter(h => h.by === actor);
  }

  getActive() {
    return this.list.filter(h => h.status === "attiva");
  }

  updateStatus(id, status) {
    const h = this.list.find(h => h.id === id);
    if (h) h.status = status;
  }
}
