import { ResizeMode, Video } from "expo-av";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ===== VIDEO LOCALI ===== */
const dance1 = require("../../assets/videos/dance1.mp4");
const dance2 = require("../../assets/videos/dance2.mp4");
const dance3 = require("../../assets/videos/dance3.mp4");
const dance4 = require("../../assets/videos/dance4.mp4");
const dance5 = require("../../assets/videos/dance5.mp4");

const fantasyAI1 = require("../../assets/videos/fantasyAI1.mp4");
const fantasyAI2 = require("../../assets/videos/fantasyAI2.mp4");
const fantasyAI3 = require("../../assets/videos/fantasyAI3.mp4");
const fantasyAI4 = require("../../assets/videos/fantasyAI4.mp4");
const fantasyAI5 = require("../../assets/videos/fantasyAI5.mp4");

const calcio1 = require("../../assets/videos/calcio1.mp4");
const calcio2 = require("../../assets/videos/calcio2.mp4");
const calcio3 = require("../../assets/videos/calcio3.mp4");
const calcio4 = require("../../assets/videos/calcio4.mp4");

const autoscatto1 = require("../../assets/videos/autoscatto1.mp4");
const autoscatto2 = require("../../assets/videos/autoscatto2.mp4");
const autoscatto3 = require("../../assets/videos/autoscatto3.mp4");
const autoscatto4 = require("../../assets/videos/autoscatto4.mp4");
const autoscatto5 = require("../../assets/videos/autoscatto5.mp4");

const winter1 = require("../../assets/videos/winter1.mp4");
const winter2 = require("../../assets/videos/winter2.mp4");
const winter3 = require("../../assets/videos/winter3.mp4");
const winter4 = require("../../assets/videos/winter4.mp4");
const winter5 = require("../../assets/videos/winter5.mp4");
const winter6 = require("../../assets/videos/winter6.mp4");

/* ===== CALCIATORI (MINIMI) ===== */
const PLAYERS = ["Messi", "Ronaldo", "Mbappé"];

/* ===== SEZIONI ===== */
const SECTIONS = [
  {
    key: "dance",
    title: "💃 Dance AI",
    templates: [dance1, dance2, dance3, dance4, dance5],
  },
  {
    key: "fantasy",
    title: "🧙 Fantasy AI",
    templates: [fantasyAI1, fantasyAI2, fantasyAI3, fantasyAI4, fantasyAI5],
  },
  {
    key: "autoscatto",
    title: "📸 Autoscatto",
    templates: [autoscatto1, autoscatto2, autoscatto3, autoscatto4, autoscatto5],
  },
  {
    key: "calcio",
    title: "⚽ Calcio AI",
    templates: [calcio1, calcio2, calcio3, calcio4],
  },
  {
    key: "winter",
    title: "❄️ Winter AI",
    templates: [winter1, winter2, winter3, winter4, winter5, winter6],
  },
];

export default function Explore() {
  const router = useRouter();

  // 👉 stato SOLO per calcio
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<{
    index: number;
  } | null>(null);

  const handleTemplatePress = (
    sectionKey: string,
    index: number
  ) => {
    if (sectionKey === "calcio") {
      setPendingTemplate({ index });
    } else {
      router.push({
        pathname: "/create",
        params: {
          category: sectionKey,
          index,
        },
      });
    }
  };

  const handlePlayerSelect = (player: string) => {
    if (!pendingTemplate) return;

    router.push({
      pathname: "/create",
      params: {
        category: "calcio",
        index: pendingTemplate.index,
        player,
      },
    });

    setSelectedPlayer(null);
    setPendingTemplate(null);
  };

  return (
    <ScrollView style={styles.container}>
      {SECTIONS.map((section) => (
        <View key={section.key} style={styles.section}>
          <Text style={styles.title}>{section.title}</Text>

          {/* 👉 SEZIONE CALCIATORI (solo calcio) */}
          {section.key === "calcio" && pendingTemplate && (
            <View style={styles.playersRow}>
              {PLAYERS.map((player) => (
                <TouchableOpacity
                  key={player}
                  style={styles.playerChip}
                  onPress={() => handlePlayerSelect(player)}
                >
                  <Text style={styles.playerText}>{player}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {section.templates.map((video, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() =>
                  handleTemplatePress(section.key, index)
                }
              >
                <Video
                  source={video}
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isLooping
                  isMuted
                />

                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>Usa template</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

/* ===== STILI ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 20,
  },
  section: {
    marginBottom: 28,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 16,
    marginBottom: 10,
  },
  playersRow: {
    flexDirection: "row",
    marginLeft: 16,
    marginBottom: 10,
  },
  playerChip: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 10,
  },
  playerText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  card: {
    width: 140,
    height: 200,
    marginHorizontal: 10,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  overlayText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});