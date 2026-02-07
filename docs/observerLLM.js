export async function observeWithLLM(payload) {
  try {
    const res = await fetch("/api/observe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error("LLM response not ok");
    }

    return await res.json();
  } catch (err) {
    console.warn("Osservazione LLM fallita");

    // ⬇️ QUESTO È IL PUNTO CHIAVE
    return {
      osservazione: "L’osservazione esterna non è disponibile. Il silenzio è stato registrato.",
      errore: true
    };
  }
}
