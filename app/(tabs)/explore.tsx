import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "../constants/templates";
import { TEMPLATES } from "../constants/templates";
import { auth } from "../../firebase";
import { CALCIO_ARCHETYPES_CARDS } from "../services/calcioCards";
import { SCENES_3 } from "../services/calcioPrompts";
import { COUPLE_CARDS } from "../services/coupleCards";
import { buyPackage, checkPremium, getOffers } from "../services/revenuecat";
import { STYLE_CARDS } from "../services/styleCards";

/* ===== SEZIONI (UGUALI) ===== */
const SECTIONS = [
  { key: "dance", title: "💃 Dance AI" },
  { key: "fantasy", title: "🧙 Fantasy AI" },
  { key: "autoscatto", title: "📸 Autoscatto AI" },
  { key: "calcio", title: "⚽ Calcio AI" },
  { key: "winter", title: "❄️ Winter AI" },
] as const;

type OutputItem = {
  scene: string;
  status: "queued" | "done" | "error";
  prompt: string;
  imageUrl?: string;
  error?: string;
};

type ProjectItem = {
  id: string;
  title: string;
  mode: "calcio" | "style";
  createdAt: number;
  userPhotoUri: string;
  outputs: OutputItem[];
};

const SCENE_OPTIONS = [
  { label: "Campo", value: SCENES_3[0] },
  { label: "Tunnel", value: SCENES_3[1] },
  { label: "Panchina", value: SCENES_3[2] },
] as const;



export default function Explore() {
const [credits, setCredits] = useState(0);
const [isUnlimited, setIsUnlimited] = useState(false);
const [showPaywall, setShowPaywall] = useState(false);

const isPro = false;// cancella quando trovo chiave revenucat

const handleBuyCredits = async () => {
  try {
    const offering = await getOffers();

    if (!offering || offering.length === 0) {
      Alert.alert("Errore", "Offerte non disponibili");
      return;
    }

    const pkg = offering[0];

    const customerInfo = await buyPackage(pkg);

    if (customerInfo) {
      Alert.alert("Successo", "Acquisto completato 🔥");
    }

  } catch (e) {
    console.log(e);
    Alert.alert("Errore", "Qualcosa è andato storto");
  }
};

//const [isPro, setIsPro] = useState(false);
//useEffect(() => {
 // checkUser();
//}, []);

const checkUser = async () => {
  const premium = await checkPremium();
  //setIsPro(premium);
};

const [hasFreeTrial, setHasFreeTrial] = useState(false);

const COST = hasFreeTrial ? 60 : 0; 

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const router = useRouter();
  const API_URL = "https://gaming-world-output-crimes.trycloudflare.com";
  const PROJECTS_KEY = "projects";

  const [calcioModalOpen, setCalcioModalOpen] = React.useState(false);
  const [selectedCalcio, setSelectedCalcio] = React.useState<null | {
    title: string;
    archetypeKey: any;
    presetKey: any;
  }>(null);

  React.useEffect(() => {
  loadUserData();
}, []);
/*SALVA CREDITI+ TRIAL*/
const loadUserData = async () => {
  const savedCredits = await AsyncStorage.getItem("credits");
  const freeTrialUsed = await AsyncStorage.getItem("freeTrialUsed");

  if (savedCredits) setCredits(Number(savedCredits));
  if (freeTrialUsed === "true") setHasFreeTrial(true);
};

const updateCredits = async (value: number) => {
  setCredits(value);
  await AsyncStorage.setItem("credits", String(value));
};

  const [userPhotoUri, setUserPhotoUri] = React.useState<string | null>(null);
  const [userPhotoMimeType, setUserPhotoMimeType] = React.useState<string | null>(null);
  const [userPhotoFileName, setUserPhotoFileName] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progressText, setProgressText] = React.useState("");
  const [selectedScene, setSelectedScene] = React.useState<
    (typeof SCENES_3)[number]
  >(SCENES_3[0]);

  const [generatedImages, setGeneratedImages] = React.useState<string[]>([]);

   /* ===== usestate cpuple cards ===== */
   const [photo1, setPhoto1] = useState<string | null>(null);
   const [photo2, setPhoto2] = useState<string | null>(null);
   
   const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
   const [coupleModalOpen, setCoupleModalOpen] = useState(false);
  /* ===== STYLE MODAL ===== */
  const [styleModalOpen, setStyleModalOpen] = React.useState(false);
  const [selectedStyleCard, setSelectedStyleCard] = React.useState<null | {
    id: string;
    title: string;
    subtitle: string;
    templateKey: string;
    images: any[];
  }>(null);

  const [stylePhotoUri, setStylePhotoUri] = React.useState<string | null>(null);
  const [stylePhotoMimeType, setStylePhotoMimeType] = React.useState<string | null>(null);
  const [stylePhotoFileName, setStylePhotoFileName] = React.useState<string | null>(null);

  const openCalcioModal = (c: any) => {
    setSelectedCalcio({
      title: c.title,
      archetypeKey: c.archetypeKey,
      presetKey: c.presetKey,
    });
    setUserPhotoUri(null);
    setUserPhotoMimeType(null);
    setUserPhotoFileName(null);
    setProgressText("");
    setSelectedScene(SCENES_3[0]);
    setCalcioModalOpen(true);
  };

  const openStyleModal = (card: any) => {
    setSelectedStyleCard({
      id: card.id,
      title: card.title,
      subtitle: card.subtitle,
      templateKey: card.templateKey,
      images: card.images,
    });
    setStylePhotoUri(null);
    setStylePhotoMimeType(null);
    setStylePhotoFileName(null);
    setProgressText("");
    setStyleModalOpen(true);
  };

  const pickUserPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permesso richiesto",
        "Consenti accesso alle foto per continuare."
      );
      return;
    }

  const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [3, 4],
  quality: 0.4, 
});

