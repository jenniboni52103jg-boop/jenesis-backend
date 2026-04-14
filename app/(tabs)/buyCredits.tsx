import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { getBillingState,} from "../services/billing";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCredits } from "../contexts/CreditsContext";
import { getOffers, buyPackage } from "../services/revenuecat";
import Purchases from 'react-native-purchases';
import {
  Animated,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const buyProduct = async (productId: string) => {
  try {
    const offerings = await Purchases.getOfferings();
    console.log("CLICK:", productId);
    console.log("OFFERINGS:", offerings.current);
    
    if (!offerings.current) {
      console.log("❌ Nessun offering");
      return;
    }

    const pkg = offerings.current.availablePackages.find(
      (p) => p.product.identifier === productId
    );

    if (!pkg) {
      console.log("❌ Prodotto non trovato:", productId);
      return;
    }

    const purchase = await Purchases.purchasePackage(pkg);

    console.log("✅ ACQUISTO OK:", purchase);
  } catch (e) {
    console.log("❌ ERRORE:", e);
  }
};

const isPro = true;
/* 👇 METTI QUI (fuori dal componente) */
const getPackagesMap = async () => {
  const packages = await getOffers();

  const map: any = {};

  packages.forEach((pkg: any) => {
    if (pkg.packageType === "WEEKLY") map.weekly = pkg;
    if (pkg.packageType === "MONTHLY") map.monthly = pkg;
    if (pkg.packageType === "ANNUAL") map.annual = pkg;
  });

  return map;
};
/* 👆 FINE */
export default function ShopScreen() {
  const { setCredits } = useCredits();

  const handleBuyCredits = async () => {
  const newCredits = selectedPack.credits;

  await AsyncStorage.setItem("credits", String(newCredits));
  setCredits(newCredits);
};
 
const [plans, setPlans] = useState<any>(null);

useEffect(() => {
  loadPlans();
}, []);

const loadPlans = async () => {
  const res = await getPackagesMap();
  setPlans(res);
};

  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [plan, setPlanState] = useState<"free" | "pro">("free");

  const [plansOpen, setPlansOpen] = useState(false);

  const [creditsOpen, setCreditsOpen] = useState(false);

const CREDIT_PACKS = [
  { id: "c330", credits: 330, price: 6.0 },
  { id: "c660", credits: 660, price: 10.0 },
  { id: "c1320", credits: 1320, price: 22.0 },
  { id: "c3300", credits: 3300, price: 60.0 },
  { id: "c6600", credits: 6600, price: 100.0 },
  { id: "c13200", credits: 13200, price: 229.0 },
] as const;

const [selectedPackId, setSelectedPackId] = useState<(typeof CREDIT_PACKS)[number]["id"]>(
  CREDIT_PACKS[0].id
);

const selectedPack = CREDIT_PACKS.find(p => p.id === selectedPackId)!;

const euro = (n: number) =>
  n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });

