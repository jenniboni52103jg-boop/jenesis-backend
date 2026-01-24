import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


export default function Create() {
  const router = useRouter();

  // TESTO → VIDEO
  const [textPrompt, setTextPrompt] = useState("");
  const [textVideoDone, setTextVideoDone] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { from } =useLocalSearchParams();

  useEffect(() => {
  if (from === "explore") {
    pickImages();
  }
}, [from]);




  // 📸 IMAGE PICKER (per AI Image)
  const pickImages = async () => {
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    alert("🖼 AI Image – prossimamente");
  };

  // 💾 Salva progetto
  const saveProject = async (videoUrl: string) => {
    try {
      const existing = await AsyncStorage.getItem("projects");
      const projects = existing ? JSON.parse(existing) : [];

      const newProject = {
        id: Date.now().toString(),
        prompt: textPrompt,
        videoUrl,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        "projects",
        JSON.stringify([newProject, ...projects])
      );
    } catch (e) {
      console.error("Errore salvataggio progetto", e);
    }
  };

  // 🎬 TESTO → VIDEO
  const createVideoFromText = async () => {
    if (!textPrompt.trim()) {
      alert("Scrivi del testo ✍️");
      return;
    }

    try {
      setLoading(true);
      setTextVideoDone(false);
      setGeneratedVideoUrl(null);

      const res = await fetch(
        "https://injurable-giavanna-purselike.ngrok-free.dev/text-to-video",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: textPrompt }),
        }
      );

      const data = await res.json();
      if (!data.videoUrl) throw new Error("Video non ricevuto");

      setGeneratedVideoUrl(data.videoUrl);
      setTextVideoDone(true);
      await saveProject(data.videoUrl);
    } catch (e) {
      alert("❌ Errore creazione video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create</Text>

        {/* INPUT */}
        <TextInput
          placeholder="Descrivi il video AI…"
          placeholderTextColor="#777"
          value={textPrompt}
          onChangeText={setTextPrompt}
          style={styles.input}
          multiline
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={createVideoFromText}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creazione in corso…" : "Genera AI Video"}
          </Text>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        )}

        {textVideoDone && (
          <Text style={styles.success}>🎉 Video pronto</Text>
        )}

        {generatedVideoUrl && (
          <Video
            source={{ uri: generatedVideoUrl }}
            style={styles.video}
            useNativeControls
          />
        )}

        <Link href="/">
          <Text style={styles.link}>⬅ Home</Text>
        </Link>
      </ScrollView>

      {/* RADIAL MENU */}
      <View style={styles.radial}>
        <TouchableOpacity style={styles.circle}>
          <Text style={styles.icon}>🎬</Text>
          <Text style={styles.label}>AI Video</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.circle} onPress={pickImages}>
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
    marginBottom: 30,
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
  },
  button: {
    marginTop: 16,
    backgroundColor: "#1a1a1a",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  success: {
    marginTop: 14,
    color: "#4dff88",
    fontWeight: "600",
  },
  video: {
    width: "100%",
    height: 280,
    marginTop: 20,
    borderRadius: 12,
  },
  link: {
    marginTop: 24,
    color: "#4da6ff",
  },

  /* RADIAL */
  radial: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 320,
    backgroundColor: "#0e0e0e",
    borderTopLeftRadius: 300,
    borderTopRightRadius: 300,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 30,
  },
  circle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  icon: {
    fontSize: 30,
    marginBottom: 6,
  },
  label: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});