if (!result.canceled) { // <-- Usa 'result', non 'res'
  const asset = result.assets[0]; // <-- Usa 'result', non 'res'

  setUserPhotoUri(asset.uri);
  setUserPhotoMimeType(asset.mimeType ?? "image/jpeg");
  setUserPhotoFileName(asset.fileName ?? `calcio-${Date.now()}.jpg`);
}
  };
  
  /*-------------- FUNZIONI COUPLE + STYLE ----------*/

const pickPhoto1 = async () => {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.5,
  });

  if (!res.canceled) {
    setPhoto1(res.assets[0].uri);
  }
};

const pickPhoto2 = async () => {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.5,
  });

  if (!res.canceled) {
    setPhoto2(res.assets[0].uri);
  }
};

const pickStylePhoto = async () => {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!perm.granted) {
    Alert.alert(
      "Permesso richiesto",
      "Consenti accesso alle foto per continuare."
    );
    return;
  }

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.4,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (!res.canceled) {
    const asset = res.assets[0];

    setStylePhotoUri(asset.uri);
    setStylePhotoMimeType(asset.mimeType ?? "image/jpeg");
    setStylePhotoFileName(asset.fileName ?? `style-${Date.now()}.jpg`);
  }
};

/*-------------------- funione per collegare fronted e backend a render ---------------------*/
async function generatePhotos(imageUri, templateKey) {
  try {
    setLoading(true);

    const formData = new FormData();

  formData.append("image", {
  uri: imageUri,
  type: "image/jpeg",
  name: "photo.jpg",
} as any);

    formData.append("templateKey", templateKey);

    const res = await fetch(
      "https://jenesis-backend-1.onrender.com/style-cards/start",
      {
        method: "POST",
        body: formData,
      }
    );
    if (!res.ok) {
  throw new Error(`HTTP ${res.status}`);
}

    const data = await res.json();

    checkStatus(data.jobId);

  } catch (e) {
    console.log("ERRORE:", e);
    setLoading(false);
  }
}
/*-------------- status per render ----------*/
async function checkStatus(jobId: string, attempts = 0) {
  try {

    // 🔴 LIMITE ANTI-LOOP
    if (attempts > 20) {
      setLoading(false);
      Alert.alert("Errore", "Tempo scaduto, riprova");
      return;
    }

    const res = await fetch(
      `https://jenesis-backend-1.onrender.com/style-cards/status/${jobId}`
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    // 🔴 FIX JOB NON TROVATO
    if (data?.error) {
      throw new Error(data.error);
    }

    if (data.status === "complete") {
      setImages(data.images);
      setLoading(false);

    } else if (data.status === "processing") {

      setTimeout(() => {
        checkStatus(jobId, attempts + 1);
      }, 2000);

    } else {
      throw new Error("Stato sconosciuto");
    }

  } catch (e: any) {
    console.log("ERRORE STATUS:", e);
    setLoading(false);
    Alert.alert("Errore", e?.message || "Errore generazione");
  }
}

/*-------------- STORAGE ----------*/

async function saveProjectToStorage(project: Omit<ProjectItem, "id">) {
  const raw = await AsyncStorage.getItem(PROJECTS_KEY);
  const arr: ProjectItem[] = raw ? JSON.parse(raw) : [];

  const item: ProjectItem = {
    id: String(Date.now()),
    ...project,
  };

  arr.unshift(item);
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(arr));
  return item.id;
}

/*-------------- FILE UTILS ----------*/