useFocusEffect(
  useCallback(() => {
    let alive = true;

 (async () => {
     // const state = await getBillingState();
      //if (alive) setPlanState(state.plan as "free" | "pro");
    })();

    return () => {
      alive = false;
    };
  }, [])
  
);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

 const handlePurchase = async (piano: string) => {
  if (plan === "pro") {
    Alert.alert("💎 PRO già attivo");
    return;
  }

  try {
    const offerings = await Purchases.getOfferings();

    const selectedPackage =
      piano === "annuale"
        ? offerings.current?.annual
        : piano === "mensile"
        ? offerings.current?.monthly
        : offerings.current?.weekly;

    if (!selectedPackage) {
      Alert.alert("Errore", "Pacchetto non trovato");
      return;
    }

    await Purchases.purchasePackage(selectedPackage);

    Alert.alert("🔥 PRO ATTIVO!");
  } catch (e) {
    console.log("Errore acquisto:", e);
  }
};

  return (
  <LinearGradient
    colors={["#0B0F2F", "#1B1464", "#2E2A8A"]}
    style={styles.container}
  >
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* HEADER */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={styles.title}>Sblocca Jenesis AI 🚀</Text>
        <Text style={styles.subtitle}>Crea video virali senza limiti</Text>

        <View style={styles.planBadgeRow}>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>
              {plan === "pro" ? "💎 PRO ACTIVE" : "🟢 FREE PLAN"}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* FREE */}
      <Animated.View style={[styles.compareBox, { opacity: fadeAnim }]}>
        <View style={styles.compareCol}>
          <Text style={styles.compareTitle}>FREE</Text>
          <Text style={styles.compareItem}>• 1 video / giorno</Text>
          <Text style={styles.compareItem}>• Watermark</Text>
          <Text style={styles.compareItem}>• Qualità media</Text>

          
        </View>
      {/* PRO FEATURES */}
        <View style={styles.compareCol}>
          <Text style={styles.compareTitle}>PRO 💎</Text>
          <Text style={styles.compareItem}>• 10 video / giorno</Text>
          <Text style={styles.compareItem}>• No watermark</Text>
          <Text style={styles.compareItem}>• Qualità HD</Text>
          <Text style={styles.compareItem}>• Accesso ai trend</Text>
          <Text style={styles.compareItem}>• Rendering prioritario</Text>
        </View>
      </Animated.View>

      {/* PRO UNLIMITED */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💎 Pro Unlimited</Text>
        <Text style={styles.feature}>✅ Video illimitati (fair use)</Text>
        <Text style={styles.feature}>✅ Nessun watermark</Text>
        <Text style={styles.feature}>✅ Qualità HD</Text>
        <Text style={styles.feature}>✅ Video più lunghi</Text>
        <Text style={styles.feature}>✅ Priorità massima</Text>
      </View>

      {/* PRICING */}
      <View style={styles.pricing}>
        <TouchableOpacity
  style={styles.priceCard}
  onPress={() => buyProduct("pro_weekly")}
>
  <Text style={styles.priceTitle}>Settimanale</Text>
  <Text style={styles.price}>4,99 €</Text>
</TouchableOpacity>

        <TouchableOpacity
  style={styles.priceCard}
  onPress={() => buyProduct("pro_monthly")}
>
  <Text style={styles.priceTitle}>Mensile</Text>
  <Text style={styles.price}>14,99 €</Text>
</TouchableOpacity>

        <TouchableOpacity
          style={[styles.priceCard, styles.best]}
          onPress={async () => {
  if (!plans?.annual) return;
  await buyPackage(plans.annual);
  Alert.alert("Successo", "Abbonamento attivato!");
}}
        >
          <Text style={styles.bestBadge}>🔥 Miglior valore</Text>
          <Text style={styles.priceTitle}>Annuale</Text>
          <Text style={styles.price}>69,99 €</Text>
          <Text style={styles.save}>Risparmi oltre il 60%</Text>
        </TouchableOpacity>
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.cta} onPress={() => buyProduct("pro_yearly")}>
        <Text style={styles.ctaText}>Vai Pro Unlimited</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setPlansOpen(true)}
        style={styles.viewAllLink}
      >
        <Text style={styles.viewAllText}>View all plans & features</Text>
      </TouchableOpacity>

      {/* CREDITS INFO */}
      <View style={styles.creditsBox}>
        <Text style={styles.creditsTitle}>💡 Vuoi di più?</Text>
        <Text style={styles.creditsText}>
          Usa i crediti per video più lunghi, effetti avanzati e priorità extra.
        </Text>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => setCreditsOpen(true)}
        >
          <Text style={styles.secondaryText}>Acquista Crediti</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
<View style={styles.footerRow}>
  <Text style={styles.footerText}>Annulla in qualsiasi momento · </Text>

  <Pressable onPress={() =>
  router.replace({
    pathname: "/",
    params: { openModal: "privacy" },
  })
}
>
    <Text style={[styles.footerText, styles.footerLink]}>Privacy Policy</Text>
  </Pressable>

  <Text style={styles.footerText}> · </Text>

  <Pressable onPress={() =>
  router.replace({
    pathname: "/",
    params: { openModal: "terms" },
  })
}
>
  
    <Text style={[styles.footerText, styles.footerLink]}>Termini</Text>
  </Pressable>
</View>
</ScrollView>

    {/* ===== MODAL: ALL PLANS ===== */}
    <Modal visible={plansOpen} animationType="slide" transparent
     onRequestClose={() => setPlansOpen(false)}
