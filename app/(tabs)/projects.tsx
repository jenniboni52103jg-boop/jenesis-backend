import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResizeMode, Video } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* ================= STORAGE + TYPES ================= */

export const PROJECTS_KEY = "projects";
const API_URL = "https://jenesis-backend-1.onrender.com";

type OutputItem = {
  scene: string;
  status: "queued" | "done" | "error";
  prompt: string;
  imageUrl?: string;
  error?: string;
};

export type ProjectItem = {
  id: string;

  // vecchio formato
  templateId?: string;
  name?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;

  // nuovo formato calcio
  title?: string;
  mode?: string;
  userPhotoUri?: string;
  outputs?: OutputItem[];

  // compatibilità
  createdAt: string | number;
};

export async function addProjectToProjects(item: ProjectItem) {
  const stored = await AsyncStorage.getItem(PROJECTS_KEY);
  const list: ProjectItem[] = stored ? JSON.parse(stored) : [];
  const updated = [item, ...list];
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
}

/* ================= FILTERS ================= */

type FilterKey = "all" | "images" | "videos" | "imageToVideo" | "avatar";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "images", label: "Images" },
  { key: "videos", label: "Videos" },
  { key: "imageToVideo", label: "Image → Video" },
  { key: "avatar", label: "Avatar" },
];

const isAvatar = (templateId?: string) =>
  !!templateId && templateId.startsWith("avatar-");

const isImageToVideo = (templateId?: string) => templateId === "image-video";

/* ================= HELPERS ================= */
function normalizeMediaUrl(uri?: string | null): string | null {
  if (!uri) return null;

  if (
    uri.startsWith("http://") ||
    uri.startsWith("https://") ||
    uri.startsWith("file://") ||
    uri.startsWith("data:")
  ) {
    return uri;
  }
if (!uri.includes("http") && !uri.startsWith("data:") && !uri.startsWith("file://")) {
  console.warn("⚠️ INVALID IMAGE URI:", uri);
}
  // 🔥 FIX: anche file senza path
  if (!uri.startsWith("/")) {
    return `${API_URL}/images/${uri}`;
  }

  if (uri.startsWith("/videos/") || uri.startsWith("/images/")) {
    return `${API_URL}${uri}`;
  }

  return uri;
}


function normalizeProject(project: ProjectItem): ProjectItem {
  return {
    ...project,
    imageUrl: normalizeMediaUrl(project.imageUrl),
    videoUrl: normalizeMediaUrl(project.videoUrl),
    outputs: project.outputs?.map((output) => ({
      ...output,
      imageUrl: normalizeMediaUrl(output.imageUrl) ?? undefined,
    })),
  };
}

function getFirstDoneOutput(project: ProjectItem): OutputItem | null {
  if (!project.outputs?.length) return null;
  return project.outputs.find((o) => o.status === "done" && !!o.imageUrl) ?? null;
}

function getProjectImageUri(project: ProjectItem): string | null {
  const normalizedImage = normalizeMediaUrl(project.imageUrl);
  if (normalizedImage) return normalizedImage;

  const firstOutput = getFirstDoneOutput(project);
  const normalizedOutputImage = normalizeMediaUrl(firstOutput?.imageUrl);
  if (normalizedOutputImage) return normalizedOutputImage;

  return null;
}

function getProjectVideoUri(project: ProjectItem): string | null {
  return normalizeMediaUrl(project.videoUrl);
}

function getMediaUri(project: ProjectItem): string | null {
  return getProjectVideoUri(project) || getProjectImageUri(project);
}

function isVideoItem(project: ProjectItem) {
  return !!getProjectVideoUri(project);
}

function isImageItem(project: ProjectItem) {
  return !!getProjectImageUri(project) && !getProjectVideoUri(project);
}

