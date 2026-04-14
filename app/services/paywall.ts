import { Alert } from "react-native";

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
      Alert.alert(
        "Passa a PRO",
        "Sblocca Movie, Cyberpunk e tutti gli effetti premium 🚀"
      );

      return { ok: false };
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
      Alert.alert(
        "Passa a PRO",
        "Sblocca tutte le funzionalità premium 🚀"
      );

      return { ok: false };
    }

    return { ok: true };
  } catch (err) {
    console.log("feature access error:", err);
    return { ok: true }; // fallback sicuro
  }
}