import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ShopScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

  // 🔒 MOCK temporaneo (simula acquisto)
  const handlePurchase = (plan: string) => {
    alert(`🧪 Acquisto simulato: ${plan}`);
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
          <Text style={styles.title}>Sblocca Jennifer AI 🚀</Text>
          <Text style={styles.subtitle}>
            Crea video virali senza limiti
          </Text>
        </Animated.View>

        {/* FREE vs PRO */}
        <Animated.View style={[styles.compareBox, { opacity: fadeAnim }]}>
          <View style={styles.compareCol}>
            <Text style={styles.compareTitle}>FREE</Text>
            <Text style={styles.compareItem}>• 1 video / giorno</Text>
            <Text style={styles.compareItem}>• Watermark</Text>
            <Text style={styles.compareItem}>• Qualità media</Text>
          </View>

          <View style={styles.compareCol}>
            <Text style={styles.compareTitle}>PRO 💎</Text>
            <Text style={styles.compareItem}>• Video illimitati</Text>
            <Text style={styles.compareItem}>• No watermark</Text>
            <Text style={styles.compareItem}>• Qualità HD</Text>
            <Text style={styles.compareItem}>• Accesso ai trend</Text>
            <Text style={styles.compareItem}>• Rendering prioritario</Text>
          </View>
        </Animated.View>

        {/* PRO FEATURES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💎 Pro Unlimited</Text>
          <Text style={styles.feature}>✅ Video illimitati (fair use)</Text>
          <Text style={styles.feature}>✅ Nessun watermark</Text>
          <Text style={styles.feature}>✅ Qualità HD</Text>
          <Text style={styles.feature}>✅ Accesso ai trend</Text>
          <Text style={styles.feature}>✅ Rendering prioritario</Text>
        </View>

        {/* PRICING */}
        <View style={styles.pricing}>
          <TouchableOpacity
            style={styles.priceCard}
            onPress={() => handlePurchase("Settimanale")}
          >
            <Text style={styles.priceTitle}>Settimanale</Text>
            <Text style={styles.price}>4,99 €</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.priceCard}
            onPress={() => handlePurchase("Mensile")}
          >
            <Text style={styles.priceTitle}>Mensile</Text>
            <Text style={styles.price}>14,99 €</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.priceCard, styles.best]}
            onPress={() => handlePurchase("Annuale")}
          >
            <Text style={styles.bestBadge}>🔥 Miglior valore</Text>
            <Text style={styles.priceTitle}>Annuale</Text>
            <Text style={styles.price}>69,99 €</Text>
            <Text style={styles.save}>Risparmi oltre il 60%</Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta}>
          <Text style={styles.ctaText}>Vai Pro Unlimited</Text>
        </TouchableOpacity>

        {/* CREDITS INFO */}
        <View style={styles.creditsBox}>
          <Text style={styles.creditsTitle}>💡 Vuoi di più?</Text>
          <Text style={styles.creditsText}>
            Usa i crediti per video più lunghi, effetti avanzati e priorità extra.
          </Text>

          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>Acquista Crediti</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Annulla in qualsiasi momento · Privacy & Termini
        </Text>
      </ScrollView>
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
    marginBottom: 30,
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
});