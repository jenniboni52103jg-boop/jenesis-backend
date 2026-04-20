import Purchases from "react-native-purchases";

/* ================= INIT ================= */
export async function initRevenueCat() {
  try {
    await Purchases.configure({
      apiKey: "appl_KVREdrrSHPaulxZHkXRIekUIhZA", // 🔑 tua API key
    });

    console.log("✅ RevenueCat ready");
  } catch (e) {
    console.log("❌ RevenueCat error", e);
  }
}

/* ================= GET OFFERS ================= */
export async function getOffers() {
  try {
    const offerings = await Purchases.getOfferings();

    console.log("🔥 OFFERINGS:", offerings);

    if (offerings.current) {
      console.log("🔥 PACKAGES:", offerings.current.availablePackages);
      return offerings.current.availablePackages;
    }

    return [];
  } catch (e) {
    console.log("❌ Errore offerings:", e);
    return [];
  }
}

/* ================= BUY PACKAGE ================= */
export async function buyPackage(pkg: any) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    if (customerInfo.entitlements.active["pro"]) {
      console.log("🔥 UTENTE PREMIUM ATTIVO");
    }

    return customerInfo;
  } catch (e: any) {
    if (!e.userCancelled) {
      console.log("❌ purchase error", e);
    }
    return null;
  }
}

/* ================= QUICK BUY (DEFAULT) ================= */
export async function purchasePro() {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages[0];

    if (!pkg) throw new Error("No package");

    const { customerInfo } = await Purchases.purchasePackage(pkg);

    return customerInfo;
  } catch (e: any) {
    if (!e.userCancelled) {
      console.log("❌ purchase error", e);
    }
    return null;
  }
}

/* ================= RESTORE ================= */
export async function restorePurchases() {
  try {
    const res = await Purchases.restorePurchases();
    return res;
  } catch (e) {
    console.log("❌ restore error", e);
    return null;
  }
}

/* ================= CHECK PREMIUM ================= */
export async function checkPremium() {
  try {
    const info = await Purchases.getCustomerInfo();

    return !!info.entitlements.active["pro"];
  } catch (e) {
    console.log("❌ check premium error", e);
    return false;
  }
}

/* ================= GET USER PLAN ================= */
export async function getUserPlan() {
  const isPro = await checkPremium();

  return {
    plan: isPro ? "pro" : "free",
  };
}

