"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPlan = getUserPlan;
exports.getngState = getngState;
exports.canProceedGeneration = canProceedGeneration;
exports.increaseGenerationCount = increaseGenerationCount;
exports.canUseFeature = canUseFeature;
exports.markFeatureUsed = markFeatureUsed;
exports.getCredits = getCredits;
exports.addCredits = addCredits;
exports.spendCredits = spendCredits;
exports.canGenerate = canGenerate;
exports.consumeGeneration = consumeGeneration;
exports.checkProAccess = checkProAccess;
exports.checkFeatureAccess = checkFeatureAccess;
exports.getBillingState = getBillingState;
// 🔥 stato in memoria (backend safe)
let state = {
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
async function getUserPlan() {
    return "free"; // 🔥 poi collegheremo PRO vero
}
// 🔥 STATO COMPLETO
async function getngState() {
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
async function canProceedGeneration() {
    const s = await getngState();
    if (s.plan !== "pro")
        return true;
    if (s.dailyGenerations > 20)
        return false;
    return true;
}
async function increaseGenerationCount() {
    state.dailyGenerations += 1;
}
// 🔥 FEATURE ACCESS
async function canUseFeature(feature) {
    const s = await getngState();
    if (s.plan === "pro")
        return { ok: true };
    let price = 0;
    let isFreeAllowed = false;
    if (feature === "effects") {
        if (!s.effectsUsed)
            isFreeAllowed = true;
        else
            price = 210;
    }
    if (feature === "talkingPhoto") {
        if (!s.talkingPhotoUsed)
            isFreeAllowed = true;
        else
            price = 210;
    }
    if (feature === "text") {
        if (s.textCount < 1)
            isFreeAllowed = true;
        else
            price = 180;
    }
    if (feature === "avatar" || feature === "imageVideo") {
        price = 210;
    }
    if (isFreeAllowed)
        return { ok: true };
    const credits = await getCredits();
    if (credits >= price) {
        return { ok: true, useCredits: true, price };
    }
    return { ok: false, type: "PAYWALL", price };
}
// 🔥 SEGNA UTILIZZO
async function markFeatureUsed(feature) {
    if (state.plan === "pro")
        return;
    if (feature === "effects")
        state.effectsUsed = true;
    if (feature === "talkingPhoto")
        state.talkingPhotoUsed = true;
    if (feature === "text")
        state.textCount += 1;
}
// 💰 CREDITI (in memoria)
let credits = 0;
async function getCredits() {
    return credits;
}
async function addCredits(amount) {
    credits += amount;
}
async function spendCredits(amount) {
    if (credits < amount)
        return false;
    credits -= amount;
    return true;
}
// 🔥 COMPATIBILITÀ
async function canGenerate() {
    return await canProceedGeneration();
}
async function consumeGeneration() {
    await increaseGenerationCount();
}
async function checkProAccess() {
    return { ok: true };
}
async function checkFeatureAccess() {
    return { ok: true };
}
async function getBillingState() {
    return { plan: "free" };
}