>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All plans & features</Text>

            <TouchableOpacity
              onPress={() => setPlansOpen(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 18 }}
          >
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>🟢 FREE PLAN</Text>
              <Text style={styles.modalItem}>• 1 video / giorno</Text>
              <Text style={styles.modalItem}>• Watermark</Text>
              <Text style={styles.modalItem}>• Qualità media</Text>
            </View>
            {/* PRO */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>💎 PRO</Text>
              <Text style={styles.modalItem}>• 10 video / giorno</Text>
              <Text style={styles.modalItem}>• Nessun watermark</Text>
              <Text style={styles.modalItem}>• Qualità HD</Text>
              <Text style={styles.modalItem}>• Accesso ai trend</Text>
            <Text style={styles.modalItem}>• Rendering prioritario</Text>
           </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>💎 PRO UNLIMITED</Text>
              <Text style={styles.modalItem}>• Video illimitati (fair use)</Text>
              <Text style={styles.modalItem}>• Nessun watermark</Text>
              <Text style={styles.modalItem}>• Qualità HD</Text>
              <Text style={styles.modalItem}>• Video più lunghi</Text>
              <Text style={styles.modalItem}>• Priorità massima</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Pricing</Text>

              <View style={styles.modalPriceRow}>
                <Text style={styles.modalPriceLabel}>Settimanale</Text>
                <Text style={styles.modalPriceValue}>4,99 €</Text>
              </View>

              <View style={styles.modalPriceRow}>
                <Text style={styles.modalPriceLabel}>Mensile</Text>
                <Text style={styles.modalPriceValue}>14,99 €</Text>
              </View>

              <View style={[styles.modalPriceRow, styles.modalBestRow]}>
                <Text style={styles.modalPriceLabel}>Annuale</Text>
                <Text style={styles.modalPriceValue}>69,99 €</Text>
              </View>

              <Text style={styles.modalHint}>
                🔥 Miglior valore: Annuale (risparmi oltre il 60%)
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCTA}
              onPress={() => setPlansOpen(false)}
            >
              <Text style={styles.modalCTAText}>Ok, ho capito</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* ===== MODAL: CREDITS ===== */}
    <Modal visible={creditsOpen} animationType="slide" transparent
     onRequestClose={() => setPlansOpen(false)}
>
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setCreditsOpen(false)}
      >
        <Pressable style={styles.creditsModalCard} onPress={() => {}}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.creditsModalTitle}>Acquista Crediti</Text>
            <TouchableOpacity onPress={() => setCreditsOpen(false)}>
              <Text style={styles.creditsModalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.creditsModalSubtitle}>
            Seleziona un pacchetto (validi 2 anni)
          </Text>

          <View style={styles.creditsGrid}>
            {CREDIT_PACKS.map((p) => {
              const selected = p.id === selectedPackId;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.9}
                  onPress={() => setSelectedPackId(p.id)}
                  style={[
                    styles.creditTile,
                    selected && styles.creditTileSelected,
                  ]}
                >
                  <Text style={styles.creditTilePrice}>{euro(p.price)}</Text>
                  <Text style={styles.creditTileCredits}>
  {Number(p.credits) === 120
    ? "💎 120 crediti 🔥 Best Deal"
    : "🔥 " + p.credits}
</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.purchaseBtn} onPress={handleBuyCredits}>
            <Text style={styles.purchaseBtnText}>
              Purchase Now • {euro(selectedPack.price)}
            </Text>
          </TouchableOpacity>

          <Text style={styles.modalFinePrint}>
            Pagamento simulato (mock). Collegheremo lo store più avanti.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  </LinearGradient>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
  },
  subtitle: {
    color: "#c7c7ff",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 9
    ,
  },
  compareBox: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  compareCol: { flex: 1 },
  compareTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },
  compareItem: {
    color: "#dcdcff",
    fontSize: 13,
    marginBottom: 4,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  feature: {
    color: "#e5e7eb",
    marginVertical: 4,
  },
  pricing: { gap: 14 },
  priceCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
  },
  best: {
    borderWidth: 2,
    borderColor: "#a78bfa",
    backgroundColor: "rgba(167,139,250,0.25)",
  },
  bestBadge: {
    color: "#fff",
    backgroundColor: "#a78bfa",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginBottom: 6,
  },
  priceTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 6,
  },
  save: {
    color: "#d8b4fe",
    marginTop: 4,
    fontSize: 12,
  },
  cta: {
    backgroundColor: "#7c3aed",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 30,
  },
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  creditsBox: {
    marginTop: 40,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
  },
  creditsTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 6,
  },
  creditsText: {
    color: "#c7c7ff",
    fontSize: 13,
    marginBottom: 12,
  },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
    marginTop: 30,
  },

  planBadge: {
  alignSelf: "center",
  marginTop: 8,
  backgroundColor: "rgba(255,255,255,0.12)",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
},
planBadgeText: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "700",
  letterSpacing: 0.5,
},

