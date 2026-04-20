import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View
} from "react-native";
import { CREDIT_COSTS } from "../constants/credits";
import { useCredits } from "../contexts/CreditsContext";
import { checkPremium } from "../services/revenuecat";
import { addProjectToProjects } from "./projects";

const API_URL = "https://jenesis-backend-1.onrender.com";


type HedraVoice = {
  id: string;
  name: string;
  description?: string;
  preview_url?: string | null;
};

type ElevenVoice = {
  id: string;
  name: string;
  preview_url?: string | null;
};

export default function CreateScreen() {
  const { credits, setCredits } = useCredits();
  const [showPaywall, setShowPaywall] = useState(false);

  const isPro = true;// DA CANCELLARE DOPO CHE INSERISCO LA CHIAVE REVENUCAT

  const [modalType, setModalType] = useState<
    null | "text" | "image" | "talking" | "avatar" | "effects"
  >(null);

  useFocusEffect(
  useCallback(() => {
    setScript("");
  }, [])
);
const resetTalkingPhoto = () => {
  setTalkingImage(null);
  setTalkingImageBase64(null);
  setTalkingScript("");
  setSelectedHedraVoice(null);
  setDuration(5);
};

//const [isPro, setIsPro] = useState(false);
//useEffect(() => {
 // checkUser();
//}, []);

const checkUser = async () => {
  const premium = await checkPremium();
  //setIsPro(premium);
};

  const PROJECTS_KEY = "projects";
  const router = useRouter();

  const user = { id: "test-user" };

  useEffect(() => {
    if (!user) {
      router.replace({ pathname: "/", params: { openLogin: "1" } });
    }
  }, [user, router]);
  
  const [isPremium, setIsPremium] = useState(false);//poi collego al pagamento
  useEffect(() => {
  AsyncStorage.setItem("isPremium", "true");
  setIsPremium(true);
}, []);
  useEffect(() => {
  const loadPremium = async () => {
  const value = await AsyncStorage.getItem("isPremium");
    setIsPremium(value === "true");
  };

  loadPremium();
}, []);

  const [savingToProjects, setSavingToProjects] = useState(false);
  const [savedToProjects, setSavedToProjects] = useState(false);
  const [loading, setLoading] = useState(false);

  const imageVideoScrollRef = useRef<ScrollView | null>(null);
  const talkingScrollRef = useRef<ScrollView | null>(null);

  const SAVED_VOICE_KEY = "saved_recorded_voice";

  const [recordedAudioMimeType, setRecordedAudioMimeType] = useState<string>("audio/mp4");
  const [hasSavedVoice, setHasSavedVoice] = useState(false);
  /* -------------------- FUNZIONE CREDITS -------------------- */
  const spendCredits = async (amount: number) => {
  if (credits < amount) {
    Alert.alert("Crediti insufficienti");
    return false;
  }

  const newCredits = credits - amount;
  await AsyncStorage.setItem("credits", String(newCredits));
  setCredits(newCredits);

  return true;
};
  /* -------------------- TEXT → AI IMAGE -------------------- */
  const [script, setScript] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<
    "photorealistic" | "cartoon" | null
  >(null);
  const [textLoading, setTextLoading] = useState(false);

  // 🔥 TEXT IMAGE SETTINGS
const [textQuality, setTextQuality] = useState<"hd" | "ultra">("hd");
const [textRatio, setTextRatio] = useState<"3:4" | "2:3" | "4:3" | "9:16" | "1:1" | "16:9">("3:4");
const [resolution, setResolution] = useState<"1k" | "2k">("1k");

function calculateTextCredits() {
  return textQuality === "hd"
    ? CREDIT_COSTS.image.hd
    : CREDIT_COSTS.image.ultra;
}

const textCredits = calculateTextCredits();

  async function saveTextImageToProjects(imageUrl: string, prompt: string) {
    const newProject = {
      id: `textimg_${Date.now()}`,
      templateId: "text-image",
      imageUrl,
      prompt,
      createdAt: new Date().toISOString(),
    };

    const stored = await AsyncStorage.getItem(PROJECTS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    const updated = [newProject, ...list];

    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
  }
  /* -------------------- per paywall -------------------- */
  async function checkAccess(feature: string) {
  const res = await fetch(`${API_URL}/paywall/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feature }),
  });

  return await res.json();
}
  /* -------------------- IMAGE → AI VIDEO -------------------- */
const [selectedImage, setSelectedImage] = useState<string | null>(null);
const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
const [actionPrompt, setActionPrompt] = useState("");
const [speechText, setSpeechText] = useState("");
const [videoLoading, setVideoLoading] = useState(false);
const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

// 🔥 QUALITY + RATIO + CREDITS
const [quality, setQuality] = useState<"hd" | "ultra">("hd");

const [addVoice, setAddVoice] = useState(false);

// riusiamo selectedHedraVoice, NON selectedVoiceId doppio
const [useRecordedAudio, setUseRecordedAudio] = useState(false);
const [isRecording, setIsRecording] = useState(false);
const [recording, setRecording] = useState<Audio.Recording | null>(null);
const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
const [recordedAudioBase64, setRecordedAudioBase64] = useState<string | null>(null);
const [recordedAudioSound, setRecordedAudioSound] = useState<Audio.Sound | null>(null);
const [isPlayingRecordedAudio, setIsPlayingRecordedAudio] = useState(false);

  async function saveImageVideoToProjects(
    videoUrl: string,
    ratio: string,
    imageUrl?: string
  ) {
    const newProject = {
      id: `imgvid_${Date.now()}`,
      templateId: "image-video",
      videoUrl,
      ratio,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    const stored = await AsyncStorage.getItem(PROJECTS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    const updated = [newProject, ...list];

    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
  }
  useFocusEffect(
  useCallback(() => {
    return () => {
      // 🔥 RESET QUANDO ESCI

      setSelectedImage(null); // 👈 CAMBIA NOME QUI
      // oppure setImage(null)
      // oppure setImageUri(null)
    };
  }, [])
);


  /* -------------------- TALKING PHOTO (HEDRA) -------------------- */
  const [talkingImage, setTalkingImage] = useState<string | null>(null);
  const [talkingImageBase64, setTalkingImageBase64] = useState<string | null>(null);
  const [talkingScript, setTalkingScript] = useState("");
  const [talkingLoading, setTalkingLoading] = useState(false);

  const [duration, setDuration] = useState(5);
  const maxChars = duration === 5 ? 80 : 200;
 
  const [hedraVoices, setHedraVoices] = useState<HedraVoice[]>([]);
  const [selectedHedraVoice, setSelectedHedraVoice] = useState<string | null>(null);
  const [hedraVoicesLoading, setHedraVoicesLoading] = useState(false);

  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
 const openPaywall = () => {
  router.push("/buyCredits");
};

  async function saveTalkingPhotoToProjects(videoUrl: string, imageUrl?: string) {
    const newProject = {
      id: `talking_${Date.now()}`,
      templateId: "talking-photo",
      videoUrl,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    const stored = await AsyncStorage.getItem(PROJECTS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    const updated = [newProject, ...list];

    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
  }
  const playVoicePreview = async (voice: HedraVoice) => {
  try {
    console.log("🎧 voice selected:", voice.name);
    console.log("🎧 preview url:", voice.preview_url);

    if (!voice.preview_url) {
      Alert.alert("Preview non disponibile", "Questa voce non ha anteprima audio");
      return;
    }

    if (playingVoiceId === voice.id && previewSound) {
      await previewSound.stopAsync();
      await previewSound.unloadAsync();
      setPreviewSound(null);
      setPlayingVoiceId(null);
      return;
    }

    if (previewSound) {
      await previewSound.stopAsync();
      await previewSound.unloadAsync();
      setPreviewSound(null);
      setPlayingVoiceId(null);
    }

    if (recordedAudioSound) {
      await recordedAudioSound.stopAsync();
      await recordedAudioSound.unloadAsync();
      setRecordedAudioSound(null);
      setIsPlayingRecordedAudio(false);
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: voice.preview_url },
      { shouldPlay: true, volume: 1.0 }
    );

    setPreviewSound(sound);
    setPlayingVoiceId(voice.id);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;

      if (status.didJustFinish) {
        sound.unloadAsync();
        setPreviewSound(null);
        setPlayingVoiceId(null);
      }
    });
  } catch (e: any) {
    console.log("❌ Voice preview error:", e);
    Alert.alert("Errore audio", e?.message || "Impossibile riprodurre l’anteprima");
  }
};

useEffect(() => {
  return () => {
    if (previewSound) {
      previewSound.unloadAsync();
    }
  };
}, [previewSound]);

useEffect(() => {
  const previewAllowed =
    modalType === "talking" ||
    (modalType === "image" && addVoice) ||
    modalType === "avatar";

  if (!previewAllowed && previewSound) {
    previewSound.unloadAsync();
    setPreviewSound(null);
    setPlayingVoiceId(null);
  }
}, [modalType, addVoice, previewSound]);

useEffect(() => {
  return () => {
    if (recordedAudioSound) {
      recordedAudioSound.unloadAsync();
    }
  };
}, [recordedAudioSound]);

const saveRecordedVoice = async (opts: {
  uri: string;
  base64: string;
  mimeType: string;
}) => {
  await AsyncStorage.setItem(
    SAVED_VOICE_KEY,
    JSON.stringify({
      uri: opts.uri,
      base64: opts.base64,
      mimeType: opts.mimeType,
      createdAt: new Date().toISOString(),
    })
  );

  setRecordedAudioUri(opts.uri);
  setRecordedAudioBase64(opts.base64);
  setRecordedAudioMimeType(opts.mimeType);
  setHasSavedVoice(true);
};

const loadRecordedVoice = async () => {
  try {
    const raw = await AsyncStorage.getItem(SAVED_VOICE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);

    setRecordedAudioUri(parsed.uri ?? null);
    setRecordedAudioBase64(parsed.base64 ?? null);
    setRecordedAudioMimeType(parsed.mimeType ?? "audio/mp4");
    setHasSavedVoice(!!parsed.base64);
  } catch (e) {
    console.log("loadRecordedVoice error:", e);
  }
};

const clearSavedRecordedVoice = async () => {
  try {
    await AsyncStorage.removeItem(SAVED_VOICE_KEY);
  } catch (e) {
    console.log("clearSavedRecordedVoice error:", e);
  }

  setRecordedAudioUri(null);
  setRecordedAudioBase64(null);
  setRecordedAudioMimeType("audio/mp4");
  setHasSavedVoice(false);
  setUseRecordedAudio(false);
};

useEffect(() => {
  loadRecordedVoice();
}, []);
  /* -------------------- GLOW -------------------- */
  const glowAnim = useRef(new Animated.Value(0)).current;

  const glowStyle = {
    shadowColor: "#A855F7",
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 0.9],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 20],
    }),
    elevation: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 15],
    }),
  };

  const glowShadow = glowStyle;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnim]);

  useEffect(() => {
  if (
    (modalType === "talking" || (modalType === "image" && addVoice)) &&
    hedraVoices.length === 0 &&
    !hedraVoicesLoading
  ) {
    loadHedraVoices();
  }
}, [modalType, addVoice]);

const [elevenVoices, setElevenVoices] = useState<ElevenVoice[]>([]);
const [elevenVoicesLoading, setElevenVoicesLoading] = useState(false);
useEffect(() => {
  if (
    modalType === "avatar" &&
    elevenVoices.length === 0 &&
    !elevenVoicesLoading
  ) {
    loadElevenVoices();
  }
}, [modalType, elevenVoices.length, elevenVoicesLoading]);

  /* -------------------- AI AVATAR STUDIO -------------------- */
const [avatarStyle, setAvatarStyle] = useState<"3d" | "2d">("3d");
const [avatarImage, setAvatarImage] = useState<string | null>(null);
const [avatarLoading, setAvatarLoading] = useState(false);
const [avatarImageBase64, setAvatarImageBase64] = useState<string | null>(null);

const [avatarInputType, setAvatarInputType] = useState<"preset" | "custom">("custom");
const [avatarPreset, setAvatarPreset] = useState<string | null>(null);

const [avatarPrompt, setAvatarPrompt] = useState("");
const [avatarVoiceMode, setAvatarVoiceMode] = useState<"preset" | "clone">("preset");

const avatarScrollRef = useRef<ScrollView | null>(null);


const [selectedElevenVoice, setSelectedElevenVoice] = useState<string | null>(null);

async function saveAvatarToProjects(
  videoUrl: string,
  avatarStyle: "2d" | "3d",
  name?: string
) {
  const newProject = {
    id: `avatar_${avatarStyle}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    templateId: avatarStyle === "3d" ? "avatar-3d" : "avatar-2d",
    name: name ?? null,
    videoUrl,
    createdAt: new Date().toISOString(),
  };

  const stored = await AsyncStorage.getItem(PROJECTS_KEY);
  const list = stored ? JSON.parse(stored) : [];
  const updated = [newProject, ...list];

  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
}

const AVATAR_PRESETS = [
  {
    id: "business_woman",
    label: "Business Woman",
    image: require("../../assets/avatars/business-woman.jpg"),
    prompt:
      "A real human woman, 30 years old, natural skin texture, professional appearance, wearing elegant business outfit, soft studio lighting, realistic facial details, subtle makeup, confident and calm expression, looking directly at the camera, slight natural movements, speaking like a successful CEO presenting a brand.",
  },
  {
    id: "startup_founder",
    label: "Startup Founder",
    image: require("../../assets/avatars/startup-founder.jpg"),
    prompt:
      "A real young man, 25 years old, natural face, slightly messy hair, casual hoodie, modern indoor lighting, realistic skin and imperfections, relaxed posture, friendly and smart expression, speaking like a startup founder explaining a new app in a natural and engaging way.",
  },
  {
    id: "influencer",
    label: "Influencer",
    image: require("../../assets/avatars/influencer.jpg"),
    prompt:
      "A real young woman, 22 years old, natural beauty, soft makeup, warm lighting, modern aesthetic background, realistic skin details, subtle facial expressions, confident and friendly vibe, looking at the camera like a social media influencer talking to her audience.",
  },
  {
    id: "podcast_host",
    label: "Podcast Host",
    image: require("../../assets/avatars/podcast-host.jpg"),
    prompt:
      "A real man, 35 years old, natural skin texture, casual but clean style, sitting in a podcast setup with soft lighting, realistic facial expressions, calm and engaging tone, speaking clearly like a professional podcast host explaining a topic.",
  },
  {
    id: "luxury_woman",
    label: "Luxury Woman",
    image: require("../../assets/avatars/luxury-woman.jpg"),
    prompt:
      "A real elegant woman, 30 years old, refined appearance, minimal makeup, cinematic soft lighting, high-end fashion style, realistic skin texture, calm and confident expression, speaking like a luxury brand ambassador in a premium commercial.",
  },
  {
    id: "everyday_person",
    label: "Everyday Person",
    image: require("../../assets/avatars/everyday-person.jpg"),
    prompt:
      "A real human person, natural appearance, no makeup look, casual clothes, indoor natural lighting, realistic skin imperfections, relaxed posture, authentic facial expressions, speaking naturally like a real person talking directly to the camera.",
  },
] as const;

const selectAvatarPreset = (presetId: string) => {
  const found = AVATAR_PRESETS.find((p) => p.id === presetId);
  if (!found) return;

  setAvatarPreset(presetId);
};

const getBase64FromAsset = async (assetSource: any) => {
  const asset = Asset.fromModule(assetSource);

  await asset.downloadAsync();

  const localUri = asset.localUri || asset.uri;

  if (!localUri) {
    throw new Error("Asset locale non trovato");
  }

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: "base64" as any,
  });

  return base64;
};
/* ------------GENERATE ANIMATE AVATAR ------------*/
const generateAndAnimateAvatar = async () => {
  //if (!isPro) {
  //setShowPaywall(true); // oppure navigation al paywall
 // return;
//}
  try {
    // 👇 METTILO QUI
    const access = await checkAccess("avatar");
    if (!access.ok) {
  setShowPaywall(true);
  return;
}

   const selectedPreset = AVATAR_PRESETS.find(
  (p) => p.id === avatarPreset
);
const form = new FormData();
form.append("voiceId", selectedElevenVoice);
form.append("isPremium", isPremium ? "true" : "false");
const isUsingPreset = avatarInputType === "preset" && !!selectedPreset;

if (!avatarImageBase64 && !isUsingPreset) {
  Alert.alert("Errore", "Carica prima una foto per l'avatar.");
  return;
}

    const spokenPart = avatarPrompt.trim();

    if (!spokenPart) {
      Alert.alert("Errore", "Scrivi cosa deve dire l'avatar.");
      return;
    }

    if (avatarVoiceMode === "preset" && !selectedElevenVoice) {
      Alert.alert("Errore", "Scegli una voce.");
      return;
    }

    const selectedAvatarVoiceExists = elevenVoices.some(
      (voice) => voice.id === selectedElevenVoice
    );

    if (avatarVoiceMode === "preset" && !selectedAvatarVoiceExists) {
      Alert.alert(
        "Errore",
        "La voce selezionata non è più valida. Ricarica le voci e scegline una nuova."
      );
      await loadElevenVoices();
      return;
    }

    if (avatarVoiceMode === "clone" && !recordedAudioBase64) {
      Alert.alert("Errore", "Registra prima la tua voce.");
      return;
    }

    setAvatarLoading(true);
    setSavingToProjects(true);
    setSavedToProjects(false);

   const visualPart =
  avatarInputType === "preset" ? selectedPreset?.prompt || "" : "";

let finalImageBase64 = avatarImageBase64;

if (isUsingPreset && selectedPreset) {
  finalImageBase64 = await getBase64FromAsset(selectedPreset.image);
}
form.append("imageBase64", finalImageBase64 || "");
form.append("avatarPrompt", spokenPart);
form.append("avatarStyle", avatarStyle);
form.append("avatarInputType", avatarInputType);
form.append("avatarVoiceMode", avatarVoiceMode);

if (avatarVoiceMode === "clone" && recordedAudioBase64) {
  form.append("audioBase64", recordedAudioBase64);
}

const res = await fetch("https://injurable-giavanna-purselike.ngrok-free.dev/avatar/start", {
  method: "POST",
  body: form,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

const data = await res.json();

if (!res.ok) {
  if (data.error === "PRO_REQUIRED") {
    Alert.alert("Passa a PRO", "Questa funzione è disponibile solo per utenti PRO");
    return;
  }

  throw new Error(data.error || "Errore generazione avatar");
}

console.log("✅ AVATAR CREATO:", data);


    
if (!data?.videoUrl) {
  throw new Error("Backend non ha restituito videoUrl");
}

if (!(await spendCredits(CREDIT_COSTS.avatar))) return;

    setGeneratedVideoUrl(data.videoUrl);
    await saveAvatarToProjects(data.videoUrl, avatarStyle, "Talking Avatar");

    setSavedToProjects(true);
    setTimeout(() => setSavedToProjects(false), 2500);
  } catch (err: any) {
    Alert.alert("Errore", err?.message || "Errore generazione avatar");
  } finally {
    setAvatarLoading(false);
    setSavingToProjects(false);
  }
};

/* -------------------- funzioni realistic effects -------------------- */
function getEffectPrompt(effect: string | null) {
  switch (effect) {
    case "movie":
      return "epic cinematic scene, dramatic lighting, action movie, fire, explosions, hero pose";

    case "cyberpunk":
      return "cyberpunk city, neon lights, futuristic outfit, night atmosphere";

    case "photorealistic":
      return "natural photo, soft lighting, realistic environment";

    case "cartoon":
      return "soft cartoon style, disney inspired, colorful";

    default:
      return "realistic scene";
  }
}
/* -------------------- funzioni AI effects  -------------------- */
const generateEffectsVideo = async () => {
  //if (!isPro) {
  //setShowPaywall(true); // oppure navigation al paywall
  //return;
//}
  const access = await checkAccess("effects");
if (!access.ok) {
  setShowPaywall(true);
  return;
}

const proCheck = await checkAccess(`effect:${selectedEffect}`);
if (!proCheck.ok) {
  setShowPaywall(true);
  return;
}

  if (!effectsImage) {
    Alert.alert("Error", "Upload your photo first");
    return;
  }

  if (!selectedEffect) {
    Alert.alert("Error", "Select an effect");
    return;
  }

  if (!effectsImageBase64) {
    Alert.alert("Error", "Image base64 missing");
    return;
  }

  try {
    setEffectsLoading(true);
    setSavingToProjects(true);
    setSavedToProjects(false);

    const res = await fetch(`${API_URL}/effects/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        imageBase64: effectsImageBase64,
        effect: selectedEffect,
        isPremium,
      }),
    });

    const data = await res.json();
    

    if (!res.ok) {
      throw new Error(data?.error || "Effects generation failed");
    }

    if (!data?.imageUrl) {
  throw new Error("No image returned");
}

if (!(await spendCredits(CREDIT_COSTS.effects))) return;

await addProjectToProjects({
  id: `effects_${Date.now()}`,
  templateId: `effects-${selectedEffect}`,
  imageUrl: data.imageUrl,
  createdAt: new Date().toISOString(),
});

    setSavedToProjects(true);
    setTimeout(() => setSavedToProjects(false), 2500);

  } catch (e: any) {
    Alert.alert("Error", e?.message || "Something went wrong");
  } finally {
    setEffectsLoading(false);
    setSavingToProjects(false);
  }
};

  /* -------------------- AI EFFECTS -------------------- */
  // STATE
const [effectsImage, setEffectsImage] = useState<string | null>(null);
const [effectsImageBase64, setEffectsImageBase64] = useState<string | null>(null);
const [selectedEffect, setSelectedEffect] = useState<EffectType>("photorealistic");
const [effectsLoading, setEffectsLoading] = useState(false);

const FREE_EFFECTS = ["photorealistic"];

// TYPE
type EffectType = "movie" | "cyberpunk" | "photorealistic" | "cartoon";

// FUNCTION
const handleSelectEffect = async (effect: EffectType) => {
  const res = await checkAccess(effect);
if (!res.ok) {
  setShowPaywall(true);
  return;
}
  setSelectedEffect(effect);
};
  
  /* -------------------- HEDRA VOICES -------------------- */
  const loadHedraVoices = async () => {
  try {
    setHedraVoicesLoading(true);

    console.log("🔄 Loading Hedra voices...");

    const res = await fetch(`${API_URL}/api/hedra/voices`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = await res.json().catch(() => null);

    console.log("🎤 Hedra voices response status:", res.status);
    console.log("🎤 Hedra voices response data:", data);

    if (!res.ok) {
      throw new Error(data?.error || "Errore caricamento voci Hedra");
    }

    const voices = (data?.voices ?? []).filter(
  (voice: any) => voice.id && voice.name && voice.preview_url
);
    setHedraVoices(voices);

    if (voices.length > 0) {
      setSelectedHedraVoice((prev) => prev ?? voices[0].id);
    }
  } catch (e: any) {
    console.log("Hedra voices load error:", e);
    Alert.alert("Errore voci", e?.message || "Non sono riuscito a caricare le voci");
    setHedraVoices([]);
  } finally {
    setHedraVoicesLoading(false);
  }
};

/* -------------------- ELEVENLABS VOICES -------------------- */
const loadElevenVoices = async () => {
  try {
    setElevenVoicesLoading(true);

    const res = await fetch(`${API_URL}/api/elevenlabs/voices`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error || "Errore caricamento voci ElevenLabs");
    }

    const voices = data?.voices ?? [];
    setElevenVoices(voices);

    if (voices.length > 0) {
      setSelectedElevenVoice((prev) => prev ?? voices[0].id);
    }
  } catch (e: any) {
    Alert.alert("Errore voci", e?.message || "Non sono riuscito a caricare le voci ElevenLabs");
    setElevenVoices([]);
  } finally {
    setElevenVoicesLoading(false);
  }
};

  /*---------------RECORD/STOP/PLAY IMAGE-VIDEO---------*/
  const startRecording = async () => {
  try {
    const permission = await Audio.requestPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow microphone access");
      return;
    }

    if (recordedAudioSound) {
      await recordedAudioSound.unloadAsync();
      setRecordedAudioSound(null);
      setIsPlayingRecordedAudio(false);
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();

    setRecording(rec);
    setIsRecording(true);
  } catch (e: any) {
    console.log("Start recording error:", e);
    Alert.alert("Errore registrazione", e?.message || "Impossibile iniziare la registrazione");
  }
};

const stopRecording = async () => {
  try {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    setRecording(null);
    setIsRecording(false);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    if (!uri) {
      throw new Error("Audio URI mancante");
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await saveRecordedVoice({
      uri,
      base64,
      mimeType: "audio/mp4",
    });

    setUseRecordedAudio(true);
  } catch (e: any) {
    console.log("Stop recording error:", e);
    Alert.alert("Errore registrazione", e?.message || "Impossibile fermare la registrazione");
  }
};

const playRecordedAudio = async () => {
  try {
    if (!recordedAudioUri) {
      Alert.alert("Nessun audio", "Registra prima un audio");
      return;
    }

    if (isPlayingRecordedAudio && recordedAudioSound) {
      await recordedAudioSound.stopAsync();
      await recordedAudioSound.unloadAsync();
      setRecordedAudioSound(null);
      setIsPlayingRecordedAudio(false);
      return;
    }

    if (recordedAudioSound) {
      await recordedAudioSound.stopAsync();
      await recordedAudioSound.unloadAsync();
      setRecordedAudioSound(null);
      setIsPlayingRecordedAudio(false);
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: recordedAudioUri },
      { shouldPlay: true }
    );

    setRecordedAudioSound(sound);
    setIsPlayingRecordedAudio(true);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;

      if (status.didJustFinish) {
        sound.unloadAsync();
        setRecordedAudioSound(null);
        setIsPlayingRecordedAudio(false);
      }
    });
  } catch (e: any) {
    console.log("Play recorded audio error:", e);
    Alert.alert("Errore audio", e?.message || "Impossibile riprodurre l'audio");
  }
};

const clearRecordedAudio = async () => {
  try {
    if (recordedAudioSound) {
      await recordedAudioSound.stopAsync();
      await recordedAudioSound.unloadAsync();
    }
  } catch {}

  setRecordedAudioSound(null);
  setIsPlayingRecordedAudio(false);

  await clearSavedRecordedVoice();
};

  /* -------------------- PICKERS -------------------- */
  const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission needed", "Allow gallery access");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    base64: true,
  });

  if (!result.canceled) {
    setSelectedImage(result.assets[0].uri);
    setSelectedImageBase64(result.assets[0].base64 ?? null);
  }
};

  const takePhoto = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission needed", "Allow camera access");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 1,
    base64: true,
  });

  if (!result.canceled) {
    setSelectedImage(result.assets[0].uri);
    setSelectedImageBase64(result.assets[0].base64 ?? null);
  }
};

  const pickTalkingPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setTalkingImage(result.assets[0].uri);
      setTalkingImageBase64(result.assets[0].base64 ?? null);
    }
  };

  const takeTalkingPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow camera access");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setTalkingImage(result.assets[0].uri);
      setTalkingImageBase64(result.assets[0].base64 ?? null);
    }
  };

 const pickAvatarFromGallery = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission needed", "Allow gallery access");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.2,
    base64: true,
  });

  if (!result.canceled) {
    setAvatarImage(result.assets[0].uri);
    setAvatarImageBase64(result.assets[0].base64 ?? null);
    setGeneratedVideoUrl(null);
  }
};

 const takeAvatarPhoto = async () => {
  const result = await ImagePicker.launchCameraAsync({
    quality: 1,
    base64: true,
  });

  if (!result.canceled) {
    setAvatarImage(result.assets[0].uri);
    setAvatarImageBase64(result.assets[0].base64 ?? null);
    setGeneratedVideoUrl(null);
  }
};

  const pickEffectsImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setEffectsImage(result.assets[0].uri);
      setEffectsImageBase64(result.assets[0].base64 ?? null);
    }
  };

  const takeEffectsPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow camera access");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setEffectsImage(result.assets[0].uri);
      setEffectsImageBase64(result.assets[0].base64 ?? null);
    }
  };

/*------------- GENERATE IMAGE -> VIDEO ----------*/
const generateVideo = async () => {
  //if (!isPro) {
 // setShowPaywall(true); // oppure navigation al paywall
  //return;
//}
  // 👇 METTILO QUI
    const access = await checkAccess("video");

if (!access.ok) {
  Alert.alert(
    "Passa a PRO",
    "Sblocca tutte le funzionalità premium 🚀",
    [
      { text: "Annulla", style: "cancel" },
      { text: "Vai", onPress: openPaywall }
    ]
  );
  return;
}

  if (!selectedImage) {
    Alert.alert("Errore", "Seleziona un'immagine prima");
    return;
  }

  if (!actionPrompt.trim()) {
    Alert.alert("Errore", "Scrivi cosa deve fare il personaggio");
    return;
  }

  if (addVoice && !speechText.trim() && !useRecordedAudio) {
    Alert.alert("Errore", "Scrivi cosa deve dire il personaggio");
    return;
  }

  if (addVoice && !useRecordedAudio && !selectedHedraVoice) {
    Alert.alert("Errore", "Scegli una voce");
    return;
  }

  const selectedVoiceExists = hedraVoices.some(
  (voice) => voice.id === selectedHedraVoice
);

if (addVoice && !useRecordedAudio && !selectedVoiceExists) {
  Alert.alert("Errore", "La voce selezionata non è più valida. Ricarica le voci e scegline una nuova.");
  await loadHedraVoices();
  return;
}


  if (addVoice && useRecordedAudio && !recordedAudioBase64) {
    Alert.alert("Errore", "Registra prima un audio");
    return;
  }

  try {
    setVideoLoading(true);
    setSavingToProjects(true);
    setSavedToProjects(false);

    // ----------------------------
    // 1) SOLO MOVIMENTO (Runway)
    // ----------------------------
    if (!addVoice) {
      const form = new FormData();
      form.append("isPremium", isPremium ? "true" : "false");

      form.append("prompt", actionPrompt.trim());
      const ratioMap: any = {
      "9:16": "720:1280",
      "1:1": "1024:1024",
      "3:4": "768:1024",
};
      form.append("quality", quality);
      form.append("ratio", "720:1280");
      form.append("duration", "5");

      form.append(
        "image",
        {
          uri: selectedImage,
          name: `image-${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any
      );
    
      const res = await fetch(`${API_URL}/api/runway/image-to-video`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
        body: form,
      });

     const text = await res.text();
console.log("RAW:", text);

let data;
try {
  data = JSON.parse(text);
} catch (e) {
  console.log("❌ NON JSON → backend rotto");
  throw new Error("Server error");
}

      if (!res.ok) {
  if (data?.error === "PRO_REQUIRED") {
    setShowPaywall(true);
    return;
  }

  throw new Error(data?.error || "Errore generazione talking video");
}

let creditsToSpend = addVoice
  ? CREDIT_COSTS.video.voice
  : CREDIT_COSTS.video.base;


      if (!data?.videoUrl) {
        throw new Error("Backend non ha restituito videoUrl");
      }

    if (!(await spendCredits(creditsToSpend))) return;
    
      await saveImageVideoToProjects(data.videoUrl, "720:1280", selectedImage);
      setGeneratedVideoUrl(data.videoUrl);
    } 
    
    // -----------------------------------------
    // 2) MOVIMENTO + VOCE (nuova route backend)
    // -----------------------------------------
    else {
      const form = new FormData();
      form.append("useVoiceClone", useRecordedAudio ? "true" : "false");
    
      form.append("avatarVoiceMode", avatarVoiceMode); 
      form.append("avatarInputType", avatarInputType);
      form.append("isPremium", isPremium ? "true" : "false");

      form.append("actionPrompt", actionPrompt.trim());
      form.append("speechText", useRecordedAudio ? "" : speechText.trim());

      if (!useRecordedAudio) {
        form.append("voiceId", selectedHedraVoice || "");
      }

      if (useRecordedAudio && recordedAudioBase64) {
        form.append("audioBase64", recordedAudioBase64);
      }

      form.append(
        "image",
        {
          uri: selectedImage,
          name: `image-${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any
      );

      console.log("VOICE ID:", selectedHedraVoice);
      console.log("ACTION:", actionPrompt);
      console.log("SPEECH:", speechText);
      console.log("USE RECORDED AUDIO:", useRecordedAudio);

      const res = await fetch(`${API_URL}/generate-motion-speaking-video`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Errore generazione talking video");
      }

      if (!data?.videoUrl) {
        throw new Error("Backend non ha restituito videoUrl");
      }
      
      let creditsToSpend = addVoice
  ? CREDIT_COSTS.video.voice
  : CREDIT_COSTS.video.base;

    if (!(await spendCredits(creditsToSpend))) return;

      await saveImageVideoToProjects(data.videoUrl, "720:1280", selectedImage);
      setGeneratedVideoUrl(data.videoUrl);
    }

    setSavedToProjects(true);
    setTimeout(() => setSavedToProjects(false), 2500);
  } catch (err: any) {
    console.log("generateVideo error:", err);
    Alert.alert("Errore", err?.message || "Errore nella generazione video");
  } finally {
    setVideoLoading(false);
    setSavingToProjects(false);
  }
};
/*-----------GENERATE TALKING PHOTO ---------- */
  const generateTalkingPhoto = async () => {
    //if (!isPro) {
  //setShowPaywall(true); // oppure navigation al paywall
  //return;
//}
   // 👇 METTILO QUI
    const access = await checkAccess("talking");
    if (!access.ok) {
  setShowPaywall(true);
  return;
}

    if (!talkingImage || !talkingImageBase64) {
      Alert.alert("Error", "Upload your photo first");
      return;
    }
    console.log("DURATION:", duration);
    console.log("PREMIUM:", isPremium);
    console.log("TEXT LENGTH:", talkingScript.length);

    if (!talkingScript.trim()) {
      Alert.alert("Error", "Write what the photo should say");
      return;
    }

    // 👇 AGGIUNGI QUI
const maxChars = duration === 5 ? 80 : 200;

if (talkingScript.length > maxChars) {
  Alert.alert(
    "Testo troppo lungo",
    duration === 5
      ? "Con 5s puoi scrivere massimo 80 caratteri"
      : "Max 200 caratteri"
  );
  return;
}

    if (!selectedHedraVoice) {
      Alert.alert("Error", "Choose a voice");
      return;
    }

    try {
      setTalkingLoading(true);
      setSavingToProjects(true);
      setSavedToProjects(false);

      const res = await fetch(`${API_URL}/generate-talking-photo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          imageBase64: talkingImageBase64,
          script: talkingScript,
          voiceId: selectedHedraVoice,
          ratio: "720:1280",
          duration,            // 👈 AGGIUNGI QUESTO
          isPremium: isPremium, // 👈 
        }),
      });

      const text = await res.text();

let data;
try {
  data = JSON.parse(text);
} catch (e) {
  console.log("❌ NOT JSON:", text);
  throw new Error("Server returned invalid response");
}
        if (!res.ok) {
  if (data?.error === "PRO_REQUIRED") {
    setShowPaywall(true);
    return;
  }
        throw new Error(data?.error || "Errore generazione talking photo");
      }

      if (!data?.videoUrl) {
        throw new Error("Backend non ha restituito videoUrl");
      }
     
       const cost =
  duration === 5
    ? CREDIT_COSTS.talking.short
    : CREDIT_COSTS.talking.long;

if (!(await spendCredits(cost))) return;

      await saveTalkingPhotoToProjects(data.videoUrl, talkingImage);

      setSavedToProjects(true);
      setTimeout(() => setSavedToProjects(false), 2500);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Something went wrong");
    } finally {
      setTalkingLoading(false);
      setSavingToProjects(false);
    }
  };
