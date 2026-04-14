import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { TEMPLATES } from "../../constants/templates";

const API_URL = "https://injurable-giavanna-purselike.ngrok-free.dev";

export default function TemplateDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [ratio, setRatio] = useState<"1:1" | "9:16" | "16:9">("9:16");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // In RN, meglio ReturnType<typeof setInterval> (evita NodeJS.Timeout error)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const retries = useRef(0);

  const template = TEMPLATES.find((t) => t.id === id);

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      progressTimer.current = null;
    };
  }, []);

  const getRatioStyle = () => {
    switch (ratio) {
      case "1:1":
        return { aspectRatio: 1 };
      case "9:16":
        return { aspectRatio: 9 / 16 };
      case "16:9":
        return { aspectRatio: 16 / 9 };
    }
  };

  /* ================= IMAGE PICK ================= */

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].base64 ?? null);
    }
  };

  /* ================= PROGRESS FAKE ================= */

  const startFakeProgress = () => {
    setProgress(5);
    if (progressTimer.current) clearInterval(progressTimer.current);

    progressTimer.current = setInterval(() => {
      setProgress((p) => (p < 95 ? p + 5 : p));
    }, 1200);
  };

  const stopProgress = () => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = null;
    setProgress(100);
  };

  /* ================= POLLING ================= */

  const pollJob = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/job-status/${jobId}`);
        const data = await res.json();

        if (data.status === "completed" && data.videoUrl) {
          clearInterval(interval);
          stopProgress();
          setLoading(false);

          const newProject = {
            id: jobId,
            prompt: template?.title || "AI Video",
            videoUrl: data.videoUrl,
            createdAt: new Date().toISOString(),
          };

          const stored = await AsyncStorage.getItem("projects");
          const projects = stored ? JSON.parse(stored) : [];

          projects.unshift(newProject);
          await AsyncStorage.setItem("projects", JSON.stringify(projects));

          router.push("/projects");
        }
      } catch {
        retries.current += 1;

        if (retries.current > 5) {
          clearInterval(interval);
          setLoading(false);
          // setErrorMsg("Il server è lento o non risponde. Riprova.");
        }
      }
    }, 3000);
  };

  /* ================= CREATE ================= */

  const createVideo = async () => {
    if (!photo || !template) return;

    setErrorMsg(null);
    retries.current = 0;
    setLoading(true);
    startFakeProgress();

    try {
      const res = await fetch(`${API_URL}/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          imageBase64: photo,
          ratio,
        }),
      });

      const data = await res.json();
      if (data?.jobId) pollJob(data.jobId);
      else {
        setLoading(false);
        // setErrorMsg("Risposta non valida dal server.");
      }
    } catch {
      setLoading(false);
      // setErrorMsg("Errore di rete. Controlla la connessione.");
    }
  };

  if (!template) return null;

  return (
    <View style={styles.container}>
      {/* BACKGROUND PREMIUM */}
      <LinearGradient
        colors={["#06081C", "#13104A", "#0A0B23"]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.glowTop} />

      {/* BACK */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </Pressable>

      {/* VIDEO + GLASS WRAP */}
      <View style={styles.glassWrap}>
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.10)",
            "rgba(255,255,255,0.04)",
            "rgba(0,0,0,0.18)",
          ]}
          style={styles.glassInner}
        >
          <View style={[styles.videoCard, getRatioStyle()]}>
            <Video
              source={template.video}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
            />

            {photo && (
              <View style={styles.photoPreview}>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${photo}` }}
                  style={styles.photoImage}
                />
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* RATIO */}
      <View style={styles.ratioRow}>
        {(["1:1", "9:16", "16:9"] as const).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRatio(r)}
            style={[styles.ratioButton, ratio === r && styles.ratioButtonActive]}
          >
            <Text style={[styles.ratioText, ratio === r && styles.ratioTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PROGRESS */}
      {loading && (
        <Text style={styles.progressText}>Generazione video… {progress}%</Text>
      )}

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {/* BOTTONI */}
      <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
        <Text style={styles.text}>
          {photo ? "Foto selezionata ✓" : "Scegli foto"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        disabled={!photo || loading}
        onPress={createVideo}
      >
        <LinearGradient
          colors={["#7C3AED", "#A855F7"]}
          style={[styles.createButtonInner, (!photo || loading) && { opacity: 0.55 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.text}>Crea video</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    padding: 16,
  },

  glowTop: {
    position: "absolute",
    top: -140,
    left: -140,
    right: -140,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(168,85,247,0.18)",
    transform: [{ rotate: "10deg" }],
  },

  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  glassWrap: {
    width: "100%",
    marginTop: 85,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  glassInner: {
    padding: 6,
    borderRadius: 28,
  },

  videoCard: {
    width: "100%",
    maxHeight: 420,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#000",
    alignSelf: "center",
  },

  photoPreview: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(180,140,255,0.8)",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },

  ratioRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    gap: 10,
  },
  ratioButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  ratioButtonActive: {
    backgroundColor: "rgba(124,58,237,0.40)",
    borderColor: "rgba(180,140,255,0.55)",
  },
  ratioText: {
    color: "rgba(255,255,255,0.78)",
    fontWeight: "900",
  },
  ratioTextActive: {
    color: "#fff",
  },

  progressText: {
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "700",
  },
  errorText: {
    color: "#ffb3b3",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "700",
  },

  pickButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  createButton: {
    borderRadius: 18,
    overflow: "hidden",
  },
  createButtonInner: {
    width: "100%",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: "#fff",
    fontWeight: "900",
  },
});