async function dataUriToFileUri(dataOrUrl: string, filename: string) {
  const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

  if (!baseDir) {
    throw new Error("FileSystem: nessuna directory disponibile");
  }

  const fileUri = `${baseDir}${filename}`;

  if (dataOrUrl.startsWith("file://")) {
    return dataOrUrl;
  }

  if (
    dataOrUrl.startsWith("http://") ||
    dataOrUrl.startsWith("https://")
  ) {
    const download = await FileSystem.downloadAsync(dataOrUrl, fileUri);
    return download.uri;
  }

  const base64 = dataOrUrl.includes(",")
    ? dataOrUrl.split(",")[1]
    : dataOrUrl;

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
}
/*----------------------FUNCTION CALCIO----------*/
  async function generateCalcioPhoto() {
    console.log("AUTH USER:", auth.currentUser?.uid, auth.currentUser?.email);

    if (!selectedCalcio) return;

    if (!userPhotoUri) {
      Alert.alert("Manca la foto", "Carica una foto per continuare.");
      return;
    }

    setIsGenerating(true);
    setProgressText("");

    try {
      const sceneValue =
        selectedScene === SCENES_3[0]
          ? "campo"
          : selectedScene === SCENES_3[1]
          ? "tunnel"
          : "panchina";

      setProgressText("Sto preparando il prompt calcio...");

      console.log("CALCIO URL:", `${API_URL}/style-cards/start`);

      const uploadResult = await FileSystem.uploadAsync(
        `${API_URL}/calcio/generate`,
        userPhotoUri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "image",
          mimeType: userPhotoMimeType || "image/jpeg",
          parameters: {
            archetypeKey: String(selectedCalcio.archetypeKey),
            scene: String(sceneValue),
          },
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log("CALCIO API STATUS:", uploadResult.status);
      console.log("CALCIO API TEXT:", uploadResult.body);

      let data: any = {};
      try {
        data = JSON.parse(uploadResult.body);
      } catch {}

      console.log("CALCIO API JSON PARSED:", data);

      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        setIsGenerating(false);
        Alert.alert("Errore", data?.error || `HTTP ${uploadResult.status}`);
        return;
      }

      if (!data?.imageUrl) {
        setIsGenerating(false);
        Alert.alert("Errore", "Backend OK ma imageUrl mancante");
        return;
      }

      const fileUri = await dataUriToFileUri(
        data.imageUrl,
        `calcio-${Date.now()}.jpg`
      );

      const sceneLabel =
        selectedScene === SCENES_3[0]
          ? "campo"
          : selectedScene === SCENES_3[1]
          ? "tunnel"
          : "panchina";

      const createdOutputs: OutputItem[] = [
        {
          scene: sceneLabel,
          status: "done",
          prompt: `${selectedCalcio.title} - ${sceneLabel}`,
          imageUrl: fileUri,
        },
      ];

      setProgressText("La tua creazione si sta salvando in Projects…");

      await saveProjectToStorage({
        title: selectedCalcio.title,
        mode: "calcio",
        createdAt: Date.now(),
        userPhotoUri,
        outputs: createdOutputs,
      });

      setProgressText("Salvata in Projects!");
      setIsGenerating(false);

      setTimeout(() => {
        setCalcioModalOpen(false);
        setUserPhotoUri(null);
        setUserPhotoMimeType(null);
        setUserPhotoFileName(null);
        setProgressText("");
        setSelectedScene(SCENES_3[0]);
        router.replace("/projects");
      }, 900);
    } catch (e: any) {
      setIsGenerating(false);
      Alert.alert("Errore", e?.message ?? "Qualcosa è andato storto");
    }
  }

 /*----------------------FUNCTION COUPLE CARDS----------*/