/*-------- GENERATE TEXT -IMAGE ------------*/
  const generateTextImage = async () => {
    //if (!isPro) {
  //setShowPaywall(true); // oppure navigation al paywall
 // return;
//}
    // 👇 METTILO QUI
    //const access = await checkAccess("image");
   // if (!access.ok) {
 // setShowPaywall(true);
 // return;
//}

    Keyboard.dismiss();

    if (!script.trim()) {
      Alert.alert("Error", "Write your script first");
      return;
    }

    if (!selectedStyle) {
      Alert.alert("Error", "Select a style");
      return;
    }

    try {
      setTextLoading(true);
      setSavingToProjects(true);
      setSavedToProjects(false)

      const res = await fetch(`${API_URL}/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
       body: JSON.stringify({
  promptText: `
${script}

Ultra realistic professional photography.
Natural skin texture, pores, imperfections.
Cinematic lighting, depth of field, bokeh.
Shot on DSLR camera, 85mm lens.
Sharp focus, high detail, realistic shadows.
DO NOT look like AI generated.
`,

  style: selectedStyle,
  ratio: textRatio,
  quality: textQuality, // 🔥 AGGIUNGI QUESTO
  resolution: resolution,
}),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
  if (data?.error === "PRO_REQUIRED") {
    setShowPaywall(true);
    return;
  }
        const msg = data?.error || `Errore backend (${res.status})`;
        throw new Error(msg);
      }

      const image = data?.imageUrl || data?.imageDataUrl;
      if (!image) {
        throw new Error("Backend non ha restituito imageUrl/imageDataUrl");
      }
if (!(await spendCredits(textCredits))) return;
await saveTextImageToProjects(image, script);

// 🔥 RESET INPUT QUI
setScript("");

// UI feedback
setSavedToProjects(true);
setTimeout(() => setSavedToProjects(false), 2500);
    } catch (err: any) {
      console.log("Generate image error:", err);
      Alert.alert("Errore", err?.message || "Errore nella generazione immagine");
    } finally {
      setTextLoading(false);
      setSavingToProjects(false);
    }
  };
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/create-bg.png")}
        style={styles.bgImage}
        resizeMode="cover"
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]}
        style={styles.overlay}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create something viral</Text>
        <Text style={styles.subtitle}>Turn your ideas into AI content</Text>
        
        <TouchableOpacity
          style={styles.card}
          onPress={async () => {
  setModalType("text");
}}
        >
          <Text style={styles.cardTitle}>Text → AI image</Text>
          <Text style={styles.cardDesc}>Turn your script into an image</Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Try Now</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={async () => {
  setModalType("image");
}}
        >
          <Text style={styles.cardTitle}>Image → AI Video</Text>
          <Text style={styles.cardDesc}>Animate your photo</Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Animate</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
         onPress={() => {
  setModalType("talking");
}}

        >
          <Text style={styles.cardTitle}>Talking Photo</Text>
          <Text style={styles.cardDesc}>Make your photo speak</Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Talk Now</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => {
  setModalType("avatar");
}}

        >
          <Text style={styles.cardTitle}>AI Avatar Studio</Text>
          <Text style={styles.cardDesc}>Create your digital twin</Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Generate</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => {
  setModalType("effects");
}}

        >
          <Text style={styles.cardTitle}>AI Effects</Text>
          <Text style={styles.cardDesc}>Viral filters & trends</Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Explore</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* IMAGE → AI VIDEO */}
     <Modal visible={modalType === "image"} animationType="fade">
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
  ref={imageVideoScrollRef}
  style={{ flex: 1, backgroundColor: "#0b0220" }}
  contentContainerStyle={styles.fullModalScroll}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>
              <TouchableOpacity
                style={styles.backButton}
               onPress={() => {
  setModalType(null);
  setActionPrompt("");
  setSpeechText("");
  setAddVoice(false);
  setUseRecordedAudio(false);
}}
              >
                <Text style={styles.backText}>‹ Back</Text>
              </TouchableOpacity>

              <Text style={styles.fullTitle}>Image → AI Video</Text>
              <Text style={styles.fullSubtitle}>
                Animate your photos into videos
              </Text>

              <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                {selectedImage ? (
  <>
    <View style={styles.previewBox}>
      <Image
        source={{ uri: selectedImage }}
        style={styles.previewBg}
        blurRadius={20}
      />
      <Image
        source={{ uri: selectedImage }}
        style={styles.previewImg}
        resizeMode="contain"
      />
    </View>

    {addVoice && (
      <Text style={styles.helperText}>
        Per un parlato migliore usa un soggetto centrale, frontale e con bocca ben visibile.
      </Text>
    )}
  </>
) : (
  <>
    <Text style={styles.uploadIcon}>＋</Text>
    <Text style={styles.uploadTitle}>Upload your photo</Text>
    <Text style={styles.uploadSubtitle}>JPG or PNG • Max 10MB</Text>
  </>
)}
              </TouchableOpacity>

              <View style={styles.rowButtons}>
                <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
                  <Text style={styles.secondaryText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
                  <Text style={styles.secondaryText}>Camera</Text>
                </TouchableOpacity>
              </View>

      <Text style={styles.selectorLabel}>Resolution</Text>

<View style={styles.rowButtons}>
  <TouchableOpacity
    style={[
      styles.secondaryButton,
      quality === "hd" && styles.selectedStyleBtn,
    ]}
    onPress={() => setQuality("hd")}
  >
    <Text style={styles.secondaryText}>Standard HD</Text>
  </TouchableOpacity>

 <TouchableOpacity
  style={[
    styles.secondaryButton,
    quality === "ultra" && styles.selectedStyleBtn,
    { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", paddingLeft: 24 }
  ]}
  onPress={() => {
  if (!isPremium) {
    Alert.alert("PRO Feature", "Questa funzione è disponibile solo per utenti PRO");
    return;
  }

  setQuality("ultra");
}}
>

  {/* 🔥 BADGE PRO INLINE */}
  <View style={styles.proBadgeInline}>
    <Text style={styles.proBadgeInlineText}>PRO</Text>
  </View>

  <Text style={styles.secondaryText}> Ultra HD</Text>

</TouchableOpacity>
</View>

<Text style={styles.selectorLabel}>Format</Text>


              <Text style={styles.selectorLabel}>What should it do?</Text>

<TextInput
  style={styles.avatarActionInput}
  placeholder='Example: Stay calm, look at the camera, smile naturally and move a little.'
  placeholderTextColor="#A855F7"
  multiline
  maxLength={180}
  value={actionPrompt}
  onChangeText={setActionPrompt}
  onFocus={() => {
    setTimeout(() => {
      imageVideoScrollRef.current?.scrollToEnd({ animated: true });
    }, 250);
  }}
/>

<Text style={styles.charCounter}>
  {actionPrompt.length}/180
</Text>
           <View style={styles.voiceToggleRow}>
  <Text style={styles.selectorLabel}>Add voice</Text>

  <TouchableOpacity
    style={[
      styles.voiceToggleButton,
      addVoice && styles.voiceToggleButtonActive,
    ]}
    onPress={() => {
  const next = !addVoice;
  setAddVoice(next);

  if (next) {
    loadHedraVoices();
  }
}}
  >
    <Text style={styles.voiceToggleButtonText}>
      {addVoice ? "ON" : "OFF"}
    </Text>
  </TouchableOpacity>
</View>

{addVoice && (
  <>

  <Text style={styles.selectorLabel}>What should it say?</Text>

<TextInput
  style={styles.avatarActionInput}
  placeholder="Write the exact words the character should say..."
  placeholderTextColor="#A855F7"
  multiline
  maxLength={180}
  value={speechText}
  onChangeText={setSpeechText}
/>

<Text style={styles.charCounter}>
  {speechText.length}/180
</Text>

    <View style={styles.voiceModeRow}>
      <TouchableOpacity
        style={[
          styles.modeChip,
          !useRecordedAudio && styles.modeChipActive,
        ]}
        onPress={() => setUseRecordedAudio(false)}
      >
        <Text style={styles.modeChipText}>Preset voice</Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={[
    styles.modeChip,
    useRecordedAudio && styles.modeChipActive,
    { opacity: isPremium ? 1 : 0.6 }
  ]}
  onPress={() => {
    if (!isPremium) {
      openPaywall();
      return;
    }

    setUseRecordedAudio(true);
  }}
>
  <Text style={styles.modeChipText}>
    Voice Clone {!isPremium ? "🔒 PRO" : ""}
  </Text>
</TouchableOpacity>
    </View>

    {!useRecordedAudio ? (
      <>
        <Text style={styles.selectorLabel}>Choose voice</Text>

        {hedraVoicesLoading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 10, marginBottom: 20 }} />
        ) : hedraVoices.length === 0 ? (
          <Text style={styles.emptyText}>No voices loaded</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.voiceScroll}
            contentContainerStyle={styles.voiceScrollContent}
          >
      
           {hedraVoices
  .filter((voice) => !!voice.preview_url)
  .map((voice) => (
              <View
                key={voice.id}
                style={[
                  styles.voiceCardHorizontal,
                  selectedHedraVoice === voice.id && styles.voiceCardHorizontalActive,
                ]}
              >
                <TouchableOpacity
                  style={styles.voiceSelectArea}
                  onPress={() => setSelectedHedraVoice(voice.id)}
                >
                  <Text style={styles.voiceNameHorizontal} numberOfLines={1}>
                    {voice.name}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.voicePlayButton}
                  onPress={() => playVoicePreview(voice)}
                >
                  <Text style={styles.voicePlayText}>
                    {playingVoiceId === voice.id ? "■" : "▶️"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

      </>
    ) : (
      <>
        <Text style={styles.selectorLabel}>Record your voice</Text>

        {hasSavedVoice && (
  <Text style={[styles.recordHint, { color: "#A855F7", marginTop: -4 }]}>
    Saved voice ready
  </Text>
)}

        <View style={styles.recordButtonsRow}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={startRecording}
            disabled={isRecording}
          >
            <Text style={styles.recordButtonText}>🎤 Record</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recordButton}
            onPress={stopRecording}
            disabled={!isRecording}
          >
            <Text style={styles.recordButtonText}>⏹️ Stop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recordButtonsRow}>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={playRecordedAudio}
            disabled={!recordedAudioUri}
          >
            <Text style={styles.recordButtonText}>
              {isPlayingRecordedAudio ? "■ Stop audio" : "▶️ Play audio"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recordButton}
            onPress={clearRecordedAudio}
            disabled={!recordedAudioUri}
          >
            <Text style={styles.recordButtonText}>🗑 Clear</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.recordHint}>
          {recordedAudioUri
            ? "Audio recorded and ready to use"
            : "Record an audio and use it in the video"}
        </Text>
      </>
    )}
  </>
)}

             <TouchableOpacity
  style={styles.generateButton}
  onPress={generateVideo}
  disabled={videoLoading}
>
  {videoLoading ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text style={styles.generateText}>
  ✨ Generate Video • {addVoice ? CREDIT_COSTS.video.voice : CREDIT_COSTS.video.base} Credits
</Text>
  )}
</TouchableOpacity>

              {savingToProjects && (
                <Text style={styles.statusMsg}>
                  ⏳ La tua creazione si sta salvando in Projects...
                </Text>
              )}
              {savedToProjects && (
                <Text style={styles.statusMsg}>✅ Salvata in Projects!</Text>
              )}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* TALKING PHOTO */}
      <Modal visible={modalType === "talking"} animationType="fade">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
           <ScrollView
  ref={talkingScrollRef}
  style={{ flex: 1, backgroundColor: "#0b0220" }}
  contentContainerStyle={styles.fullModalScroll}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                resetTalkingPhoto();
                setModalType(null);
                }}
              >
                <Text style={styles.backText}>‹ Back</Text>
              </TouchableOpacity>

              <Text style={styles.fullTitle}>Talking Photo</Text>
              <Text style={styles.fullSubtitle}>
                Turn your photo into a speaking video
              </Text>

              <TouchableOpacity
                style={styles.uploadBoxSmall}
                onPress={pickTalkingPhoto}
              >
                {talkingImage ? (
                  <Image
                    source={{ uri: talkingImage }}
                    style={styles.uploadPreview}
                    resizeMode="contain"
                  />
                ) : (
                  <>
                    <Text style={styles.uploadIcon}>＋</Text>
                    <Text style={styles.uploadTitle}>Upload your photo</Text>
                    <Text style={styles.uploadSubtitle}>JPG or PNG • Max 10MB</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={pickTalkingPhoto}
                >
                  <Text style={styles.secondaryText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={takeTalkingPhoto}
                >
                  <Text style={styles.secondaryText}>Camera</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.selectorLabel}>Choose voice</Text>
              <Text style={styles.subtitle}>Turn your ideas into AI content</Text>

{/* 🎯 DURATION */}
<View style={{ flexDirection: "row", marginTop: 10 }}>
  
  <TouchableOpacity
    onPress={() => setDuration(5)}
    style={{
      padding: 10,
      borderRadius: 10,
      backgroundColor: duration === 5 ? "#7B5CFF" : "#222",
      marginRight: 10,
    }}
  >
  <Text style={{ color: "white" }}>
    ⚡ Short (5s)
  </Text>
</TouchableOpacity>

  <TouchableOpacity
    onPress={() => {
      if (!isPremium) {
       openPaywall();
        return;
      }
      setDuration(15);
    }}
    style={{
      padding: 10,
      borderRadius: 10,
      backgroundColor: duration === 15 ? "#7B5CFF" : "#222",
      opacity: !isPremium ? 0.5 : 1,
    }}
  >
    <Text style={{ color: "white" }}>
    🔒 Long (15s PRO)
    </Text>
  </TouchableOpacity>

</View>

              {hedraVoicesLoading ? (
                <ActivityIndicator color="#fff" style={{ marginTop: 10, marginBottom: 20 }} />
              ) : hedraVoices.length === 0 ? (
                <Text style={styles.emptyText}>No voices loaded</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.voiceScroll}
                  contentContainerStyle={styles.voiceScrollContent}
                >

                {hedraVoices.map((voice) => {
  const isLocked = hedraVoices.indexOf(voice) !== 0 && !isPremium;

  return (
    <View
      key={voice.id}
      style={[
        styles.voiceCardHorizontal,
        selectedHedraVoice === voice.id && styles.voiceCardHorizontalActive,
      ]}
    >
      <TouchableOpacity
        style={styles.voiceSelectArea}
        onPress={() => {
          if (isLocked) {
            openPaywall();
            return;
          }

          setSelectedHedraVoice(voice.id);
        }}
      >
        <Text style={styles.voiceNameHorizontal} numberOfLines={1}>
          {voice.name}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.voicePlayButton}
        onPress={() => {
          if (isLocked) {
            openPaywall();
            return;
          }

          playVoicePreview(voice);
        }}
      >
        <Text style={styles.voicePlayText}>
          {playingVoiceId === voice.id ? "■" : "▶️"}
        </Text>
      </TouchableOpacity>
    </View>
  );
})}
                </ScrollView>
              )}

             <TextInput
  style={styles.avatarActionInput}
  placeholder="Write what the photo should say..."
  placeholderTextColor="#A855F7"
  multiline
  value={talkingScript}
  onChangeText={(text) => {
  const maxChars = duration === 5 ? 80 : 200;

  if (text.length <= maxChars) {
    setTalkingScript(text);
  }
}}
  onFocus={() => {
    setTimeout(() => {
      talkingScrollRef.current?.scrollToEnd({ animated: true });
    }, 250);
  }}
/>
              <Animated.View style={[styles.generateButton, glowStyle]}>
                <TouchableOpacity
                  onPress={generateTalkingPhoto}
                  disabled={talkingLoading}
                >
                  {talkingLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.generateText}>
  ✨ Generate Talking • {duration === 5 ? CREDIT_COSTS.talking.short : CREDIT_COSTS.talking.long} Credits
</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {savingToProjects && (
                <Text style={styles.statusMsg}>
                  ⏳ La tua creazione si sta salvando in Projects...
                </Text>
              )}
              {savedToProjects && (
                <Text style={styles.statusMsg}>✅ Salvata in Projects!</Text>
              )}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* TEXT → AI IMAGE */}
      <Modal visible={modalType === "text"} animationType="fade">
        <View style={styles.fullModalContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setModalType(null)}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.fullTitle}>Text → AI image</Text>
          <Text style={styles.fullSubtitle}>
            Turn your script into a viral image
          </Text>

          <Text style={styles.selectorLabel}>Resolution</Text>

<View style={styles.rowButtons}>
  <TouchableOpacity
    style={[
      styles.secondaryButton,
      textQuality === "hd" && styles.selectedStyleBtn,
    ]}
    onPress={() => setTextQuality("hd")}
  >
    <Text style={styles.secondaryText}>HD 1K</Text>
  </TouchableOpacity>

  <TouchableOpacity
  style={[
    styles.secondaryButton,
    textQuality === "ultra" && styles.selectedStyleBtn,
  ]}
  onPress={() => {
  if (!isPremium) {
    Alert.alert(
      "🔒 Feature PRO",
      "Passa a PRO per usare Ultra HD 2K",
      [
        { text: "Annulla", style: "cancel" },
        { text: "Vai a PRO", onPress: () => router.push("/buyCredits") }
      ]
    );
    return;
  }

  setTextQuality("ultra");
}}
>
  {/* 🔶 BADGE PRO */}
  <View style={styles.proBadgeInside}>
    <Text style={styles.proBadgeText}>PRO</Text>
  </View>

  <Text style={styles.secondaryText}>Ultra HD 2K</Text>
</TouchableOpacity>
</View>

<Text style={styles.selectorLabel}>proportions</Text>

<View style={styles.ratioContainer}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    }}
  >
    {[
      { label: "9:16", w: 24, h: 42 },
      { label: "4:5", w: 30, h: 40 },
      { label: "2:3", w: 28, h: 40 },
      { label: "3:2", w: 40, h: 30 },
      { label: "1:1", w: 34, h: 34 },
      { label: "16:9", w: 42, h: 24 },
    ].map((item) => {
      const isActive = textRatio === item.label;

      return (
        <TouchableOpacity
          key={item.label}
          style={styles.ratioItem}
          onPress={() => setTextRatio(item.label as any)}
        >
          <View
            style={[
              styles.ratioBox,
              { width: item.w, height: item.h },
              isActive && styles.ratioBoxActive,
            ]}
          />

          <Text
            style={[
              styles.ratioLabel,
              isActive && styles.ratioLabelActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
</View>

          <TextInput
            style={styles.scriptBox}
            placeholder="Describe your image...a realistic or cartoon image of a dog..."
            placeholderTextColor="#A855F7"
            multiline
            value={script}
            onChangeText={setScript}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            onBlur={Keyboard.dismiss}
          />

          <View style={styles.rowButtons}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                selectedStyle === "photorealistic" && styles.selectedStyleBtn,
              ]}
              onPress={() => setSelectedStyle("photorealistic")}
            >
              <Text style={styles.secondaryText}>photorealistic</Text>
            </TouchableOpacity>
            <View style={styles.proOverlay}>
  {!isPremium && (
    <Text style={styles.proOverlayText}>PRO</Text>
  )}
</View>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                selectedStyle === "cartoon" && styles.selectedStyleBtn,
              ]}
              onPress={() => setSelectedStyle("cartoon")}
            >
              <Text style={styles.secondaryText}>cartoon</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.readyText}>
            Your image will be ready in approximately{"\n"}
            <Text style={{ fontWeight: "bold", color: "#fff" }}>1 minute!</Text>
          </Text>

          <Animated.View style={[styles.generateButton, glowStyle]}>
            <TouchableOpacity onPress={generateTextImage} disabled={textLoading}>
              {textLoading ? (
                <ActivityIndicator color="white" />
              ) : (
               <Text style={styles.generateText}>
  ✨ Create • {textCredits} Credits
</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {savingToProjects && (
            <Text style={styles.statusMsg}>
              ⏳ La tua creazione si sta salvando in Projects...
            </Text>
          )}
          {savedToProjects && (
            <Text style={styles.statusMsg}>✅ Salvata in Projects!</Text>
          )}
        </View>
      </Modal>

      {/* AI AVATAR STUDIO */}
      <Modal visible={modalType === "avatar"} animationType="fade">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              ref={avatarScrollRef}
              style={{ flex: 1, backgroundColor: "#0b0220" }}
              contentContainerStyle={styles.fullModalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
             <TouchableOpacity
  style={styles.backButton}
  onPress={() => {
    setModalType(null);
    setAvatarImage(null);
    setAvatarImageBase64(null);
    setAvatarPrompt("");
    setAvatarPreset(null);
    setAvatarVoiceMode("preset");
    setSelectedElevenVoice(null);
    setGeneratedVideoUrl(null);
  }}
>
  <Text style={styles.backText}>‹ Back</Text>
</TouchableOpacity>

              <Text style={styles.fullTitle}>AI Avatar Studio</Text>
              <Text style={styles.fullSubtitle}>
                Create & animate your digital twin
              </Text>

              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={[
                    styles.secondaryButton,
                    avatarStyle === "3d" && styles.selectedStyleBtn,
                  ]}
                  onPress={() => setAvatarStyle("3d")}
                >
                  <Text style={styles.secondaryText}>3D Style</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.secondaryButton,
                    avatarStyle === "2d" && styles.selectedStyleBtn,
                  ]}
                  onPress={() => setAvatarStyle("2d")}
                >
                  <Text style={styles.secondaryText}>2D Style</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.selectorLabel}>Choose input type</Text>

              <View style={styles.voiceModeRow}>
                <View style={{ position: "relative" }}>

  {/* 🔒 PRO BADGE */}
  {!isPremium && (
    <View
  style={{
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FFD700", // giallo
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  }}
>
  <Text style={{ color: "#000", fontSize: 10, fontWeight: "bold" }}>
    PRO
  </Text>
</View>
  )}

  <TouchableOpacity
    style={[
      styles.modeChip,
      avatarInputType === "custom" && styles.modeChipActive,
    ]}
    onPress={() => {
      if (!isPremium) {
        openPaywall();
        return;
      }

      setAvatarInputType("custom");
      setAvatarPreset(null);
    }}
  >
    <Text style={styles.modeChipText}>Custom Prompt</Text>
  </TouchableOpacity>

</View>

                <TouchableOpacity
                  style={[
                    styles.modeChip,
                    avatarInputType === "preset" && styles.modeChipActive,
                  ]}
                  onPress={() => {
                    setAvatarInputType("preset");
                    setAvatarImage(null);
                    setAvatarImageBase64(null);
                  }}
                >
                  <Text style={styles.modeChipText}>Preset Avatar</Text>
                </TouchableOpacity>
              </View>

             {avatarInputType !== "preset" && (
                <View style={styles.avatarUploadBox}>
                  <Text style={styles.uploadTitle}>Upload your avatar photo</Text>
                  <Text style={styles.uploadSubtitle}>
                    Use a clear front-facing image
                  </Text>

                  <View style={styles.avatarPreview}>
                    {avatarImage ? (
                      <Image
                        source={{ uri: avatarImage }}
                        style={{ width: "100%", height: "100%", borderRadius: 18 }}
                      />
                    ) : (
                      <Text style={styles.avatarPreviewIcon}>📷</Text>
                    )}
                  </View>

                  <View style={styles.avatarMiniButtonsRow}>
                    <TouchableOpacity
                      style={styles.avatarMiniButton}
                      onPress={pickAvatarFromGallery}
                    >
                      <Text style={styles.avatarMiniButtonText}>🖼️{"\n"}Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.avatarMiniButton}
                      onPress={takeAvatarPhoto}
                    >
                      <Text style={styles.avatarMiniButtonText}>📸{"\n"}Camera</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
                
                {avatarInputType === "preset" && (
  <>
    <Text style={styles.selectorLabel}>Choose your avatar</Text>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.voiceScroll}
      contentContainerStyle={styles.voiceScrollContent}
    >
      {AVATAR_PRESETS.map((preset) => (
        <TouchableOpacity
          key={preset.id}
          style={[
            styles.avatarPresetCard,
            avatarPreset === preset.id && styles.avatarPresetCardActive,
          ]}
          onPress={() => selectAvatarPreset(preset.id)}
          activeOpacity={0.9}
        >
          <Image source={preset.image} style={styles.avatarPresetImage} />
          <Text style={styles.avatarPresetLabel}>{preset.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </>
)}

             <TextInput
  style={styles.avatarActionInput}
  placeholder={
    avatarInputType === "preset"
      ? 'Example: "Write exactly what the avatar should say..."'
      : 'Example: A confident woman looking at the camera, speaking naturally and saying: "Ciao, sono Jen e voglio presentarti Jenesis..."'
  }
  placeholderTextColor="#A855F7"
  multiline
  maxLength={180}
  value={avatarPrompt}
  onChangeText={setAvatarPrompt}
  onFocus={() => {
    setTimeout(() => {
      avatarScrollRef.current?.scrollToEnd({ animated: true });
    }, 250);
  }}
/>

                <Text style={styles.charCounter}>
  {avatarPrompt.length}/180
</Text>

              <View style={styles.voiceModeRow}>
                <TouchableOpacity
                  style={[
                    styles.modeChip,
                    avatarVoiceMode === "preset" && styles.modeChipActive,
                  ]}
                  onPress={() => setAvatarVoiceMode("preset")}
                >
                  <Text style={styles.modeChipText}>Preset voice</Text>
                </TouchableOpacity>

                <View style={{ position: "relative" }}>

  {/* 🔒 PRO BADGE */}
  {!isPremium && (
    <View
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "#FFD700",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        zIndex: 10,
      }}
    >
      <Text style={{ color: "#000", fontSize: 10, fontWeight: "bold" }}>
        PRO
      </Text>
    </View>
  )}

  <TouchableOpacity
    style={[
      styles.modeChip,
      avatarVoiceMode === "clone" && styles.modeChipActive,
    ]}
    onPress={() => {
      if (!isPremium) {
        openPaywall();
        return;
      }

      setAvatarVoiceMode("clone");
    }}
  >
    <Text style={styles.modeChipText}>Recorded voice</Text>
  </TouchableOpacity>

</View>
              </View>

    {avatarVoiceMode === "preset" ? (
  <>
    <Text style={styles.selectorLabel}>Choose voice</Text>

    {elevenVoicesLoading ? (
      <ActivityIndicator color="#fff" style={{ marginTop: 10, marginBottom: 20 }} />
    ) : elevenVoices.length === 0 ? (
      <Text style={styles.emptyText}>No voices loaded</Text>
    ) : (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.voiceScroll}
        contentContainerStyle={styles.voiceScrollContent}
      >
        {elevenVoices.map((voice, index) => {
          const isProVoice = index > 1;

          return (
            <View
              key={voice.id}
              style={[
                styles.voiceCardHorizontal,
                selectedElevenVoice === voice.id && styles.voiceCardHorizontalActive,
              ]}
            >
              <TouchableOpacity
                style={styles.voiceSelectArea}
                onPress={() => {
                  // 🔒 BLOCCO PRO (UGUALE TALKING PHOTO)
                  if (isProVoice && !isPremium) {
                    Alert.alert(
                    "Alert",
                     "Passa a PRO",
                     [
                     {
                     text: "OK",
                     style: "default",
                    },
                  ]
                );
                    return;
                  }

                  setSelectedElevenVoice(voice.id);
                }}
              >
                <Text style={styles.voiceNameHorizontal} numberOfLines={1}>
                  {voice.name}
                </Text>
              </TouchableOpacity>

              {voice.preview_url ? (
                <TouchableOpacity
                  style={styles.voicePlayButton}
                  onPress={() => {
                    // 🔒 BLOCCA ANCHE PLAY (IMPORTANTISSIMO)
                    if (isProVoice && !isPremium) {
                    Alert.alert(
                    "Alert",
                    "Passa a PRO",
                   [{ text: "OK", style: "default" }]
                     );
                     return;
                    }

                    playVoicePreview({
                      id: voice.id,
                      name: voice.name,
                      preview_url: voice.preview_url,
                    });
                  }}
                >
                  <Text style={styles.voicePlayText}>
                    {playingVoiceId === voice.id ? "■" : "▶️"}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    )}
  </>
) : (
  <>
    <Text style={styles.selectorLabel}>Use recorded voice</Text>
    
    {hasSavedVoice && (
  <Text style={[styles.recordHint, { color: "#A855F7", marginTop: -4 }]}>
    Saved voice ready
  </Text>
)}

    <View style={styles.recordButtonsRow}>
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordButtonActive,
        ]}
        onPress={startRecording}
        disabled={isRecording}
      >
        <Text style={styles.recordButtonText}>🎤 Record</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.recordButton}
        onPress={stopRecording}
        disabled={!isRecording}
      >
        <Text style={styles.recordButtonText}>⏹️ Stop</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.recordButtonsRow}>
      <TouchableOpacity
        style={styles.recordButton}
        onPress={playRecordedAudio}
        disabled={!recordedAudioUri}
      >
        <Text style={styles.recordButtonText}>
          {isPlayingRecordedAudio ? "■ Stop audio" : "▶️ Play audio"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.recordButton}
        onPress={clearRecordedAudio}
        disabled={!recordedAudioUri}
      >
        <Text style={styles.recordButtonText}>🗑 Clear</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.recordHint}>
      {recordedAudioUri
        ? "Audio recorded and ready to use"
        : "Record an audio and use it in the avatar"}
    </Text>
  </>
)}
              <Animated.View style={[styles.generateButton, glowStyle]}>
                <TouchableOpacity
                  onPress={generateAndAnimateAvatar}
                  disabled={avatarLoading}
                >
                  {avatarLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                  <Text style={styles.generateText}>
  ✨ Generate Avatar • {CREDIT_COSTS.avatar} Credits
</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {savingToProjects && (
                <Text style={styles.statusMsg}>
                  ⏳ La tua creazione si sta salvando in Projects...
                </Text>
              )}
              {savedToProjects && (
                <Text style={styles.statusMsg}>✅ Salvata in Projects!</Text>
              )}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* AI EFFECTS */}
      <Modal visible={modalType === "effects"} animationType="fade">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.effectsScreen}>
              <View style={styles.effectsCardContainer}>
                <TouchableOpacity
                  style={styles.effectsBackPill}
                  onPress={() => setModalType(null)}
                >
                  <Text style={styles.effectsBackText}>← Back</Text>
                </TouchableOpacity>

                <Text style={styles.effectsTitleBig}>AI EFFECTS</Text>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.effectsUploadBox}
                  onPress={pickEffectsImage}
                >
                 {effectsImage ? (
  <Image
    source={{ uri: effectsImage }}
    style={styles.effectsUploadedPreview}
    resizeMode="contain"
  />
) : (
                    <View style={styles.effectsUploadInner}>
                      <View style={styles.plusCircle}>
                        <Text style={styles.plusText}>+</Text>
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.effectsUploadTitle}>Upload your photo</Text>
                        <Text style={styles.effectsUploadSub}>JPG or PNG • Max 10MB</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.effectsTopButtons}>
                  <TouchableOpacity
                    style={styles.effectsSmallBtn}
                    onPress={pickEffectsImage}
                  >
                    <Text style={styles.effectsSmallBtnText}>🖼️  Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.effectsSmallBtn}
                    onPress={takeEffectsPhoto}
                  >
                    <Text style={styles.effectsSmallBtnText}>📷  Camera</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.effectsGrid2x2}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.effectTile,
                      selectedEffect === "movie" && styles.effectTileSelected,
                    ]}
                   onPress={() => handleSelectEffect("movie")}
                  >
                    <Image
                      source={require("../../assets/effects/movie.jpg")}
                      style={styles.effectThumbImg}
                    />
                    <Text style={styles.effectLabelText}>Movie Style</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.effectTile,
                      selectedEffect === "cyberpunk" && styles.effectTileSelected,
                    ]}
                   onPress={() => handleSelectEffect("cyberpunk")}
                  >
                    <Image
                      source={require("../../assets/effects/cyberpunk.jpg")}
                      style={styles.effectThumbImg}
                    />
                    <Text style={styles.effectLabelText}>Cyberpunk</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.effectTile,
                      selectedEffect === "photorealistic" &&
                        styles.effectTileSelected,
                    ]}
                    onPress={() => handleSelectEffect("photorealistic")}
                  >
                    <Image
                      source={require("../../assets/effects/photorealistic.jpg")}
                      style={styles.effectThumbImg}
                    />
                    <Text style={styles.effectLabelText}>Photorealistic</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.effectTile,
                      selectedEffect === "cartoon" && styles.effectTileSelected,
                    ]}
                    onPress={() => handleSelectEffect("cartoon")}
                  >
                    <Image
                      source={require("../../assets/effects/cartoon.jpg")}
                      style={styles.effectThumbImg}
                    />
                    <Text style={styles.effectLabelText}>Cartoon</Text>
                  </TouchableOpacity>
                </View>

                <Animated.View style={[styles.effectsGenerateWrap, glowShadow]}>
                  <TouchableOpacity
                    style={{ width: "100%", alignItems: "center" }}
                    onPress={generateEffectsVideo}
                    disabled={effectsLoading}
                  >
                    {effectsLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>
  ✨ Create • 10 Credits
</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>

                {savingToProjects && (
                  <Text style={styles.statusMsg}>
                    ⏳ La tua creazione si sta salvando in Projects...
                  </Text>
                )}
                {savedToProjects && (
                  <Text style={styles.statusMsg}>✅ Salvata in Projects!</Text>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  statusMsg: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 120,
    paddingBottom: 140,
  },
  bgImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
    marginBottom: 27,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  cardDesc: {
    fontSize: 14,
    color: "#ccc",
    marginVertical: 6,
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  fullModalContainer: {
    flex: 1,
    backgroundColor: "#0b0220",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  fullModalScroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: "#fff",
    fontSize: 18,
  },
  fullTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  fullSubtitle: {
    color: "#bbb",
    textAlign: "center",
    marginBottom: 30,
  },
  uploadBox: {
    height: 190,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  uploadBoxSmall: {
    height: 170,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  uploadPreview: {
    width: "100%",
    height: "100%",
  },
  uploadIcon: {
    fontSize: 42,
    color: "#A855F7",
    marginBottom: 10,
  },
  uploadTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  uploadSubtitle: {
    color: "#aaa",
    marginTop: 6,
    fontSize: 13,
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
 secondaryButton: {
  backgroundColor: "rgba(255,255,255,0.08)",
  paddingVertical: 5,
  paddingHorizontal: 7,
  borderRadius: 12,
  width: "46%",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
},
  secondaryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  descriptionInput: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 25,
    color: "#000",
  },
  generateButton: {
    backgroundColor: "#7C3AED",
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
  },
  generateText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  scriptBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    height: 180,
    marginBottom: 25,
    fontSize: 16,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    textAlignVertical: "top",
  },
  readyText: {
    color: "#bbb",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
  },
  selectedStyleBtn: {
    borderColor: "#A855F7",
    borderWidth: 2,
    backgroundColor: "rgba(168,85,247,0.2)",
  },
  selectorLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 4,
  },
  voiceScroll: {
    marginTop: 6,
    marginBottom: 16,
  },
  voiceScrollContent: {
    paddingRight: 10,
  },
  voiceCardHorizontal: {
    minWidth: 120,
    maxWidth: 170,
    minHeight: 46,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    flexDirection: "row",
  },
  voiceCardHorizontalActive: {
    borderColor: "#A855F7",
    backgroundColor: "rgba(168,85,247,0.25)",
  },
  voiceNameHorizontal: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    color: "rgba(255,255,255,0.65)",
    marginTop: 10,
    marginBottom: 20,
    fontSize: 15,
  },
  avatarUploadBox: {
    height: 260,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 16,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  avatarPreviewIcon: {
    fontSize: 34,
    color: "#A855F7",
  },
  avatarMiniButtonsRow: {
    flexDirection: "row",
    gap: 14,
  },
  avatarMiniButton: {
    width: 110,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMiniButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
  avatarActionInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    minHeight: 160,
    marginBottom: 18,
    fontSize: 16,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    textAlignVertical: "top",
  },
  effectsScreen: {
    flex: 1,
    backgroundColor: "#0b0220",
    paddingTop: 60,
  },
  effectsCardContainer: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#A855F7",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  effectsBackPill: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  effectsBackText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  effectsTitleBig: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 16,
    letterSpacing: 1,
  },
  effectsUploadBox: {
    height: 90,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.03)",
    overflow: "hidden",
    justifyContent: "center",
    marginBottom: 14,
  },
  effectsUploadInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  plusCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "rgba(168,85,247,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: -2,
  },
  effectsUploadTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  effectsUploadSub: {
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  effectsTopButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  effectsSmallBtn: {
    width: "48%",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
  },
  effectsSmallBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  effectsGrid2x2: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 6,
  },
  effectTile: {
    width: "48%",
    marginBottom: 14,
  },
  effectThumbImg: {
    width: "100%",
    height: 150,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  effectTileSelected: {
    transform: [{ scale: 1.01 }],
  },
  effectLabelText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },
  effectsGenerateWrap: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: "rgba(168,85,247,0.75)",
    backgroundColor: "#7C3AED",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
  },
  effectsGenerateText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  previewBox: {
    width: "100%",
    height: 190,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 20,
  },
  previewBg: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.2 }],
  },
  previewImg: {
    width: "100%",
    height: "100%",
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(108,77,255,0.25)",
    borderWidth: 1,
    borderColor: "rgba(108,77,255,0.55)",
    color: "white",
    fontSize: 14,
    marginBottom: 10,
  },

  voiceSelectArea: {
  flex: 1,
  justifyContent: "center",
},

voicePlayButton: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "rgba(255,255,255,0.12)",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 8,
},

voicePlayText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "700",
},

charCounter: {
  color: "rgba(255,255,255,0.6)",
  fontSize: 12,
  textAlign: "right",
  marginBottom: 20,
},

voiceToggleRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
},

voiceToggleButton: {
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
},

voiceToggleButtonActive: {
  backgroundColor: "rgba(168,85,247,0.25)",
  borderColor: "#A855F7",
},

voiceToggleButtonText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "700",
},

voiceModeRow: {
  flexDirection: "row",
  gap: 10,
  marginBottom: 14,
},

modeChip: {
  flex: 1,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 12,
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
  alignItems: "center",
},

modeChipActive: {
  backgroundColor: "rgba(168,85,247,0.25)",
  borderColor: "#A855F7",
},

modeChipText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "700",
},

recordButtonsRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 12,
},

recordButton: {
  width: "48%",
  paddingVertical: 14,
  borderRadius: 15,
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
  alignItems: "center",
},

recordButtonActive: {
  borderColor: "#A855F7",
  backgroundColor: "rgba(168,85,247,0.25)",
},

recordButtonText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "700",
},

recordHint: {
  color: "rgba(255,255,255,0.75)",
  fontSize: 14,
  textAlign: "center",
  marginBottom: 16,
},

presetBadge: {
  marginTop: 4,
  fontSize: 11,
  color: "#A855F7",
  fontWeight: "600",
},

avatarGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginBottom: 18,
},

avatarCard: {
  width: "48%",
  backgroundColor: "rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 10,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
},

avatarCardActive: {
  borderColor: "#A855F7",
  backgroundColor: "rgba(168,85,247,0.22)",
},

avatarCardImage: {
  width: "100%",
  height: 150,
  borderRadius: 14,
  marginBottom: 8,
},

avatarCardLabel: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "600",
  textAlign: "center",
},

modeButton: {
  flex: 0.48,
  paddingVertical: 10,
  borderRadius: 12,
  alignItems: "center",
},

effectsUploadedPreview: {
  width: "100%",
  height: "100%",
  borderRadius: 18,
},

/*cards avatar*/
avatarPresetCard: {
  width: 150,
  marginRight: 12,
  backgroundColor: "rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 8,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
},

avatarPresetCardActive: {
  borderColor: "#A855F7",
  backgroundColor: "rgba(168,85,247,0.22)",
},

avatarPresetImage: {
  width: "100%",
  height: 180,
  borderRadius: 14,
  marginBottom: 8,
},

avatarPresetLabel: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "700",
  textAlign: "center",
  paddingBottom: 4,
},

helperText: {
  color: "rgba(255,255,255,0.65)",
  fontSize: 12,
  textAlign: "center",
  marginTop: -8,
  marginBottom: 14,
  paddingHorizontal: 8,
},

/*---BOTTONE TEXT-IMAGE---*/ 
proButtonWrapper: {
  alignItems: "center",
  justifyContent: "center",
  marginTop: 20,
  position: "relative"
},

proBadge: {
  position: "absolute",
  top: -10,
  zIndex: 10,
  backgroundColor: "#FFD700",
  paddingHorizontal: 10,
  paddingVertical: 3,
  borderRadius: 12,

  shadowColor: "#FFD700",
  shadowOpacity: 0.9,
  shadowRadius: 10,
  elevation: 8,
},

proBadgeText: {
  color: "#000",
  fontSize: 12,
  fontWeight: "bold",
  letterSpacing: 1,
},

/*---bottone photorealis---*/ 
proOverlay: {
  position: "absolute",
  left: 9, // 🔥 regola in base al tuo layout
  top: 5,
},

proOverlayText: {
  backgroundColor: "#FFD700",
  color: "#000",
  fontSize: 10,
  fontWeight: "bold",
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 6,
},

/*---style proporzioni text-image---*/ 
ratioItem: {
  alignItems: "center",
  marginRight: 10,
},

ratioBox: {
  borderRadius: 8,
  borderWidth: 2,
  borderColor: "rgba(255,255,255,0.4)",
  backgroundColor: "transparent",
  marginBottom: 6,
},

ratioBoxActive: {
  borderColor: "#67e8f9", // azzurrino come screenshot
},

ratioLabel: {
  color: "rgba(255,255,255,0.6)",
  fontSize: 13,
  fontWeight: "600",
},

ratioLabelActive: {
  color: "#67e8f9",
},

ratioContainer: {
  backgroundColor: "rgba(255,255,255,0.05)",
  borderRadius: 20,
  paddingVertical: 5,
  paddingHorizontal: 50,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
},
/*---BOTTONE PRO H2 text image---*/
proBadgeInside: {
  position: "absolute",
  top: 4,
  left: 7,
  backgroundColor: "#FFD600",
  paddingHorizontal: 2,
  paddingVertical: 1,
  borderRadius: 5,
},
/*---BOTTONE PRO image videoai---*/
proBadgeInline: {
  backgroundColor: "#FFD700",
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 6,
  marginRight: 6,
},

proBadgeInlineText: {
  color: "#000",
  fontSize: 10,
  fontWeight: "bold",
},
}); 
