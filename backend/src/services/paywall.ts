const FREE_EFFECTS = ["photorealistic"];
const FREE_FEATURES = ["text"];

// 🔥 TEMP: stato PRO mock (per lancio)
let isProUser = false;

// 👉 Se vuoi forzare PRO per test:
// isProUser = true;

export async function checkProAccess(effect?: string) {
  try {
    // se non c'è effetto → ok
    if (!effect) return { ok: true };

    const isFree = FREE_EFFECTS.includes(effect);

    if (!isProUser && !isFree) {
      console.log("⚠️ Utente NON PRO - effetto bloccato:", effect);

      return {
        ok: false,
        message: "Passa a PRO per sbloccare questo effetto"
      };
    }

    return { ok: true };
  } catch (err) {
    console.log("paywall error:", err);
    return { ok: true }; // fallback sicuro
  }
}

export async function checkFeatureAccess(feature: string) {
  try {
    const isFree = FREE_FEATURES.includes(feature);

    if (!isProUser && !isFree) {
      console.log("⚠️ Utente NON PRO - feature bloccata:", feature);

      return {
        ok: false,
        message: "Passa a PRO per sbloccare questa funzione"
      };
    }

    return { ok: true };
  } catch (err) {
    console.log("feature access error:", err);
    return { ok: true }; // fallback sicuro
  }
}