async function generateCouplePhoto() {
  if (!photo1 || !photo2) {
    Alert.alert("Errore", "Carica entrambe le foto");
    return;
  }

  if (!selectedTemplate) {
    Alert.alert("Errore", "Seleziona un template");
    return;
  }

  setIsGenerating(true);
  setProgressText("Creazione in corso...");

  try {
    const formData = new FormData();

    formData.append("image1", {
      uri: photo1,
      name: "img1.jpg",
      type: "image/jpeg",
    } as any);

    formData.append("image2", {
      uri: photo2,
      name: "img2.jpg",
      type: "image/jpeg",
    } as any);

    formData.append("templateKey", selectedTemplate);

   const res = await fetch(`${API_URL}/style-cards/start`,{
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

   const data = await res.json();

if (!data?.jobId) {
  throw new Error("Job ID mancante");
}

const jobId = data.jobId;
console.log("✅ JOB ID:", jobId);

    const fileUri = await dataUriToFileUri(
      data.imageUrl,
      `couple-${Date.now()}.jpg`
    );

    const outputs: OutputItem[] = [
      {
        scene: selectedTemplate,
        status: "done",
        prompt: `Couple ${selectedTemplate}`,
        imageUrl: fileUri,
      },
    ];

    setProgressText("Salvando in Projects...");

    await saveProjectToStorage({
      title: "Couple Photo",
      mode: "style",
      createdAt: Date.now(),
      userPhotoUri: photo1,
      outputs,
    });

    setProgressText("Salvata in Projects!");

    setTimeout(() => {
      setPhoto1(null);
      setPhoto2(null);
      setCoupleModalOpen(false);
      router.replace("/projects");
    }, 900);

  } catch (e: any) {
    console.log("COUPLE ERROR:", e);
    Alert.alert("Errore", e?.message || "Errore generazione");
  } finally {
    setIsGenerating(false);
  }
}

/*-------------- TEST DI CONNETTIVITA' ----------*/
const testConnection = async () => {
  try {
    console.log("🚀 Provando a connettersi a:", API_URL);
    const res = await fetch(`${API_URL}/`, {
    
    }); 
    const text = await res.text();
    console.log("✅ Risposta server:", text);
    Alert.alert("Connessione OK", "Il server risponde correttamente!");
  } catch (err: any) {
    console.error("❌ Errore connessione:", err);
    Alert.alert("Errore Connessione", `Non raggiungo il server a ${API_URL}. Controlla ngrok o la tua Wi-Fi.`);
  }
};

/* ===== FIX GENERATE STYLE CARDS  AI PHOTO ===== */
async function generateStylePhotos() {
  
  if (!selectedStyleCard || !stylePhotoUri) {
    Alert.alert("Manca la foto", "Carica una foto per continuare.");
    return;
  }

// 💳 CREDITI / TRIAL / UNLIMITED
if (!isUnlimited) {

  // 🎁 FREE TRIAL (1 volta)
  if (!hasFreeTrial) {
    console.log("🎁 USA FREE TRIAL");
    await AsyncStorage.setItem("freeTrialUsed", "true");
    setHasFreeTrial(true);
  } else {

    // 💎 CREDITI
    //if (credits < 60) {
     // console.log("❌ NO CREDITI");
      //setShowPaywall(true);
     // Alert.alert("Crediti insufficienti");
     // return;
    //}

    console.log("💎 SCALO CREDITI");
    await updateCredits(credits - 60);
  }

} else {
  console.log("🚀 UNLIMITED USER");
}

  // 🚀 START GENERAZIONE
  setIsGenerating(true);
  setProgressText("Inviando foto al server...");

  try {
    // 🔥 UPLOAD
    const formData = new FormData();

    formData.append("image", {
      uri: stylePhotoUri,
      type: "image/jpeg",
      name: "photo.jpg",
    } as any);

    formData.append("templateKey", selectedStyleCard.templateKey);

    const res = await fetch(
      "https://jenesis-backend-1.onrender.com/style-cards/start",
      {
        method: "POST",
        body: formData,
      }
    );
    if (!res.ok) {
  throw new Error(`HTTP ${res.status}`);
}

    const data = await res.json();

// 🔴 CONTROLLO JOB ID (QUI!)
if (!data?.jobId) {
  throw new Error("Job ID mancante");
}

const jobId = data.jobId;
console.log("JOB ID:", jobId);

    if (!jobId) {
      throw new Error("Job ID mancante");

    }

    // 🔁 POLLING
    let finalImages: string[] = [];

    let attempts = 0;

const getIAStatusMessage = (attempts: number) => {
  if (attempts <= 2) return "📡 Inviando i dati...";
  if (attempts <= 5) return "⚙️ Caricamento modelli IA...";
  if (attempts <= 8) return "🧠 Analisi volto...";
  if (attempts <= 12) return "🎨 Applicazione stile...";
  if (attempts <= 15) return "✨ Rifinitura...";
  return "🚀 Quasi pronto...";
};

    while (true) {
      attempts++;
      if (attempts > 20) {
      throw new Error("Timeout generazione");
}
      const delay = attempts < 5 ? 800 : 1500;
      await new Promise((r) => setTimeout(r, delay));

      setProgressText(getIAStatusMessage(attempts));

      const statusRes = await fetch(
        `https://jenesis-backend-1.onrender.com/style-cards/status/${jobId}`
      );

      const statusData = await statusRes.json();

      console.log("STATUS:", statusData);

      if (statusData.error) {
      throw new Error(statusData.error);
}

      if (statusData.status === "complete") {
        finalImages = statusData.images || [];
        break;
      }
    }

    if (finalImages.length === 0) {
      throw new Error("Nessuna immagine ricevuta");
    }

    // 🔥 MOSTRA SUBITO IN UI
    setImages(finalImages);

    // 💾 SALVA
    await saveProjectToStorage({
      title: selectedStyleCard.title,
      mode: "style",
      createdAt: Date.now(),
      userPhotoUri: stylePhotoUri,
      outputs: finalImages.map((img, i) => ({
        scene: `${selectedStyleCard.templateKey}-${i}`,
        status: "done",
        prompt: selectedStyleCard.title,
        imageUrl: img,
      })),
    });

    setProgressText("Completato!");

    setTimeout(() => {
      setStyleModalOpen(false);
      router.replace("/projects");
    }, 1000);

  } catch (e: any) {
    console.error("ERRORE:", e);
    Alert.alert("Errore", e?.message || "Errore generazione");
  } finally {
    setIsGenerating(false);
  }
}

  const renderStyleBundle = (card: (typeof STYLE_CARDS)[number]) => {
    return (
      <View key={card.id} style={styles.bundleCard}>
        <View style={styles.bundleHeader}>
          <View>
            <Text style={styles.bundleTitle}>{card.title}</Text>
            <Text style={styles.bundleSubtitle}>{card.subtitle}</Text>
          </View>

          <View style={styles.bundleBadge}>
            <Text style={styles.bundleBadgeText}>4 FOTO</Text>
          </View>
        </View>

        <View style={styles.bundleGrid}>
  {card.images.slice(0, 4).map((img, index) => (
    <Image
      key={card.id + "-" + index}
      source={img}
      style={styles.bundleGridImage}
      resizeMode="cover"
    />
  ))}
</View>
        <TouchableOpacity
  activeOpacity={0.9}
  style={styles.bundleCTA}
  onPress={() => openStyleModal(card)}
>
  <LinearGradient
    colors={["#7c3aed", "#a78bfa"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.bundleCTAInner}
  >
    <Text style={styles.bundleCTAText}>
      ✨ Crea foto • 60 Credits
    </Text>
  </LinearGradient>
</TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#06081C", "#13104A", "#0A0B23"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>✨ Trend & Fun</Text>
          <Text style={styles.heroSubtitle}>
            Esplora le migliori AI: crea foto, video infiniti…
          </Text>

          <View style={styles.heroGlowLineWrap}>
            <LinearGradient
              colors={[
                "rgba(255,255,255,0)",
                "rgba(255,220,160,0.85)",
                "rgba(255,255,255,0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroGlowLine}
            />
          </View>
        </View>

        {/* ===== CALCIO ===== */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>
            ⚽ Foto con Calciatore{" "}
            <Text style={styles.sectionTitleMeta}>(archetypes)</Text>
          </Text>

          <View style={styles.premiumBox}>
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.18)",
                "rgba(255,255,255,0.08)",
                "rgba(255,255,255,0.14)",
              ]}
              style={styles.premiumBorder}
            >
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.10)",
                  "rgba(255,255,255,0.05)",
                  "rgba(0,0,0,0.18)",
                ]}
                style={styles.premiumInner}
              >
                <View style={styles.innerHeader}>
                  <Text style={styles.innerHeaderTitle}>🌙 Trend & Fun</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.row}
                >
                  {CALCIO_ARCHETYPES_CARDS.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      activeOpacity={0.9}
                      style={styles.card}
                      onPress={() => {}}
                    >
                      <ImageBackground
                        source={c.image}
                        style={StyleSheet.absoluteFill}
                        imageStyle={{ borderRadius: 18 }}
                      />

                      <LinearGradient
                        colors={[
                          "rgba(0,0,0,0.05)",
                          "rgba(0,0,0,0.25)",
                          "rgba(0,0,0,0.78)",
                        ]}
                        style={styles.cardShade}
                      />
                     
                     <View style={{
  position: "absolute",
  top: 10,
  left: 10,
}}>
  <Text style={{
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  }}>
    Coming Soon 🚀
  </Text>
</View>
                      <View
                        style={{
                          position: "absolute",
                          left: 12,
                          right: 12,
                          bottom: 54,
                        }}
                      >
                        <Text
                          style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}
                        >
                          {c.title}
                        </Text>
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.75)",
                            marginTop: 4,
                            fontSize: 12,
                          }}
                        >
                          {c.subtitle}
                        </Text>
                      </View>

                      <View style={styles.pill}>
                        <Text style={styles.pillText}>Crea la tua foto</Text>
                      </View>

                      <View style={styles.cardInnerStroke} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.dotsWrap}>
                  <View style={[styles.dot, styles.dotOn]} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </LinearGradient>
            </LinearGradient>
          </View>

          <Modal visible={calcioModalOpen} animationType="slide" transparent>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.6)",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  padding: 16,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["#0F0C29", "#1B1445", "#0A0B23"]}
                  style={{ ...StyleSheet.absoluteFillObject }}
                />

                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: -120,
                    left: -120,
                    right: -120,
                    height: 220,
                    borderRadius: 999,
                    backgroundColor: "rgba(168,85,247,0.18)",
                    transform: [{ rotate: "10deg" }],
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}
                  >
                    {selectedCalcio?.title ?? "Foto con Calciatore"}
                  </Text>

                  <Pressable onPress={() => setCalcioModalOpen(false)}>
                    <Text style={{ color: "#c7c7ff", fontSize: 18 }}>✕</Text>
                  </Pressable>
                </View>

                <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
                  Carica una foto, scegli la scena e crea la tua immagine.
                </Text>

                <Pressable
                  onPress={pickUserPhoto}
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.10)",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "800" }}>
                    {userPhotoUri ? "Cambia foto" : "Carica la tua foto"}
                  </Text>
                </Pressable>

                {userPhotoUri && (
                  <View
                    style={{
                      marginTop: 12,
                      borderRadius: 22,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.16)",
                    }}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255,255,255,0.10)",
                        "rgba(255,255,255,0.04)",
                        "rgba(0,0,0,0.18)",
                      ]}
                      style={{ padding: 6 }}
                    >
                      <View
                        pointerEvents="none"
                        style={{ borderRadius: 18, overflow: "hidden" }}
                      >
                        <Image
                          source={{ uri: userPhotoUri }}
                          style={{ width: "100%", height: 220 }}
                          resizeMode="cover"
                        />
                      </View>
                    </LinearGradient>
                  </View>
                )}

                <View style={styles.sceneWrap}>
                  {SCENE_OPTIONS.map((option) => {
                    const isSelected = selectedScene === option.value;
                    return (
                      <Pressable
                        key={option.label}
                        onPress={() => setSelectedScene(option.value)}
                        style={[
                          styles.sceneChip,
                          isSelected && styles.sceneChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.sceneChipText,
                            isSelected && styles.sceneChipTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  disabled={!userPhotoUri || isGenerating}
                  onPress={generateCalcioPhoto}
                  style={{
                    marginTop: 14,
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor:
                      !userPhotoUri || isGenerating
                        ? "rgba(124,58,237,0.35)"
                        : "#7c3aed",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }}>
                    {isGenerating ? "Creazione…" : "Crea foto"}
                  </Text>
                </Pressable>

                {(isGenerating || !!progressText) && (
                  <View
                    style={{
                      marginTop: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {isGenerating ? <ActivityIndicator /> : null}
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        marginLeft: isGenerating ? 10 : 0,
                      }}
                    >
                      {progressText}
                    </Text>
                  </View>
                )}

                <View style={{ height: 18 }} />
              </View>
            </View>
          </Modal>

          {/* ===== MODAL STYLE ===== */}
          <Modal visible={styleModalOpen} animationType="slide" transparent>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.6)",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  padding: 16,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["#0F0C29", "#1B1445", "#0A0B23"]}
                  style={{ ...StyleSheet.absoluteFillObject }}
                />

                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: -120,
                    left: -120,
                    right: -120,
                    height: 220,
                    borderRadius: 999,
                    backgroundColor: "rgba(168,85,247,0.18)",
                    transform: [{ rotate: "10deg" }],
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}
                  >
                    {selectedStyleCard?.title ?? "AI Photos"}
                  </Text>

                  <Pressable onPress={() => setStyleModalOpen(false)}>
                    <Text style={{ color: "#c7c7ff", fontSize: 18 }}>✕</Text>
                  </Pressable>
                </View>

                <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
                  Carica una foto e trasformala nello stile scelto.
                </Text>

                {selectedStyleCard?.images?.length ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingTop: 12 }}
                  >
                    {selectedStyleCard.images.slice(0, 4).map((img, index) => (
                      <Image
                        key={`${selectedStyleCard.id}-${index}`}
                        source={img}
                        style={{
                          width: 86,
                          height: 110,
                          borderRadius: 14,
                          backgroundColor: "#111",
                        }}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                ) : null}

                <Pressable
                  onPress={pickStylePhoto}
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.10)",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "800" }}>
                    {stylePhotoUri ? "Cambia foto" : "Carica la tua foto"}
                  </Text>
                </Pressable>

                {stylePhotoUri && (
                  <View
                    style={{
                      marginTop: 12,
                      borderRadius: 22,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.16)",
                    }}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255,255,255,0.10)",
                        "rgba(255,255,255,0.04)",
                        "rgba(0,0,0,0.18)",
                      ]}
                      style={{ padding: 6 }}
                    >
                      <View
                        pointerEvents="none"
                        style={{ borderRadius: 18, overflow: "hidden" }}
                      >
                        <Image
                          source={{ uri: stylePhotoUri }}
                          style={{ width: "100%", height: 320, backgroundColor: "#0b0b18" }}
                          resizeMode="contain"
                        />
                      </View>
                    </LinearGradient>
                  </View>
                )}

                <Pressable
                  disabled={!stylePhotoUri || isGenerating}
                  onPress={generateStylePhotos}
                  style={{
                    marginTop: 14,
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor:
                      !stylePhotoUri || isGenerating
                        ? "rgba(124,58,237,0.35)"
                        : "#7c3aed",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }}>
                    {isGenerating ? "Creazione…" : "Crea foto"}
                  </Text>
                </Pressable>
                {images.length > 0 && (
  <ScrollView horizontal style={{ marginTop: 10 }}>
    {images.map((img, i) => (
      <Image
        key={i}
        source={{ uri: img }}
        style={{ width: 120, height: 120, marginRight: 10 }}
      />
    ))}
  </ScrollView>
)}

                {(isGenerating || !!progressText) && (
                  <View
                    style={{
                      marginTop: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {isGenerating ? <ActivityIndicator /> : null}
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        marginLeft: isGenerating ? 10 : 0,
                      }}
                    >
                      {progressText}
                    </Text>
                  </View>
                )}

                <View style={{ height: 18 }} />
              </View>
            </View>
          </Modal>
        </View>

