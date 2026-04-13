export type Plan = "free" | "pro";

type ngState = {
  plan: Plan;
  effectsUsed: boolean;
  talkingPhotoUsed: boolean;
  textCount: number;
  dailyGenerations: number;
  lastReset: string;
};

// 🔥 stato in memoria (backend safe)
let state: ngState = {
  plan: "free",
  effectsUsed: false,
  talkingPhotoUsed: false,
  textCount: 0,
  dailyGenerations: 0,
  lastReset: todayStr(),
};

// 📅 DATA OGGI
function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 🔥 PLAN (TEMP)
export async function getUserPlan(): Promise<Plan> {
  return "free"; // 🔥 poi collegheremo PRO vero
}

// 🔥 STATO COMPLETO
export async function getngState(): Promise<ngState> {
  const today = todayStr();

  if (state.lastReset !== today) {
    state = {
      ...state,
      textCount: 0,
      dailyGenerations: 0,
      lastReset: today,
    };
  }

  return state;
}

// 🔥 GENERATION LIMIT
export async function canProceedGeneration() {
  const s = await getngState();

  if (s.plan !== "pro") return true;

  if (s.dailyGenerations > 20) return false;

  return true;
}

export async function increaseGenerationCount() {
  state.dailyGenerations += 1;
}

// 🔥 FEATURE ACCESS
export async function canUseFeature(feature: string) {
  const s = await getngState();

  if (s.plan === "pro") return { ok: true };

  let price = 0;
  let isFreeAllowed = false;

  if (feature === "effects") {
    if (!s.effectsUsed) isFreeAllowed = true;
    else price = 210;
  }

  if (feature === "talkingPhoto") {
    if (!s.talkingPhotoUsed) isFreeAllowed = true;
    else price = 210;
  }

  if (feature === "text") {
    if (s.textCount < 1) isFreeAllowed = true;
    else price = 180;
  }

  if (feature === "avatar" || feature === "imageVideo") {
    price = 210;
  }

  if (isFreeAllowed) return { ok: true };

  const credits = await getCredits();

  if (credits >= price) {
    return { ok: true, useCredits: true, price };
  }

  return { ok: false, type: "PAYWALL", price };
}

// 🔥 SEGNA UTILIZZO
export async function markFeatureUsed(feature: string) {
  if (state.plan === "pro") return;

  if (feature === "effects") state.effectsUsed = true;
  if (feature === "talkingPhoto") state.talkingPhotoUsed = true;
  if (feature === "text") state.textCount += 1;
}

// 💰 CREDITI (in memoria)
let credits = 0;

export async function getCredits(): Promise<number> {
  return credits;
}

export async function addCredits(amount: number) {
  credits += amount;
}

export async function spendCredits(amount: number): Promise<boolean> {
  if (credits < amount) return false;
  credits -= amount;
  return true;
}

// 🔥 COMPATIBILITÀ
export async function canGenerate() {
  return await canProceedGeneration();
}

export async function consumeGeneration() {
  await increaseGenerationCount();
}

export async function checkProAccess() {
  return { ok: true };
}

export async function checkFeatureAccess() {
  return { ok: true };
}

export async function getBillingState() {
  return { plan: "free" };
}