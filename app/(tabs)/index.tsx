import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#0B0F2F", "#1B1464", "#2E2A8A"]}
      style={styles.container}
    >
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Text style={styles.topIcon}>🎁</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.unlimitedBtn}
          onPress={() => router.push("/buyCredits")}
        >
          <Text style={styles.unlimitedText}>Go Unlimited</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={styles.hero}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Jennifer AI ✨</Text>
            <Text style={styles.heroSubtitle}>
              Crea video virali per TikTok e Reels in 30 secondi
            </Text>
          </View>
        </View>

        {/* MAIN CTA */}
        <TouchableOpacity
          style={styles.mainCta}
          onPress={() => router.push("/create")}
        >
          <Text style={styles.mainCtaText}>🎬 Crea il tuo primo video</Text>
        </TouchableOpacity>

        {/* BADGES */}
        <View style={styles.badges}>
          <Text style={styles.badge}>🔥 Trend di oggi</Text>
          <Text style={styles.badge}>⭐ Più usato</Text>
          <Text style={styles.badge}>🚀 Nuovi template</Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/create")}
          >
            <Text style={styles.actionTitle}>🎬 AI Video</Text>
            <Text style={styles.actionText}>Crea video virali</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionTitle}>🖼️ AI Image</Text>
            <Text style={styles.actionText}>Immagini creative</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionTitle}>🔥 Motion</Text>
            <Text style={styles.actionText}>Effetti dinamici</Text>
          </TouchableOpacity>
        </View>

        {/* TRENDS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trend</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.trendCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
                }}
                style={styles.trendImage}
              />
              <Text style={styles.trendText}>Dance AI</Text>
            </View>

            <View style={styles.trendCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
                }}
                style={styles.trendImage}
              />
              <Text style={styles.trendText}>Rapper Vibes</Text>
            </View>

            <View style={styles.trendCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
                }}
                style={styles.trendImage}
              />
              <Text style={styles.trendText}>Fantasy AI</Text>
            </View>
          </ScrollView>
        </View>

        {/* SECONDARY CTA */}
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push("/buyCredits")}
        >
          <Text style={styles.ctaText}>💎 Ottieni Crediti</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
  },

  topIcon: { fontSize: 26 },

  unlimitedBtn: {
    backgroundColor: "#a78bfa",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  unlimitedText: {
    color: "#1e1b4b",
    fontWeight: "bold",
  },

  hero: {
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    margin: 16,
  },

  heroImage: { width: "100%", height: "100%" },

  heroOverlay: {
    position: "absolute",
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    width: "100%",
  },

  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  heroSubtitle: {
    color: "#dcdcff",
    marginTop: 6,
  },

  mainCta: {
    backgroundColor: "#7c3aed",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },

  mainCtaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  badges: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },

  badge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 13,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 24,
  },

  actionCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 16,
    width: "31%",
  },

  actionTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  actionText: {
    color: "#c7c7ff",
    fontSize: 12,
    marginTop: 6,
  },

  section: {
    marginTop: 30,
    marginLeft: 16,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  trendCard: { marginRight: 14 },

  trendImage: {
    width: 140,
    height: 180,
    borderRadius: 16,
  },

  trendText: {
    color: "#fff",
    marginTop: 6,
    textAlign: "center",
  },

  cta: {
    backgroundColor: "#6C5CE7",
    margin: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});