planBadgeRow: {
  width: "100%",
  alignItems: "flex-end",
  marginTop: 10, // distanza sotto al subtitle
},

//MODAL VIEW ALL PLANS 

viewAllLink: {
  marginTop: 14,
  alignSelf: "center",
  paddingVertical: 8,
},
viewAllText: {
  color: "rgba(255,255,255,0.85)",
  fontSize: 14,
  fontWeight: "700",
  textDecorationLine: "underline",
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.55)",
  justifyContent: "flex-end",
},
modalCard: {
  backgroundColor: "#15133a",
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 18,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  maxHeight: "82%",
},
modalHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
},
modalTitle: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "800",
},
modalClose: {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.10)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
},
modalCloseText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "800",
},

modalSection: {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: 18,
  padding: 14,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
},
modalSectionTitle: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "800",
  marginBottom: 8,
},
modalItem: {
  color: "rgba(255,255,255,0.85)",
  fontSize: 14,
  marginBottom: 4,
},

modalPriceRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(255,255,255,0.08)",
},
modalBestRow: {
  borderBottomWidth: 0,
},
modalPriceLabel: {
  color: "rgba(255,255,255,0.85)",
  fontSize: 14,
  fontWeight: "700",
},
modalPriceValue: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "900",
},
modalHint: {
  marginTop: 10,
  color: "rgba(216,180,254,0.95)",
  fontSize: 12,
  fontWeight: "700",
},

modalCTA: {
  marginTop: 6,
  backgroundColor: "#7c3aed",
  paddingVertical: 14,
  borderRadius: 16,
  alignItems: "center",
},
modalCTAText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "900",
},

//MODAL ACQUISTA CREDITS

creditsModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.55)",
  justifyContent: "flex-end",
},

creditsModalCard: {
  backgroundColor: "#0B0F2F",
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 18,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
},

modalHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

creditsModalTitle: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "800",
},

creditsModalClose: {
  color: "rgba(255,255,255,0.8)",
  fontSize: 18,
  fontWeight: "700",
  paddingHorizontal: 8,
  paddingVertical: 6,
},

creditsModalSubtitle: {
  color: "rgba(255,255,255,0.7)",
  marginTop: 8,
  marginBottom: 14,
  fontSize: 13,
},

creditsGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: 12,
},

creditTile: {
  width: "48%",
  backgroundColor: "rgba(255,255,255,0.08)",
  borderRadius: 16,
  paddingVertical: 18,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
},

creditTileSelected: {
  borderColor: "rgba(167,139,250,0.9)",
  backgroundColor: "rgba(167,139,250,0.18)",
},

creditTileCredits: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "800",
},

creditTilePrice: {
  color: "rgba(255,255,255,0.75)",
  marginTop: 6,
  fontSize: 13,
},

purchaseBtn: {
  marginTop: 16,
  backgroundColor: "#7c3aed",
  paddingVertical: 16,
  borderRadius: 16,
  alignItems: "center",
},

purchaseBtnText: {
  color: "#fff",
  fontWeight: "800",
  fontSize: 15,
},

modalFinePrint: {
  color: "rgba(255,255,255,0.45)",
  fontSize: 12,
  textAlign: "center",
  marginTop: 10,
},

//FOOTER STYLES
footerRow: {
  flexDirection: "row",
  justifyContent: "center",
  flexWrap: "wrap",
  marginTop: 30,
},
footerText: {
  color: "#9ca3af",
  fontSize: 12,
  textAlign: "center",
},
footerLink: {
  textDecorationLine: "underline",
  color: "#c7c7ff",
  fontWeight: "700",
},
});