function labelFromProject(project: ProjectItem) {
  if (project.mode === "calcio") return "⚽ Foto con Calciatore";

  const templateId = project.templateId ?? "";

  if (templateId === "text-image") return "🖼 Text → Image";
  if (templateId === "image-video") return "🎞 Image → Video";
  if (templateId === "avatar-2d") return "👤 Avatar 2D";
  if (templateId === "avatar-3d") return "👤 Avatar 3D";
  if (templateId === "effects-movie") return "🎬 Effects: Movie";
  if (templateId === "effects-cyberpunk") return "🌆 Effects: Cyberpunk";
  if (templateId === "effects-photorealistic") return "📷 Effects: Photorealistic";
  if (templateId === "effects-cartoon") return "🧸 Effects: Cartoon";
  if (templateId === "talking-photo") return "🗣 Talking Photo";

  return "✨ Project";
}

function getDisplayName(project: ProjectItem) {
  return project.name?.trim() || project.title?.trim() || null;
}

function formatDate(value: string | number) {
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("it-IT");
}

/* ================= SCREEN ================= */

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ProjectItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<FilterKey>("all");

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const normalizedPreviewItem = previewItem
  ? normalizeProject(previewItem)
  : null;

 console.log("PREVIEW ITEM:", normalizedPreviewItem);
 console.log("OUTPUTS:", normalizedPreviewItem?.outputs);

