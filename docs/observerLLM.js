export async function observeWithLLM(context) {
  try {
    const res = await fetch("/api/observe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context)
    });

    if (!res.ok) throw new Error("LLM non disponibile");

    return await res.json();
  } catch (e) {
    console.warn("Osservazione LLM fallita");
    return null;
  }
}
