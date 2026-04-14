import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases from "react-native-purchases";

const NG_KEY = "ng_status_v1";
const CREDITS_KEY = "user_credits_v1";

export type Plan = "free" | "pro";

type ngState = {
  plan: Plan;

  effectsUsed: boolean;
  talkingPhotoUsed: boolean;

  textCount: number;

  dailyGenerations: number;

  lastReset: string;
};

// 📅 DATA OGGI
function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 🔥 REVENUECAT PLAN
export async function getUserPlan(): Promise<Plan> {
  try {
    const info = await Purchases.getCustomerInfo();
    const isPro = info.entitlements.active["pro"] !== undefined;
    return isPro ? "pro" : "free";
  } catch (e) {
    console.log("❌ RevenueCat error:", e);
    return "free";
  }
}

// 📦 READ LOCAL STATE
async function readState(): Promise<ngState> {
  const raw = await AsyncStorage.getItem(NG_KEY);
  if (raw) return JSON.parse(raw);

  return {
  plan: "free",
  effectsUsed: false,
  talkingPhotoUsed: false,
  textCount: 0,
  dailyGenerations: 0, // ✅ QUI
  lastReset: todayStr(),
};
}

// 💾 WRITE STATE
async function writeState(s: ngState) {
  await AsyncStorage.setItem(NG_KEY, JSON.stringify(s));
}
export async function canProceedGeneration() {
  const s = await getngState();

  if (s.plan !== "pro") return true;

  // 🔥 limite nascosto
  if (s.dailyGenerations > 20) {
    return false;
  }

  return true;
}

export async function increaseGenerationCount() {
  const s = await getngState();

  await writeState({
    ...s,
    dailyGenerations: (s.dailyGenerations || 0) + 1,
  });
}

// 🔥 STATO COMPLETO
export async function getngState(): Promise<ngState> {
  const plan = await getUserPlan();
  const local = await readState();

  const today = todayStr();

  let updated = { ...local, plan };

  // 🔄 RESET GIORNALIERO
  if (local.lastReset !== today) {
    updated = {
      ...updated,
      textCount: 0,
      lastReset: today,
    };
    await writeState(updated);
  }

  return updated;
}

// 🔥 ACCESSO FEATURE
export async function canUseFeature(feature: string) {
  const s = await getngState();

  // 💎 PRO → accesso totale
  if (s.plan === "pro") return { ok: true };

  let price = 0;
  let isFreeAllowed = false;

  // 🎬 EFFECTS (1 volta gratis)
  if (feature === "effects") {
    if (!s.effectsUsed) {
      isFreeAllowed = true;
    } else {
      price = 210;
    }
  }

  // 🎬 TALKING PHOTO (1 volta gratis)
  if (feature === "talkingPhoto") {
    if (!s.talkingPhotoUsed) {
      isFreeAllowed = true;
    } else {
      price = 210;
    }
  }

  // 🖼️ TEXT (1 al giorno gratis)
  if (feature === "text") {
    if (s.textCount < 1) {
      isFreeAllowed = true;
    } else {
      price = 180;
    }
  }

  // 🔒 SOLO PRO (ma sbloccabile con crediti)
  if (feature === "avatar" || feature === "imageVideo") {
    price = 210;
  }

  // ✅ FREE consentito
  if (isFreeAllowed) {
    return { ok: true };
  }

  // 💎 CONTROLLO CREDITI
  const credits = await getCredits();

  if (credits >= price) {
    return { ok: true, useCredits: true, price };
  }

  // ❌ BLOCCO → PAYWALL
  return { ok: false, type: "PAYWALL", price };
}

// 🔥 SEGNA UTILIZZO
export async function markFeatureUsed(feature: string) {
  const s = await getngState();

  if (s.plan === "pro") return;

  if (feature === "effects") {
    await writeState({ ...s, effectsUsed: true });
  }

  if (feature === "talkingPhoto") {
    await writeState({ ...s, talkingPhotoUsed: true });
  }

  if (feature === "text") {
    await writeState({ ...s, textCount: s.textCount + 1 });
  }
}

export async function getCredits(): Promise<number> {
  const raw = await AsyncStorage.getItem(CREDITS_KEY);
  return raw ? Number(raw) : 0;
}

export async function addCredits(amount: number) {
  const current = await getCredits();
  const next = current + amount;
  await AsyncStorage.setItem(CREDITS_KEY, String(next));
}

export async function spendCredits(amount: number): Promise<boolean> {
  const current = await getCredits();

  if (current < amount) return false;

  const next = current - amount;
  await AsyncStorage.setItem(CREDITS_KEY, String(next));
  return true;
}
// ✅ COMPATIBILITÀ con create.tsx

export async function canGenerate(userId?: string) {
  return await canProceedGeneration();
}

export async function consumeGeneration(userId?: string) {
  await increaseGenerationCount();
}

export async function checkProAccess(effect?: string) {
  try {
    // fallback sicuro → sempre OK
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function checkFeatureAccess() {
  try {
    return { ok: true };
  } catch {
    return { ok: true };
  }
}
export async function getBillingState() {
  return { plan: "free" };
}