{/* ===== modal ui couple cards ===== */}
<Modal visible={coupleModalOpen} animationType="slide" transparent>
  <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
    <View style={{ padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: "#0A0B23" }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>
          💑 Couple AI
        </Text>

        <Pressable onPress={() => setCoupleModalOpen(false)}>
          <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
        </Pressable>
      </View>

      {/* SUBTITLE */}
      <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 8 }}>
        Aggiungi foto per creare
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
  
  {/* FOTO 1 */}
  <View style={{ flex: 1 }}>
    {photo1 ? (
      <Image
        source={{ uri: photo1 }}
        style={{
          width: "100%",
          height: 180,
          borderRadius: 14,
        }}
      />
    ) : (
      <Pressable
        onPress={pickPhoto1}
        style={{
          height: 180,
          borderRadius: 14,
          backgroundColor: "rgba(255,255,255,0.08)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>
          Foto 1
        </Text>
      </Pressable>
    )}
  </View>

  {/* FOTO 2 */}
  <View style={{ flex: 1 }}>
    {photo2 ? (
      <Image
        source={{ uri: photo2 }}
        style={{
          width: "100%",
          height: 180,
          borderRadius: 14,
        }}
      />
    ) : (
      <Pressable
        onPress={pickPhoto2}
        style={{
          height: 180,
          borderRadius: 14,
          backgroundColor: "rgba(255,255,255,0.08)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>
          Foto 2
        </Text>
      </Pressable>
    )}
  </View>

</View>
      {/* CREA */}
      <Pressable
  disabled={!photo1 || !photo2 || !selectedTemplate || isGenerating}
  onPress={generateCouplePhoto}
  style={{
    marginTop: 20,
    borderRadius: 18,
    overflow: "hidden",
    opacity:
      !photo1 || !photo2 || !selectedTemplate || isGenerating ? 0.6 : 1,
  }}
>
  <LinearGradient
    colors={["#FF5F6D", "#FFC371"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: 18,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* TESTO */}
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
        {isGenerating ? "Creazione…" : "Crea foto"}
      </Text>

      {/* CREDITI */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.25)",
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
        }}
      >
        <Text style={{ fontSize: 14, marginRight: 4 }}>💎</Text>
        <Text style={{ color: "#fff", fontWeight: "900" }}>
          200
        </Text>
      </View>
    </View>
  </LinearGradient>
</Pressable>

      {isGenerating && (
        <View style={{ marginTop: 10, alignItems: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: "#fff", marginTop: 6 }}>
            {progressText}
          </Text>
        </View>
      )}

    </View>
  </View>
</Modal>

{/* ===== COUPLE AI ===== */}
<View style={styles.sectionWrap}>
  <Text style={styles.sectionTitle}>💑 Couple AI</Text>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row}
  >
   {COUPLE_CARDS.map((card) => (
  <TouchableOpacity
    key={card.id}
    activeOpacity={1}
    style={styles.card}
    onPress={() => {}}
  >
        <ImageBackground
          source={card.image}
          style={StyleSheet.absoluteFill}
          imageStyle={{ borderRadius: 18 }}
        />
    <View style={{
  position: "absolute",
  top: 10,
  left: 10,
}}>
  <Text style={{
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  }}>
     Coming Soon 🚀
  </Text>
</View>
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.05)",
            "rgba(0,0,0,0.25)",
            "rgba(0,0,0,0.78)",
          ]}
          style={styles.cardShade}
        />

        <View
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 54,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>
            {card.title}
          </Text>

          <Text
            style={{
              color: "rgba(255,255,255,0.75)",
              marginTop: 4,
              fontSize: 12,
            }}
          >
            Template AI
          </Text>
        </View>

        <View style={styles.pill}>
          <Text style={styles.pillText}>Crea foto</Text>
        </View>

        <View style={styles.cardInnerStroke} />
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>

        {/* ===== AI PHOTOS ===== */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>✨ AI Photos</Text>
          {STYLE_CARDS.map((card) => renderStyleBundle(card))}
        </View>
        

        {/* ===== ALTRE SEZIONI ORIGINALI ===== */}
        {SECTIONS.map((section) => {
          const items = TEMPLATES.filter((t) => t.category === section.key);
          if (items.length === 0) return null;


          return (
            <View key={section.key} style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={styles.premiumBox}>
                <LinearGradient
                  colors={[
                    "rgba(255,255,255,0.18)",
                    "rgba(255,255,255,0.08)",
                    "rgba(255,255,255,0.14)",
                  ]}
                  style={styles.premiumBorder}
                >
                  <LinearGradient
                    colors={[
                      "rgba(255,255,255,0.10)",
                      "rgba(255,255,255,0.05)",
                      "rgba(0,0,0,0.18)",
                    ]}
                    style={styles.premiumInner}
                  >
                    <View style={styles.innerHeader}>
                      <Text style={styles.innerHeaderTitle}>🌙 Trend & Fun</Text>
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.row}
                    >
                      {items.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.9}
                          style={styles.card}
                          onPress={() =>
                            router.push({
                              pathname: "/template/[id]",
                              params: { id: item.id },
                            })
                          }
                        >
                          <Video
                            //source={item.video}
                            style={StyleSheet.absoluteFill}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay
                            isLooping
                            isMuted
                          />

                          <LinearGradient
                            colors={[
                              "rgba(0,0,0,0.05)",
                              "rgba(0,0,0,0.20)",
                              "rgba(0,0,0,0.70)",
                            ]}
                            style={styles.cardShade}
                          />

                          <View style={styles.pill}>
                            <Text style={styles.pillText}>Crea il tuo video</Text>
                          </View>

                          <View style={styles.cardInnerStroke} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <View style={styles.dotsWrap}>
                      <View style={[styles.dot, styles.dotOn]} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />

                    </View>
                  </LinearGradient>
                </LinearGradient>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, paddingTop: 54 },

  hero: { paddingHorizontal: 16, marginBottom: 10 },
  heroTitle: {
    color: "#F3E9D8",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.72)",
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  heroGlowLineWrap: { marginTop: 14 },
  heroGlowLine: { height: 2, borderRadius: 999, opacity: 0.95 },

  sectionWrap: { marginTop: 14, marginBottom: 10 },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginLeft: 16,
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  sectionTitleMeta: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
    textTransform: "lowercase",
  },

  premiumBox: {
    marginHorizontal: 12,
    borderRadius: 22,
    shadowColor: "rgba(255,220,160,1)",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  premiumBorder: { borderRadius: 22, padding: 1 },
  premiumInner: {
    borderRadius: 21,
    paddingTop: 10,
    paddingBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  innerHeader: { paddingHorizontal: 14, paddingBottom: 8 },
  innerHeaderTitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "900",
  },

  row: { paddingHorizontal: 10, paddingBottom: 6 },

  card: {
    width: 160,
    height: 190,
    marginRight: 12,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  cardShade: { ...StyleSheet.absoluteFillObject },
  cardInnerStroke: {
    position: "absolute",
    inset: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  pill: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  pillText: { color: "#fff", fontSize: 13, fontWeight: "800" },

  sceneWrap: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  sceneChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  sceneChipActive: {
    backgroundColor: "rgba(124,58,237,0.35)",
    borderColor: "rgba(167,139,250,0.85)",
  },
  sceneChipText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "800",
  },
  sceneChipTextActive: {
    color: "#fff",
  },

  dotsWrap: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  dotOn: { backgroundColor: "rgba(255,255,255,0.85)" },

  /* ===== AI PHOTOS ===== */
  bundleCard: {
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    shadowColor: "rgba(255,220,160,1)",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  bundleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bundleTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  bundleSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    marginTop: 3,
  },
  bundleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  bundleBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },
  bundleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
bundleGridImage: {
  width: "48%",
  aspectRatio: 0.80,
  borderRadius: 12,
  marginBottom: 8,
}, 
  bundleCTA: {
    marginTop: 4,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(124,58,237,0.28)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.55)",
  },
  bundleCTAText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
  },
  //per i bottoni
  bundleCTAInner: {
  paddingVertical: 12,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
},
  
});