const previewOutputs =
  normalizedPreviewItem?.outputs
    ?.map(o => ({
      ...o,
      imageUrl: normalizeMediaUrl(o.imageUrl)
    }))
    ?.filter(o => o.status === "done" && o.imageUrl) || [];

  console.log("PREVIEW OUTPUTS:", previewOutputs); // ✅ OK

  /* ===== load ===== */
  const loadProjects = useCallback(async () => {
    setLoading(true);

    try {
      const stored = await AsyncStorage.getItem(PROJECTS_KEY);
      const parsed: ProjectItem[] = stored ? JSON.parse(stored) : [];

      const fixed = Array.isArray(parsed)
        ? parsed.map(normalizeProject)
        : [];

      setProjects(fixed);
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(fixed));
    } catch (e) {
      console.error("Errore caricamento projects", e);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

  /* ===== filtered ===== */
  const filtered = useMemo(() => {
    if (active === "all") return projects;

    if (active === "images") return projects.filter(isImageItem);

    if (active === "imageToVideo") {
      return projects.filter((p) => isImageToVideo(p.templateId));
    }

    if (active === "avatar") {
      return projects.filter((p) => isAvatar(p.templateId));
    }

    return projects.filter(
      (p) =>
        isVideoItem(p) &&
        !isImageToVideo(p.templateId) &&
        !isAvatar(p.templateId)
    );
  }, [active, projects]);

  const isGrid =
    active === "all" || active === "images" || active === "avatar";

  /* ================= ACTIONS ================= */

  const ensureMediaLibraryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permesso negato",
        "Serve il permesso per salvare nella galleria."
      );
      return false;
    }
    return true;
  };

  const getBaseDir = () => {
    return FileSystem.documentDirectory || FileSystem.cacheDirectory || null;
  };

  const downloadToCache = async (
    remoteUri: string,
    forceExt?: "mp4" | "jpg" | "png" | "mov" | "webp"
  ) => {
    const extGuess =
      forceExt ??
      (() => {
        const lower = remoteUri.toLowerCase();
        if (lower.includes(".mp4")) return "mp4";
        if (lower.includes(".mov")) return "mov";
        if (lower.includes(".png")) return "png";
        if (lower.includes(".webp")) return "webp";
        return "jpg";
      })();

    const baseDir = getBaseDir();
    if (!baseDir) {
      throw new Error("expo-file-system non disponibile nella build.");
    }

    const localPath = `${baseDir}project_${Date.now()}.${extGuess}`;
    const res = await FileSystem.downloadAsync(remoteUri, localPath);
    return res.uri;
  };

  const writeBase64ToCache = async (
    dataUri: string,
    ext: "jpg" | "png" | "mp4" = "jpg"
  ) => {
    const baseDir = getBaseDir();
    if (!baseDir) {
      throw new Error("expo-file-system non disponibile nella build.");
    }

    const localPath = `${baseDir}project_${Date.now()}.${ext}`;
    const base64 = dataUri.includes(",") ? dataUri.split(",")[1] : dataUri;

    await FileSystem.writeAsStringAsync(localPath, base64, {
      encoding: "base64",
    });

    return localPath;
  };

  const handleSaveToDevice = useCallback(async () => {
    if (!selectedItem) return;

   // 👉 PRENDI TUTTE LE IMMAGINI
const outputs =
  selectedItem.outputs?.filter(o => o.status === "done" && !!o.imageUrl) || [];

const videoUri = getProjectVideoUri(selectedItem);

// ===== VIDEO =====
if (videoUri) {
  if (!(await ensureMediaLibraryPermission())) return;

  let localUri = videoUri;

  if (videoUri.startsWith("http")) {
    localUri = await downloadToCache(videoUri, "mp4");
  }

  await MediaLibrary.saveToLibraryAsync(localUri);

  Alert.alert("Salvato ✅", "Video salvato.");
  setMenuOpen(false);
  return;
}

// ===== IMMAGINI =====
if (outputs.length > 0) {
  if (!(await ensureMediaLibraryPermission())) return;

  for (const out of outputs) {
    let uri = out.imageUrl!;
    let localUri = uri;

    if (uri.startsWith("http")) {
      localUri = await downloadToCache(uri, "jpg");
    } else if (uri.startsWith("data:")) {
      localUri = await writeBase64ToCache(uri, "jpg");
    }

    await MediaLibrary.saveToLibraryAsync(localUri);
  }

  Alert.alert("Salvate ✅", `${outputs.length} immagini salvate`);
  setMenuOpen(false);
  return;
}
// 🆕 FIX PER TEXT → IMAGE (singola immagine)
const singleImage = getProjectImageUri(selectedItem);

if (singleImage) {
  if (!(await ensureMediaLibraryPermission())) return;

  let localUri = singleImage;

  if (singleImage.startsWith("http")) {
    localUri = await downloadToCache(singleImage, "jpg");
  } else if (singleImage.startsWith("data:")) {
    localUri = await writeBase64ToCache(singleImage, "jpg");
  }

  await MediaLibrary.saveToLibraryAsync(localUri);

  Alert.alert("Salvata ✅", "Immagine salvata");
  setMenuOpen(false);
  return;
}
Alert.alert("Errore", "Nessun file da salvare.");
    
  }, [selectedItem]);

  const handleShare = useCallback(async () => {
    if (!selectedItem) return;

    const uri = getMediaUri(selectedItem);
    if (!uri) return;

    try {
      const isVideo = !!getProjectVideoUri(selectedItem);
      let localUri = uri;

      if (uri.startsWith("http://") || uri.startsWith("https://")) {
        localUri = await downloadToCache(uri, isVideo ? "mp4" : "jpg");
      }

      if (Platform.OS === "ios") {
        await Share.share({ url: localUri });
      } else {
        await Share.share({
          message: "Condividi il tuo progetto",
          url: localUri,
        });
      }

      setMenuOpen(false);
    } catch (e) {
      console.error("Share error", e);
      Alert.alert("Errore", "Non sono riuscito a condividere il file.");
    }
  }, [selectedItem]);

  const handleDelete = useCallback(() => {
    if (!selectedItem) return;

    Alert.alert("Eliminare?", "Vuoi cancellare questo progetto?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: async () => {
          try {
            const updated = projects.filter((p) => p.id !== selectedItem.id);
            setProjects(updated);
            await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
            setMenuOpen(false);
            setSelectedItem(null);
          } catch (e: any) {
            console.error("Delete error", e);
            Alert.alert("Errore", String(e?.message ?? e));
          }
        },
      },
    ]);
  }, [projects, selectedItem]);

  const openRename = useCallback(() => {
    if (!selectedItem) return;
    setRenameValue(getDisplayName(selectedItem) ?? "");
    setMenuOpen(false);
    setRenameOpen(true);
  }, [selectedItem]);

  const confirmRename = useCallback(async () => {
    if (!selectedItem) return;

    const newName = renameValue.trim();
    if (!newName) {
      Alert.alert("Nome vuoto", "Inserisci un nome valido.");
      return;
    }

    try {
      const updated = projects.map((p) =>
        p.id === selectedItem.id ? { ...p, name: newName } : p
      );
      setProjects(updated);
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
      setRenameOpen(false);
      setSelectedItem(null);
    } catch (e) {
      console.error("Rename error", e);
      Alert.alert("Errore", "Non sono riuscito a rinominare.");
    }
  }, [projects, renameValue, selectedItem]);

  /* ================= HEADER ================= */

  const Header = useCallback(() => {
    return (
      <View style={styles.headerWrap}>
        <Text style={styles.title}>🗂 Projects</Text>
        <Text style={styles.subtitle}>
          Tutto quello che hai creato (foto, video, avatar…)
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((f) => {
            const selected = f.key === active;

            return (
              <Pressable
                key={f.key}
                onPress={() => setActive(f.key)}
                style={({ pressed }) => [
                  styles.chip,
                  selected && styles.chipActive,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextActive]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }, [active]);

 /* ================= ITEM (MODIFICATO PER MOSTRARE 4 FOTO) ================= */
const renderItem = useCallback(
  ({ item }: { item: ProjectItem }) => {
    const normalizedItem = normalizeProject(item);
    // Questo è il tag che vedi nella barra in alto alla card
    const tag = labelFromProject(normalizedItem); 
    const cardStyle = isGrid ? styles.gridCard : styles.listCard;
    
    const validOutputs = normalizedItem.outputs?.filter(o => o.status === "done" && !!o.imageUrl) || [];

validOutputs.forEach(o => {
  console.log("FILE EXISTS:", o.imageUrl);
});

const imageUri = getProjectImageUri(normalizedItem);
const videoUri = getProjectVideoUri(normalizedItem);

    return (
      <View style={cardStyle}>
        {/* BARRA SUPERIORE DELLA CARD: Titolo e Menu */}
        <View style={styles.cardHeader}>
          <Text style={styles.tagText}>{tag}</Text>
          <Pressable
            onPress={() => {
              setSelectedItem(normalizedItem);
              setMenuOpen(true);
            }}
            style={styles.dotsBtnSmall}
          >
            <Text style={styles.dotsText}>⋯</Text>
          </Pressable>
        </View>

        {/* NOME PROGETTO (es. Autunno) - Font stile Explore */}
        {normalizedItem.name && (
          <Text style={styles.projectNameText}>{normalizedItem.name}</Text>
        )}

        {/* MEDIA SECTION */}
        <Pressable
          onPress={() => {
            setPreviewItem(normalizedItem);
            setSelectedItem(normalizedItem);
            setPreviewOpen(true);
          }}
        >
          {videoUri ? (
            <Video
              source={{ uri: videoUri }}
              style={styles.media}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isMuted
            />
          ) : validOutputs.length > 1 ? (
            <View style={[styles.media, styles.gridImageContainer]}>
              {validOutputs.slice(0, 4).map((out, idx) => (
                <Image 
                  key={idx} 
                  source={{ uri: out.imageUrl }} 
                  style={styles.miniGridImage} 
                />
              ))}
            </View>
          ) : (
            <Image
              source={{ uri: imageUri || "" }}
              style={styles.media}
              resizeMode="cover"
            />
          )}
        </Pressable>

        {/* BARRA INFERIORE: Solo la data, rimosso il duplicato del titolo */}
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{formatDate(normalizedItem.createdAt)}</Text>
        </View>
      </View>
    );
  },
  [isGrid]
);
  /* ================= UI ================= */

  if (loading) {
    return (
      <LinearGradient
        colors={["#0B0F2F", "#1B1464", "#2E2A8A"]}
        style={styles.bg}
      >
        <View style={styles.loadingFull}>
          <ActivityIndicator size="large" color="#a78bfa" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0B0F2F", "#1B1464", "#2E2A8A"]}
      style={styles.bg}
    >
      {/* MENU MODAL */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuOpen(false)}
        >
          <Pressable style={styles.menuCard} onPress={() => {}}>
            <TouchableOpacity style={styles.menuItem} onPress={handleSaveToDevice}>
              <Text style={styles.menuText}>💾 Salva in galleria</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Text style={styles.menuText}>📤 Condividi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={openRename}>
              <Text style={styles.menuText}>✏️ Rinomina</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuDanger]}
              onPress={handleDelete}
            >
              <Text style={[styles.menuText, styles.menuDangerText]}>
                🗑 Elimina
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* RENAME MODAL */}
      <Modal
        visible={renameOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameOpen(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setRenameOpen(false)}
        >
          <Pressable style={styles.renameCard} onPress={() => {}}>
            <Text style={styles.renameTitle}>Rinomina progetto</Text>

            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Nuovo nome..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={styles.renameInput}
            />

            <View style={styles.renameRow}>
              <TouchableOpacity
                style={styles.renameBtnGhost}
                onPress={() => setRenameOpen(false)}
              >
                <Text style={styles.renameBtnGhostText}>Annulla</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.renameBtn} onPress={confirmRename}>
                <Text style={styles.renameBtnText}>Salva</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

  {/* PREVIEW MODAL CON SCROLL ORIZZONTALE (CAROUSEL) */}
<Modal
  visible={previewOpen}
  transparent
  animationType="fade"
  onRequestClose={() => {
    setPreviewOpen(false);
    setPreviewItem(null);
  }}
>
  <View style={styles.previewOverlay}>
    <Pressable
      style={styles.previewBack}
      onPress={() => {
        setPreviewOpen(false);
        setPreviewItem(null);
      }}
    >
      <Text style={styles.previewBackText}>‹ Back</Text>
    </Pressable>

    <View style={styles.previewContent}>
      {previewItem ? (
        (() => {
          const item = normalizeProject(previewItem);
          const videoUri = getProjectVideoUri(item);
          const doneOutputs = item.outputs?.filter(o => o.status === "done" && !!o.imageUrl) || [];
          const singleImage = getProjectImageUri(item);

          // 1. SE È UN VIDEO
          if (videoUri) {
            return (
              <Video
                source={{ uri: videoUri }}
                style={styles.previewMedia}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                shouldPlay
              />
            );
          }

          // 2. SE SONO PIÙ FOTO (SCROLL ORIZZONTALE)
          if (doneOutputs.length > 0) {
            return (
              <FlatList
                data={doneOutputs}
                horizontal
                pagingEnabled // Fa fermare lo scroll esattamente su ogni foto
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => `${item.id}-img-${index}`}
                renderItem={({ item: out }) => (
                  <View style={{ width: 335, height: '100%' }}> 
                    <Image
                      source={{ uri: out.imageUrl }}
                      style={styles.previewMedia}
                      resizeMode="contain"
                    />
                  </View>
                )}
              />
            );
          }

          // 3. SE È UNA FOTO SINGOLA
          if (singleImage) {
            return (
              <Image
                source={{ uri: singleImage }}
                style={styles.previewMedia}
                resizeMode="contain"
              />
            );
          }

          return <Text style={{color: '#fff'}}>Nessun contenuto</Text>;
        })()
      ) : (
        <ActivityIndicator size="large" color="#ffffff" />
      )}
    </View>
  </View>
</Modal>

      {/* LISTA / EMPTY */}
      {filtered.length === 0 ? (
        <FlatList
          data={[]}
          keyExtractor={() => "empty"}
          renderItem={null}
          ListHeaderComponent={Header}
          contentContainerStyle={{ paddingBottom: 60 }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>Nessun contenuto ancora</Text>
              <Text style={styles.emptyText}>
                Crea qualcosa nella tab “Create” e lo troverai qui salvato.
              </Text>
            </View>
          }
        />
      ) : isGrid ? (
        <FlatList
          key="grid"
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          ListHeaderComponent={Header}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 16 }}
          columnWrapperStyle={styles.columnWrap}
        />
      ) : (
        <FlatList
          key="list"
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={1}
          ListHeaderComponent={Header}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 16 }}
        />
      )}
    </LinearGradient>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  bg: { flex: 1 },

  headerWrap: {
    paddingTop: 18,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },

  title: {
    color: "#fff",
    fontSize: 28, // Più grande come richiesto
    fontWeight: "900", // Font Black
  },

  subtitle: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "600",
  },

  filtersRow: {
    gap: 10,
    paddingRight: 8,
    paddingBottom: 8,
  },

  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  chipActive: {
    backgroundColor: "rgba(124,58,237,0.35)",
    borderColor: "rgba(167,139,250,0.75)",
  },

  chipText: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "800",
    fontSize: 13,
  },

  chipTextActive: {
    color: "#fff",
  },

  loadingFull: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyWrap: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  emptyText: {
    color: "rgba(255,255,255,0.70)",
    marginTop: 10,
    textAlign: "center",
    lineHeight: 18,
  },

  columnWrap: {
    justifyContent: "space-between",
    gap: 12,
  },

  dotsBtn: {
    position: "absolute",
    top: 8,
    right: 10,
    zIndex: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },


  tag: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900", // Più marcato
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  name: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "900",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    fontSize: 15, // Un po' più grande
  },


  missing: {
    alignItems: "center",
    justifyContent: "center",
  },

  missingText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "800",
  },

  date: {
    fontSize: 11,
    color: "rgba(255,255,255,0.70)",
    padding: 10,
    textAlign: "right",
    backgroundColor: "rgba(0,0,0,0.25)",
    fontWeight: "700",
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },

  menuCard: {
    backgroundColor: "#0B0F2F",
    padding: 14,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
  },

  menuText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  menuDanger: {
    marginTop: 6,
    backgroundColor: "rgba(255,0,0,0.10)",
  },

  menuDangerText: {
    color: "#ffb4b4",
  },

  renameCard: {
    backgroundColor: "#0B0F2F",
    padding: 16,
    borderRadius: 18,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 20,
  },

  renameTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },

  renameInput: {
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  renameRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },

  renameBtnGhost: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  renameBtnGhostText: {
    color: "#fff",
    fontWeight: "800",
  },

  renameBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#7c3aed",
  },

  renameBtnText: {
    color: "#fff",
    fontWeight: "900",
  },

  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    paddingTop: 70,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

 previewBack: {
    alignSelf: "flex-start",
    marginBottom: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  previewBackText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

 previewContent: {
    flex: 1,
    width: "100%",
    borderRadius: 24,
    backgroundColor: "transparente",
    padding: 12,
    borderWidth: 0,
    borderColor: "transparente"
  },

  previewMedia: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    backgroundColor: "#0b0b18",
  },

  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 24,
  },

  previewGridImage: {
    width: "48.5%", // Immagini più piccole nella griglia come richiesto
    aspectRatio: 0.75,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: "#111",
  },

  /* ================= STILI AGGIORNATI (PIÙ LEGGERI) ================= */
  // ... (tieni gli altri stili uguali)
  
  gridCard: {
    flex: 1,
    margin: 6, // Spazio tra le card
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  listCard: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  media: {
    width: "100%",
    aspectRatio: 1, // Card quadrate come in Explore
    backgroundColor: "#1a1a1a",
  },
  gridImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniGridImage: {
    width: '50%',
    height: '50%',
    borderWidth: 0.5,
    borderColor: '#000',
  },
  cardInfo: {
    padding: 10,
  },
  tagText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600", // Più sottile del 900 di prima
    opacity: 0.9,
  },
  dateText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "400",
  },

  dotsText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  // ... altri stili ...

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)', // Leggera evidenza in alto
  },
  
  projectNameText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800", // Un po' più marcato per il nome (es. Autunno)
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  cardFooter: {
    padding: 8,
    alignItems: 'flex-end',
  },

  dotsBtnSmall: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ... resto degli stili ...
});
