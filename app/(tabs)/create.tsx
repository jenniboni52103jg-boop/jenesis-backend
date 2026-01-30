import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  BASE_PROMPT,
  CALCIO_PLAYERS,
  PRESETS,
  SCENES
} from "./services/calcioPrompts";

const buildCalcioPrompts = (
  player: keyof typeof CALCIO_PLAYERS,
  preset: keyof typeof PRESETS
) => {
  return SCENES.map(scene => `
${BASE_PROMPT}
A realistic photo of the user together with ${CALCIO_PLAYERS[player]}.
They are ${scene}.
${PRESETS[preset]}
`);
};

/* ===== TEMPLATE LOCALI (UGUALI A EXPLORE) ===== */
const TEMPLATE_MAP: Record<string, any[]> = {
  dance: [
    //require("../../assets/videos/dance1.mp4"),//
    //require("../../assets/videos/dance2.mp4"),//
   //require("../../assets/videos/dance3.mp4"),//
   //require("../../assets/videos/dance4.mp4"),//
    //require("../../assets/videos/dance5.mp4"),//
    //require("../../assets/videos/dance6.mp4"),//
  ],
  fantasy: [
    require("../../assets/videos/fantasyAI1.mp4"),
    require("../../assets/videos/fantasyAI2.mp4"),
    require("../../assets/videos/fantasyAI3.mp4"),
    require("../../assets/videos/fantasyAI4.mp4"),
    require("../../assets/videos/fantasyAI5.mp4"),
  ],
  autoscatto: [
    require("../../assets/videos/autoscatto1.mp4"),
    require("../../assets/videos/autoscatto2.mp4"),
    require("../../assets/videos/autoscatto3.mp4"),
    require("../../assets/videos/autoscatto4.mp4"),
    require("../../assets/videos/autoscatto5.mp4"),
  ],
  calcio: [
    require("../../assets/videos/calcio1.mp4"),
    require("../../assets/videos/calcio2.mp4"),
    require("../../assets/videos/calcio3.mp4"),
    require("../../assets/videos/calcio4.mp4"),
  ],
  winter: [
    require("../../assets/videos/winter1.mp4"),
    require("../../assets/videos/winter2.mp4"),
    require("../../assets/videos/winter3.mp4"),
    require("../../assets/videos/winter4.mp4"),
    require("../../assets/videos/winter5.mp4"),
    require("../../assets/videos/winter6.mp4"),
  ],
};

export default function Create() {
  const router = useRouter();

  // ===== RISULTATI IMMAGINI (CALCIO) =====
const [results, setResults] = useState<string[]>([]);
const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

useEffect(() => {
  setResults([
    "https://picsum.photos/600/900?1",
    "https://picsum.photos/600/900?2",
    "https://picsum.photos/600/900?3",
    "https://picsum.photos/600/900?4",
  ]);
}, []);

  // NEW 👉 leggiamo anche il calciatore scelto
  const { category, index, player } = useLocalSearchParams<{
    category?: string;
    index?: string;
    player?: string;
  }>();

  const templateVideo =
    TEMPLATE_MAP[category || "dance"]?.[Number(index) || 0];

     const [loading, setLoading] = useState(false);
    

  /* ===== UI STATE ===== */
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [showAIVideo, setShowAIVideo] = useState(false);
  const [mediaPermission, requestMediaPermission] =
  MediaLibrary.usePermissions();

  /* ===== AI TEXT (placeholder) ===== */
  const [textPrompt, setTextPrompt] = useState("");
  

  /* ===== PICK FACE ===== */
  const pickFace = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFaceImage(result.assets[0].uri);
    }
  };
  const saveSelectedImage = async () => {
  if (selectedIndex === null) {
    Alert.alert("Seleziona una foto", "Tocca una foto prima di salvarla");
    return;
  }

  if (!mediaPermission?.granted) {
    const permission = await requestMediaPermission();
    if (!permission.granted) {
      Alert.alert(
        "Permesso negato",
        "Serve il permesso per salvare l'immagine"
      );
      return;
    }
  }

  try {
    const uri = results[selectedIndex];
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert("Salvata", "L'immagine è stata salvata nella galleria 📸");
  } catch (err) {
    Alert.alert("Errore", "Impossibile salvare l'immagine");
  }
};


  {results.length > 0 && (
  <View style={styles.grid}>
    {results.map((uri, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => setSelectedIndex(index)}
        style={[
          styles.imageWrapper,
          selectedIndex === index && styles.imageSelected,
        ]}
      >
        <Image source={{ uri }} style={styles.resultImage} />
      </TouchableOpacity>
    ))}
  </View>
)}

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <Text style={styles.title}>Create</Text>

        {/* NEW 👉 CALCIATORE SELEZIONATO */}
        {category === "calcio" && player && (
          <Text style={styles.subtitle}>
            ⚽ Con {player}
          </Text>
        )}

        {/* TEMPLATE PREVIEW */}
        {templateVideo && (
          <Video
            source={templateVideo}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
          />
        )}

        {/* FACE UPLOAD */}
        <View style={styles.faceBox}>
          {faceImage ? (
            <Image source={{ uri: faceImage }} style={styles.facePreview} />
          ) : (
            <TouchableOpacity style={styles.facePlaceholder} onPress={pickFace}>
              <Text style={styles.faceIcon}>🙂</Text>
              <Text style={styles.faceText}>Carica il tuo volto</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* AI VIDEO INPUT */}
        {showAIVideo && (
          <>
            <TextInput
              placeholder="Descrivi il video AI…"
              placeholderTextColor="#777"
              value={textPrompt}
              onChangeText={setTextPrompt}
              style={styles.input}
              multiline
            />

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Genera AI Video</Text>
            </TouchableOpacity>
          </>
        )}

        {loading && (
          <ActivityIndicator
           size="large" 
           color="#fff" 
           style={{ marginTop: 20 }} 
          />
        )}
      </ScrollView>

      {/* ===== RADIAL MENU (NON TOCCATO) ===== */}
      <View style={styles.radial}>
        <TouchableOpacity
          style={styles.circle}
          onPress={() => setShowAIVideo((v) => !v)}
        >
          <Text style={styles.icon}>🎬</Text>
          <Text style={styles.label}>AI Video</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.circle} onPress={pickFace}>
          <Text style={styles.icon}>🖼</Text>
          <Text style={styles.label}>AI Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circle}
          onPress={() => alert("✨ Effects – prossimamente")}
        >
          <Text style={styles.icon}>✨</Text>
          <Text style={styles.label}>Effects</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circle}
          onPress={() => alert("🧍 Avatar 2.0 – prossimamente")}
        >
          <Text style={styles.icon}>🧍</Text>
          <Text style={styles.label}>Avatar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ===== STILI (UGUALI + 1 AGGIUNTA) ===== */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    padding: 24,
    paddingBottom: 360,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  subtitle: {
    color: "#aaa",
    marginBottom: 14,
    fontSize: 14,
  },
  video: {
    width: "100%",
    height: 300,
    borderRadius: 14,
    marginBottom: 20,
  },

  faceBox: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 20,
  },
  facePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
  faceIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  faceText: {
    color: "#aaa",
    fontSize: 12,
  },
  facePreview: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#fff",
  },

  input: {
    width: "85%",
    minHeight: 90,
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#222",
    marginTop: 16,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#1a1a1a",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
  },
  buttonDisable: {
    opacity: 0.6,
    },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  radial: {
    position: "absolute",
    bottom: -40,
    width: "100%",
    height: 300,
    backgroundColor: "#0e0e0e",
    borderTopLeftRadius: 300,
    borderTopRightRadius: 300,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    margin: 12,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  grid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginTop: 16,
},

imageWrapper: {
  width: "48%",
  aspectRatio: 9 / 16,
  borderRadius: 12,
  overflow: "hidden",
  marginBottom: 12,
  borderWidth: 2,
  borderColor: "transparent",
},

imageSelected: {
  borderColor: "#00FFAA",
},

resultImage: {
  width: "100%",
  height: "100%",
},
});