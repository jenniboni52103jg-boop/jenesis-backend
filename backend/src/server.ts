import * as fal from "@fal-ai/serverless-client";
import RunwayML from "@runwayml/sdk";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import { ElevenLabsClient } from "elevenlabs";
import express from "express";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import FormData from "form-data";
import fs from "fs";
import heicConvert from "heic-convert";
import multer from "multer";
import fetch from "node-fetch";
import path from "path";
import sharp from "sharp";
import { CALCIO_ARCHETYPES_MAP, CalcioSceneKey } from "./calcioCards";
import { getCouplePrompt, restyleCalcioImage, restyleImage, restyleStyleCardImage } from "./restyle";
dotenv.config({ path: "../.env" });



// usa il binario di sistema
if (!ffmpegPath) {
  throw new Error("FFMPEG NOT FOUND");
}
ffmpeg.setFfmpegPath(ffmpegPath);

console.log("REPLICATE KEY:", process.env.REPLICATE_API_KEY);
console.log("FAL KEY LENGTH:", process.env.FAL_KEY?.length);
console.log("FFMPEG PATH:", "/usr/bin/ffmpeg");
console.log("FFMPEG PATH:", ffmpegPath);

process.env.FAL_KEY = process.env.FAL_KEY || "";
fal.config({
  credentials: process.env.FAL_KEY,
});

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true
});

const app = express();
app.get('/', (req, res) => {
  res.send('Server attivo 🚀');
});
const upload = multer({ storage: multer.memoryStorage() });

const ROOT_DIR = process.cwd();
const TEMP_DIR = path.join(ROOT_DIR, "temp");
const VIDEOS_DIR = path.join(ROOT_DIR, "videos");

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });



app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true })); // ✅ QUESTO MANCAVA
app.use("/videos", express.static("videos"));

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function stringifyUnknownError(err: any): string {
  if (typeof err === "string") return err;
  if (typeof err?.message === "string") return err.message;
  try {
    return JSON.stringify(err, null, 2);
  } catch {
    return "Errore sconosciuto";
  }
}

function createJobId() {
  return crypto.randomBytes(12).toString("hex");
}

const runway = new RunwayML({
  apiKey: requireEnv("RUNWAY_API_KEY"),
});
console.log("RUNWAY API KEY PREFIX:", requireEnv("RUNWAY_API_KEY").slice(0, 12));

app.get("/", (_req, res) => res.send("JG Backend OK ✅"));
app.get("/health", (_req, res) => res.status(200).send("OK"));

const eleven = new ElevenLabsClient({
  apiKey: requireEnv("ELEVENLABS_API_KEY"),
});


async function generateImages(req: any): Promise<string[]> {
  // 🔥 TEMP: simulazione (poi metti AI vera)
  console.log("Generating images...");

  await new Promise((r) => setTimeout(r, 2000));

  return [
    "https://via.placeholder.com/512",
    "https://via.placeholder.com/512",
    "https://via.placeholder.com/512",
    "https://via.placeholder.com/512",
  ];
}

async function refineImages(images: string[]): Promise<string[]> {
  console.log("Refining images...");

  await new Promise((r) => setTimeout(r, 1000));

  return images; // per ora non cambia niente
}
/* ================== FUNZIONE CLOUDINARI ================== */
async function uploadToCloudinary(buffer: Buffer) {
  // DEBUG: Se questo stampa undefined, le variabili env non sono caricate
  console.log("Cloudinary Config Check:", cloudinary.config().api_key); 

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "app" },
      (error, result) => {
        if (error) {
           console.error("Errore Cloudinary dettagliato:", error); // Questo ti dirà COSA manca
           return reject(error);
        }
        resolve(result!.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/* ================== per cards couple ================== */
async function convertIfHeic(file: any) {
  if (
    file.mimetype === "image/heic" ||
    file.mimetype === "image/heif"
  ) {
    const outputBuffer = await heicConvert({
      buffer: file.buffer,
      format: "JPEG",
      quality: 1,
    });

    return outputBuffer;
  }

  return file.buffer;
}

/* ================== HELPERS RUNWAY ================== */
function toRunwayRatio(ratio: string) {
  if (ratio === "9:16" || ratio === "720:1280") return "720:1280";
  if (ratio === "16:9" || ratio === "1280:720") return "1280:720";
  if (ratio === "1:1" || ratio === "960:960") return "960:960";
  return "720:1280";
}

function bufferToDataUri(buffer: Buffer, mimeType: string) {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

function normalizeRunwayOutput(task: any): string | null {
  if (!task) return null;

  if (typeof task.output === "string") return task.output;
  if (Array.isArray(task.output) && typeof task.output[0] === "string") {
    return task.output[0];
  }
  if (Array.isArray(task.output) && typeof task.output[0]?.url === "string") {
    return task.output[0].url;
  }

  if (typeof task.videoUrl === "string") return task.videoUrl;
  if (typeof task.url === "string") return task.url;
  return null;
}

/* ================== HELPERS STABILITY ================== */
function toStabilityAspectRatio(ratio: string) {
  switch (ratio) {
    case "9:16":
    case "16:9":
    case "1:1":
    case "3:4":
    case "4:3":
    case "2:3":
      return ratio;
    default:
      return "1:1";
  }
}

function styleToPreset(style: string) {
  if (style === "photorealistic") return "photographic";
  if (style === "travel") return "travel";
  return undefined;
}

function pickBase64(result: any) {
  return (
    result?.image ||
    result?.artifacts?.[0]?.base64 ||
    result?.images?.[0]?.base64 ||
    result?.output?.[0]?.base64
  );
}

/* ================== AI EFFECTS IMAGE FILTERS ================== */
function effectImageFilter(effect: string) {
  if (effect === "movie") {
    return "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,eq=contrast=1.12:saturation=1.08:brightness=-0.02,unsharp=5:5:0.8:5:5:0.0,vignette=PI/5";
  }

  if (effect === "cyberpunk") {
    return "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,eq=contrast=1.18:saturation=1.45:brightness=0.01,colorchannelmixer=rr=1.05:rg=0.00:rb=0.10:gr=0.00:gg=0.82:gb=0.18:br=0.08:bg=0.06:bb=1.22,unsharp=5:5:0.7:5:5:0.0";
  }

  if (effect === "photorealistic") {
    return "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,eq=contrast=1.05:saturation=1.03:brightness=0.00,unsharp=7:7:1.2:7:7:0.0";
  }

  if (effect === "cartoon") {
    return "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,eq=contrast=1.10:saturation=1.35:brightness=0.02,smartblur=1.5:-0.35:-3.5:0.65,unsharp=7:7:1.4:7:7:0.0";
  }

  return "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1";
}

async function normalizeEffectInputToJpeg(buffer: Buffer) {
  return await sharp(buffer)
    .rotate()
    .jpeg({ quality: 95 })
    .toBuffer();
}

async function createEffectImage(opts: {
  imageBuffer: Buffer;
  effect: string;
}) {
  const normalizedBuffer = await normalizeEffectInputToJpeg(opts.imageBuffer);

  const inputPath = path.join(TEMP_DIR, `effect_img_input_${Date.now()}.jpg`);
  const outputPath = path.join(TEMP_DIR, `effect_img_output_${Date.now()}.jpg`);

  fs.writeFileSync(inputPath, normalizedBuffer);

  const vf = effectImageFilter(opts.effect);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-y",
        "-frames:v 1",
        "-q:v 2",
        "-f image2",
        `-vf ${vf}`,
      ])
      .save(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err));
  });

  const outputBuffer = fs.readFileSync(outputPath);

  try {
    fs.unlinkSync(inputPath);
  } catch {}

  try {
    fs.unlinkSync(outputPath);
  } catch {}

  return outputBuffer;
}
/* ================== HELPERS WATERMARK ================== */
/**
 * Applica il watermark "JenesisAI" a un buffer di immagine
 */
async function applyWatermarkToBuffer(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;

  // Creiamo un SVG dinamico per il testo della marca d'acqua
  const svgText = `
    <svg width="${width}" height="${height}">
      <style>
        .title { fill: rgba(255, 255, 255, 0.5); font-size: ${Math.floor(width / 15)}px; font-weight: bold; font-family: Arial; }
      </style>
      <text x="50%" y="90%" text-anchor="middle" class="title">JenesisAI</text>
    </svg>
  `;

  return await sharp(imageBuffer)
    .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toBuffer();
}

// ---------------- SWAPFACE per photo ai ----------------
async function swapFace(templatePath: string, userBuffer: Buffer) {
  process.env.FAL_KEY = "8ee7f096-30f2-46b2-8e20-2108740cec98:271e1e9b6c13ad1f49426b699bdd565f";

  try {
    console.log("📸 Caricamento immagini...");

    // Trasformiamo i Buffer in File/Blob in un modo che non dia errori di tipo
    // Usiamo 'any' solo per il caricamento per bypassare il blocco di TypeScript
    const userImage: any = userBuffer;
    const templateImage: any = fs.readFileSync(templatePath);

    const userImageUrl = await fal.storage.upload(userImage);
    const templateImageUrl = await fal.storage.upload(templateImage);

    console.log("🚀 Esecuzione Face Swap con polling...");

    // Usiamo 'subscribe' invece di 'run' o 'queue'. 
    // È l'unico metodo che gestisce l'attesa senza dare "Request in progress" o "Timeout".
    const result: any = await fal.subscribe("fal-ai/face-swap", {
      input: {
        base_image_url: templateImageUrl,
        swap_image_url: userImageUrl,
      },
      pollInterval: 5000, // Controlla ogni 5 secondi
    });

    const finalUrl = result.image?.url || result.images?.[0]?.url;
    
    if (!finalUrl) throw new Error("Risultato non trovato");

    console.log("✅ Face Swap completato con successo!");
    return finalUrl;

  } catch (error: any) {
    console.error("❌ ERRORE:", error.message);
    throw error;
  }
}

//}
/* ================== HELPERS ELEVENLABS ================== */
async function elevenTextToSpeech(text: string, voiceId?: string) {
  const finalVoiceId = voiceId || requireEnv("ELEVENLABS_VOICE_ID");

  const audioStream = await (eleven as any).textToSpeech.convert(
    finalVoiceId,
    {
      text: text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    }
  );

  const chunks: Buffer[] = [];

  for await (const chunk of audioStream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

async function downloadToBuffer(url: string) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
  return await resp.buffer();
}

/*============ helper elevenlabs ==========*/
async function elevenCloneVoice(opts: {
  name: string;
  audioBuffer: Buffer;
  fileName: string;
  mimeType: string;
  description?: string;
}) {
  const apiKey = requireEnv("ELEVENLABS_API_KEY");

  const form = new FormData();
  form.append("name", opts.name);
  if (opts.description) {
    form.append("description", opts.description);
  }

  form.append("files", opts.audioBuffer, {
    filename: opts.fileName,
    contentType: opts.mimeType,
  });

  const resp = await fetch("https://api.elevenlabs.io/v1/voices/add", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      ...form.getHeaders(),
    },
    body: form as any,
  });

  const text = await resp.text();
  const data = safeJsonParse(text);

  if (!resp.ok) {
    console.log("❌ Eleven clone voice error:", text);
    throw new Error(
      data?.detail?.message ||
        data?.message ||
        `Eleven clone voice error ${resp.status}`
    );
  }

  const voiceId = data?.voice_id;
  if (!voiceId) {
    console.log("❌ Eleven clone voice response:", data);
    throw new Error("voice_id mancante");
  }

  return {
    voiceId,
    raw: data,
  };
}

async function elevenGetUserVoices() {
  const apiKey = requireEnv("ELEVENLABS_API_KEY");

  const resp = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: {
      "xi-api-key": apiKey,
    },
  });

  const text = await resp.text();
  const data = safeJsonParse(text);

  if (!resp.ok) {
    console.log("❌ Eleven get voices error:", text);
    throw new Error(
      data?.detail?.message ||
        data?.message ||
        `Eleven get voices error ${resp.status}`
    );
  }

  const voices = Array.isArray(data?.voices)
    ? data.voices.map((v: any) => ({
        id: v.voice_id,
        name: v.name,
        category: v.category || null,
        preview_url: v.preview_url || null,
      }))
    : [];

  return voices;
}

/* ================== HELPERS AI EFFECTS ================== */
function getPublicBaseUrl(req: any) {
  const proto =
    (req.headers["x-forwarded-proto"] as string) ||
    req.protocol ||
    "http";

  const host = req.get("host");
  return `${proto}://${host}`;
}

function effectVideoFilter(effect: string) {
  const baseZoom =
    "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1";

  if (effect === "movie") {
    return `${baseZoom},eq=contrast=1.12:saturation=1.08:brightness=-0.02,unsharp=5:5:0.8:5:5:0.0,vignette=PI/5,zoompan=z='min(zoom+0.0009,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=125:s=720x1280:fps=25,format=yuv420p`;
  }

  if (effect === "cyberpunk") {
    return `${baseZoom},eq=contrast=1.18:saturation=1.45:brightness=0.01,colorchannelmixer=rr=1.05:rg=0.00:rb=0.10:gr=0.00:gg=0.82:gb=0.18:br=0.08:bg=0.06:bb=1.22,unsharp=5:5:0.7:5:5:0.0,zoompan=z='min(zoom+0.0010,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=125:s=720x1280:fps=25,format=yuv420p`;
  }

  if (effect === "photorealistic") {
    return `${baseZoom},eq=contrast=1.05:saturation=1.03:brightness=0.00,unsharp=7:7:1.2:7:7:0.0,zoompan=z='min(zoom+0.0007,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=125:s=720x1280:fps=25,format=yuv420p`;
  }

  if (effect === "cartoon") {
    return `${baseZoom},eq=contrast=1.10:saturation=1.35:brightness=0.02,smartblur=1.5:-0.35:-3.5:0.65,unsharp=7:7:1.4:7:7:0.0,zoompan=z='min(zoom+0.0009,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=125:s=720x1280:fps=25,format=yuv420p`;
  }

  return `${baseZoom},zoompan=z='min(zoom+0.0008,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=125:s=720x1280:fps=25,format=yuv420p`;
}

async function createEffectVideoFromImage(opts: {
  imageBuffer: Buffer;
  effect: string;
}) {
  const inputPath = path.join(TEMP_DIR, `effect_input_${Date.now()}.jpg`);
  const outputPath = path.join(VIDEOS_DIR, `effect_${opts.effect}_${Date.now()}.mp4`);

  fs.writeFileSync(inputPath, opts.imageBuffer);

  const vf = effectVideoFilter(opts.effect);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .inputOptions(["-loop 1"])
      .outputOptions([
        "-t 5",
        "-r 25",
        "-pix_fmt yuv420p",
        "-movflags +faststart",
        `-vf ${vf}`,
      ])
      .save(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err));
  });

  try {
    fs.unlinkSync(inputPath);
  } catch {}

  return outputPath;
}

/* ============== helper aiEFFECTS ================== */
function getEffectReference(effect: string) {
  const base = path.join(__dirname, "assets", "effects");

  if (effect === "movie") return path.join(base, "movie.jpg");
  if (effect === "cyberpunk") return path.join(base, "cyberpunk.jpg");
  if (effect === "photorealistic") return path.join(base, "photorealistic.jpg");
  if (effect === "cartoon") return path.join(base, "cartoon.jpg");

  throw new Error("Invalid effect");
}

/* ================== HELPERS PROMPT EFFECTS ================== */
function getEffectPrompt(effect: string) {
  const base =
    "portrait photo of the SAME person from the input image, preserve the exact same face, same identity, same gender, same ethnicity, same facial structure, same eyes, same nose, same lips, same hairline, same hairstyle, same age, same skin tone, same body proportions";

  if (effect === "movie") {
    return `${base}, cinematic movie lighting, dramatic atmosphere, luxury fashion editorial, realistic high-end portrait`;
  }

  if (effect === "cyberpunk") {
    return `${base}, cyberpunk neon lighting, futuristic fashion, sci-fi city mood, realistic portrait`;
  }

  if (effect === "photorealistic") {
    return `${base}, premium editorial photography, ultra realistic portrait, studio lighting, enhanced but same person`;
  }

  if (effect === "cartoon") {
    return `${base}, soft stylized cartoon look, but still clearly recognizable as the same person`;
  }

  return `${base}, realistic portrait`;
}

function getEffectNegativePrompt() {
  return "different person, another person, different identity, male, man, masculine face, different gender, different ethnicity, different facial features, different hairstyle, short hair, beard, mustache, face distortion, deformed face, blurry face, duplicate person, extra people, ugly, unrealistic face";
}
/* ================== AI STYLE TRANSFORM ================== */
async function transformImageWithStyle(opts: {
  imageBuffer: Buffer;
  effect: string;
}) {
  const apiKey = requireEnv("STABILITY_API_KEY");

  let prompt =
    "Keep the same person and same face. Preserve identity, facial features, hair, pose and framing. Apply only a cinematic portrait enhancement. Do not change gender, age or face.";
  let strength = "0.20";

  if (opts.effect === "movie") {
    prompt =
      "Keep the same person and same face. Preserve identity, facial features, hair, pose and framing. Apply only cinematic movie lighting, contrast and atmosphere. Do not change gender, age or face.";
    strength = "0.20";
  } else if (opts.effect === "cyberpunk") {
    prompt =
      "Keep the same person and same face. Preserve identity, facial features, hair, pose and framing. Apply only cyberpunk neon lighting, futuristic mood and color treatment. Do not change gender, age or face.";
    strength = "0.24";
  } else if (opts.effect === "photorealistic") {
    prompt =
      "Keep the same person and same face. Preserve identity, facial features, hair, pose and framing. Apply only premium photorealistic enhancement and studio-quality lighting. Do not change gender, age or face.";
    strength = "0.15";
  } else if (opts.effect === "cartoon") {
    prompt =
      "Keep the same person and same face. Preserve identity, facial features, hair, pose and framing. Apply only a soft cartoon stylization while keeping the person clearly recognizable. Do not change gender, age or face.";
    strength = "0.28";
  }

  const form = new FormData();
  form.append("prompt", prompt);
  form.append("output_format", "jpeg");
  form.append("strength", strength);
  form.append("image", opts.imageBuffer, {
    filename: "input.jpg",
    contentType: "image/jpeg",
  });

  const resp = await fetch(
    "https://api.stability.ai/v2beta/stable-image/generate/core",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        ...form.getHeaders(),
      },
      body: form as any,
    }
  );

  const text = await resp.text();
  const data = safeJsonParse(text);

  if (!resp.ok) {
    console.log("❌ Stability effect transform error:", text);
    throw new Error(
      data?.message ||
        data?.error ||
        JSON.stringify(data) ||
        `Stability transform failed (${resp.status})`
    );
  }

  const base64 =
    data?.image ||
    data?.artifacts?.[0]?.base64 ||
    data?.images?.[0]?.base64 ||
    data?.output?.[0]?.base64;

  if (!base64) {
    console.log("❌ Stability transform response:", data);
    throw new Error("Stability non ha restituito immagine");
  }

  return Buffer.from(base64, "base64");
}
/* ================== HEDRA CORE ================== */

async function hedraCreateAsset(opts: {
  name: string;
  type: "image" | "audio";
}) {
  const apiKey = requireEnv("HEDRA_API_KEY");

  const resp = await fetch("https://api.hedra.com/web-app/public/assets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      name: opts.name,
      type: opts.type,
    }),
  });
 
  const text = await resp.text();
  const data = safeJsonParse(text);

  if (!resp.ok) {
    console.log("❌ Hedra create asset error:", text);
    throw new Error(
      data?.messages?.[0] ||
        data?.message ||
        `Hedra create asset error ${resp.status}`
    );
  }

  const assetId = data?.id || data?.asset_id;
  if (!assetId) {
    console.log("❌ Hedra create asset response:", data);
    throw new Error("Hedra asset_id mancante");
  }

  return assetId;
}

async function hedraUploadAsset(opts: {
  assetId: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}) {
  const apiKey = requireEnv("HEDRA_API_KEY");

  const form = new FormData();
  form.append("file", opts.fileBuffer, {
    filename: opts.fileName,
    contentType: opts.mimeType,
  });

  const resp = await fetch(
    `https://api.hedra.com/web-app/public/assets/${opts.assetId}/upload`,
    {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        ...form.getHeaders(),
      },
      body: form as any,
    }
  );

  const text = await resp.text();
  const data = safeJsonParse(text);

  if (!resp.ok) {
    console.log("❌ Hedra upload error:", text);
    throw new Error(
      data?.messages?.[0] ||
        data?.message ||
        `Hedra upload error ${resp.status}`
    );
  }

  return data;
}

async function hedraGenerateAudio(opts: {
  text: string;
  voiceId: string;
}) {
  const apiKey = requireEnv("HEDRA_API_KEY");

  const resp = await fetch("https://api.hedra.com/web-app/public/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      type: "text_to_speech",
      voice_id: opts.voiceId,
      text: opts.text,
    }),
  });

  const text = await resp.text();
  const data = safeJsonParse(text);

  if (!resp.ok) {
    console.log("❌ Hedra generate audio error:", text);
    throw new Error(
      data?.messages?.[0] ||
        data?.message ||
        `Hedra generate audio error ${resp.status}`
    );
  }

  const generationId = data?.id;
  if (!generationId) {
    console.log("❌ Hedra generate audio response:", data);
    throw new Error("Hedra audio generation id mancante");
  }

  return generationId;
}
//* TALKING VIDEO ASYNC*//
async function hedraCreateTalkingVideo(opts: {
  imageAssetId: string;
  audioAssetId: string;
}) {
  const apiKey = requireEnv("HEDRA_API_KEY");

  const resp = await fetch("https://api.hedra.com/web-app/public/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      type: "video",
      ai_model_id: "26f0fc66-152b-40ab-abed-76c43df99bc8",
      start_keyframe_id: opts.imageAssetId,
      audio_id: opts.audioAssetId,
      generated_video_inputs: {
        text_prompt: "A character speaking to the camera with natural lip sync",
        aspect_ratio: "9:16",
        resolution: "720p",
        duration_ms: 5000,
      },
    }),
  });

  const text = await resp.text();
  const data = safeJsonParse(text);

  if (!resp.ok) {
    console.log("❌ Hedra create video error:", text);
    throw new Error(
      data?.messages?.[0] ||
        data?.message ||
        `Hedra create video error ${resp.status}`
    );
  }

  const generationId = data?.id;
  if (!generationId) {
    console.log("❌ Hedra create video response:", data);
    throw new Error("Hedra video generation id mancante");
  }

  return generationId;
}

async function hedraCreateAvatarTalkingVideo(opts: {
  imageAssetId: string;
  audioAssetId: string;
  motionVideoUrl: string;
}) {
  const apiKey = requireEnv("HEDRA_API_KEY");

  const resp = await fetch(
    "https://api.hedra.com/web-app/public/generations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        type: "video",
        ai_model_id: "26f0fc66-152b-40ab-abed-76c43df99bc8",
        start_keyframe_id: opts.imageAssetId,
        audio_id: opts.audioAssetId,
        motion_video_url: opts.motionVideoUrl,
        generated_video_inputs: {
          text_prompt: "Avatar speaking with natural lip sync",
          aspect_ratio: "9:16",
          resolution: "540p",
        },
      }),
    }
  );

  const text = await resp.text();
  const data = safeJsonParse(text);

  if (!resp.ok) {
    console.log("❌ Hedra avatar video error:", text);
    throw new Error(data?.messages?.[0] || data?.message || "Hedra avatar error");
  }

  const generationId = data?.id;
  if (!generationId) {
    console.log("❌ Hedra avatar response:", data);
    throw new Error("Hedra avatar generation id mancante");
  }

  return generationId;
}

async function hedraPollGenerationResult(generationId: string) {
  const apiKey = requireEnv("HEDRA_API_KEY");

  for (let i = 0; i < 120; i++) {
    const resp = await fetch(
      `https://api.hedra.com/web-app/public/generations/${generationId}/status`,
      {
        headers: { "X-API-Key": apiKey },
      }
    );

    const text = await resp.text();
    const data = safeJsonParse(text);

    console.log(`Hedra poll [${i + 1}/120]:`, data?.status || "no-status");

    if (!resp.ok) {
      console.log("❌ Hedra polling raw body:", text);
      throw new Error(
        data?.messages?.[0] ||
          data?.message ||
          `Hedra polling error ${resp.status}`
      );
    }

    const status = data?.status;

    if (status === "complete") {
      console.log("✅ Hedra complete:", JSON.stringify(data, null, 2));
      return data;
    }

    if (status === "failed" || status === "error") {
      console.log("❌ Hedra failed:", JSON.stringify(data, null, 2));
      throw new Error(
        data?.messages?.[0] ||
          data?.message ||
          data?.error_message ||
          "Hedra generation failed"
      );
    }

    await sleep(4000);
  }

  throw new Error("Hedra timeout");
}

async function hedraGetAssetDownloadUrl(assetId: string) {
  const apiKey = requireEnv("HEDRA_API_KEY");

  const resp = await fetch(
    `https://api.hedra.com/web-app/public/assets/${assetId}`,
    {
      headers: { "X-API-Key": apiKey },
    }
  );

  const text = await resp.text();
  const data = safeJsonParse(text);

  if (!resp.ok) {
    console.log("❌ Hedra get asset error:", text);
    throw new Error(
      data?.messages?.[0] ||
        data?.message ||
        `Hedra get asset error ${resp.status}`
    );
  }

  return (
    data?.url ||
    data?.download_url ||
    data?.streaming_url ||
    data?.asset?.url ||
    data?.asset?.download_url ||
    null
  );
}

/* ================== JOBS AVATAR ================== */

type AvatarJobStatus =
  | "queued"
  | "processing"
  | "complete"
  | "failed";

type AvatarJob = {
  id: string;
  status: AvatarJobStatus;
  progress: string;
  videoUrl: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

type StyleJob = {
  id: string;
  status: "queued" | "processing" | "complete" | "failed";
  images: string[];
  error?: string;
};

const avatarJobs = new Map<string, AvatarJob>();

const styleJobs = new Map<string, StyleJob>(); 

const STYLE_TEMPLATES: Record<string, string[]> = {
  autunno: [
    "https://.../autunno1.jpg",
    "https://.../autunno2.jpg",
    "https://.../autunno3.jpg",
    "https://.../autunno4.jpg",
  ],
  photoshop: [
    "https://.../photoshop1.jpg",
    "https://.../photoshop2.jpg",
    "https://.../photoshop3.jpg",
    "https://.../photoshop4.jpg",
  ],
  portraits: [
    "https://.../portraits1.jpg",
    "https://.../portraits2.jpg",
    "https://.../portraits3.jpg",
    "https://.../portraits4.jpg",
  ],
  travel: [
    "https://.../travel1.jpg",
    "https://.../travel2.jpg",
    "https://.../travel3.jpg",
    "https://.../travel4.jpg",
  ],
};

function createAvatarJob(): AvatarJob {
  const job: AvatarJob = {
    id: createJobId(),
    status: "queued",
    progress: "Queued",
    videoUrl: null,
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  avatarJobs.set(job.id, job);
  return job;
}

function createStyleJob(): StyleJob {
  const job: StyleJob = {
    id: createJobId(),
    status: "queued",
    images: [],
  };

  styleJobs.set(job.id, job);
  return job;
}

function updateStyleJob(jobId: string, patch: Partial<StyleJob>) {
  const job = styleJobs.get(jobId);
  if (!job) return;

  const updated = { ...job, ...patch };
  styleJobs.set(jobId, updated);
}

function updateAvatarJob(
  jobId: string,
  patch: Partial<Omit<AvatarJob, "id" | "createdAt">>
) {
  const current = avatarJobs.get(jobId);
  if (!current) return;

  const updated: AvatarJob = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  avatarJobs.set(jobId, updated);
}

async function runAvatarJob(
  jobId: string,
  payload: {
  imageBase64: string;
  avatarPrompt?: string;
  avatarVisualPrompt?: string;
  voiceMode?: string;
  voiceId?: string | null;
  recordedAudioBase64?: string | null;
  isPremium?: boolean;
}
) {
  try {
    const {
  imageBase64,
  avatarPrompt,
  avatarVisualPrompt,
  voiceMode,
  voiceId,
  recordedAudioBase64,
  isPremium,
} = payload;
    updateAvatarJob(jobId, {
      status: "processing",
      progress: "Generating voice",
      error: null,
    });

    let finalAudioBuffer: Buffer;
    let finalAudioFileName = "avatar_audio.mp3";
    let finalAudioMimeType = "audio/mpeg";

    if (voiceMode === "my_voice" || voiceMode === "clone") {
      if (!recordedAudioBase64) {
        throw new Error("Missing recorded audio");
      }

      console.log("STEP 0: using recorded audio");
      finalAudioBuffer = Buffer.from(recordedAudioBase64, "base64");
      finalAudioFileName = "avatar_audio.m4a";
      finalAudioMimeType = "audio/mp4";
    } else {
      console.log("STEP 0: ElevenLabs TTS start");
      finalAudioBuffer = await elevenTextToSpeech(
        String(avatarPrompt || "").trim(),
        voiceId || undefined
      );
      console.log("STEP 0: ElevenLabs TTS done");
    }

    const imageBuffer = Buffer.from(imageBase64, "base64");

    updateAvatarJob(jobId, {
      status: "processing",
      progress: "Uploading image to Hedra",
    });

    console.log("STEP 1: Hedra IMAGE asset");

    const imageAssetId = await hedraCreateAsset({
      name: "avatar.jpg",
      type: "image",
    });

    await hedraUploadAsset({
      assetId: imageAssetId,
      fileBuffer: imageBuffer,
      fileName: "avatar.jpg",
      mimeType: "image/jpeg",
    });

    updateAvatarJob(jobId, {
      status: "processing",
      progress: "Uploading audio to Hedra",
    });

    console.log("STEP 2: Hedra AUDIO asset");

    const audioAssetId = await hedraCreateAsset({
      name: finalAudioFileName,
      type: "audio",
    });

    await hedraUploadAsset({
      assetId: audioAssetId,
      fileBuffer: finalAudioBuffer,
      fileName: finalAudioFileName,
      mimeType: finalAudioMimeType,
    });

    updateAvatarJob(jobId, {
      status: "processing",
      progress: "Generating motion in Runway",
    });

    console.log("STEP 3: Runway motion");

    const imageDataUri = `data:image/jpeg;base64,${imageBase64}`;

   const runwayPrompt = `
${String(avatarVisualPrompt || "").trim()}

Natural speaking avatar.
${String(avatarPrompt || "").trim()}
`.trim();

const runwayTask = await runway.imageToVideo
  .create({
    model: "gen4.5",
    promptImage: imageDataUri,
    promptText: runwayPrompt || "Natural speaking avatar",
    ratio: "720:1280",
    duration: 5,
  })
      .waitForTaskOutput();

    const runwayVideoUrl = normalizeRunwayOutput(runwayTask);

    console.log("STEP 3.1: Runway video URL =", runwayVideoUrl);

    if (!runwayVideoUrl) {
      throw new Error("Runway motion failed");
    }

    updateAvatarJob(jobId, {
      status: "processing",
      progress: "Generating lip sync in Hedra",
    });

    console.log("STEP 4: Hedra lipsync");

    const videoGenId = await hedraCreateAvatarTalkingVideo({
      imageAssetId,
      audioAssetId,
      motionVideoUrl: runwayVideoUrl,
    });

    console.log("STEP 4.1: Hedra generation id =", videoGenId);

    const videoResult = await hedraPollGenerationResult(videoGenId);

    let videoUrl =
      videoResult?.url ||
      videoResult?.video_url ||
      videoResult?.download_url ||
      videoResult?.streaming_url ||
      videoResult?.asset?.url ||
      videoResult?.asset?.download_url ||
      videoResult?.result?.url ||
      null;

    const finalAssetId =
      videoResult?.asset_id ||
      videoResult?.id ||
      videoResult?.asset?.id ||
      null;

    if (!videoUrl && finalAssetId) {
      videoUrl = await hedraGetAssetDownloadUrl(finalAssetId);
    }

    if (!videoUrl) {
      console.log("❌ Avatar final result:", JSON.stringify(videoResult, null, 2));
      throw new Error("Hedra did not return videoUrl");
    }
   
    console.log("🎬 Applying avatar watermark...");

const videoBuffer = await fetch(videoUrl).then(r => r.buffer());

const inputPath = path.join(TEMP_DIR, `avatar_${Date.now()}.mp4`);
const outputPath = path.join(VIDEOS_DIR, `avatar_wm_${Date.now()}.mp4`);

fs.writeFileSync(inputPath, videoBuffer);


const filters = isPremium
  ? []
  : [
      {
        filter: "drawtext",
        options: {
          text: "JenesisAI",
          fontcolor: "white@0.5",
          fontsize: "h/20",
          x: "(w-text_w)/2",
          y: "(h-text_h)*0.9",
          shadowcolor: "black",
          shadowx: 2,
          shadowy: 2,
        },
      },
    ];
await new Promise((resolve, reject) => {
  ffmpeg(inputPath)
  .videoFilters(filters)
  .save(outputPath)
    .on("end", resolve)
    .on("error", reject);
});
try { fs.unlinkSync(inputPath); } catch {}

const finalUrl = `${process.env.BASE_URL || "https://injurable-giavanna-purselike.ngrok-free.dev"}/videos/${path.basename(outputPath)}`;



    console.log("✅ Avatar final video ready:", finalUrl);
  } catch (err: any) {
    console.error("Speaking avatar job error:", err);

    updateAvatarJob(jobId, {
      status: "failed",
      progress: "Failed",
      error: stringifyUnknownError(err),
    });
  }
}

/* ================== STABILITY stabillity cards ================== */
async function preprocessUserImage(buffer: Buffer) {
  return await sharp(buffer)
    .rotate()
    .resize(1024, 1820, { 
      fit: "inside", 
      withoutEnlargement: true 
    }) // Mantiene il formato verticale senza tagliare
    .jpeg({ quality: 95 })
    .toBuffer();
}

async function extractFace(buffer: Buffer) {
  return await sharp(buffer)
    .rotate()
    .resize(512, 512, { fit: "cover" })
    .normalise() // 🔥 bilancia luci
    .sharpen()   // 🔥 migliora dettagli
    .jpeg({ quality: 100 })
    .toBuffer();
}

async function matchColorToTemplate(faceBuffer: Buffer, templateBuffer: Buffer) {
  const templateStats = await sharp(templateBuffer).stats();

  return await sharp(faceBuffer)
    .modulate({
      brightness: templateStats.channels[0].mean / 128,
      saturation: 1.05,
    })
    .toBuffer();
}

/* ================== funzione FACESWAP ================== */
async function faceSwapWithTemplate(opts: {
  userFace: Buffer;
  templateBuffer: Buffer;
}) {
  const apiKey = requireEnv("STABILITY_API_KEY");

  const form = new FormData();

  // TEMPLATE = BASE
  form.append("image", opts.templateBuffer, {
    filename: "template.jpg",
    contentType: "image/jpeg",
  });

  // 👇 QUESTO È IL SEGRETO
 form.append("prompt", `
Replace ONLY the face in this image.

Keep EXACTLY:
- same body
- same outfit
- same pose
- same background
- same lighting
- same composition
Use the face from the identity image.

Ultra realistic face blending.

The face must:
- perfectly match skin tone of the scene
- match lighting direction
- match shadows and highlights
- blend seamlessly into the head

Ultra realistic skin blending.
No visible edges.
No artifacts.
No effects AI
`);

  form.append("negative_prompt", `
different clothes, different background, different pose, multiple faces, distorted face
`);

  form.append("strength", "0.2");

  const resp = await fetch(
    "https://api.stability.ai/v2beta/stable-image/generate/core",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        ...form.getHeaders(),
      },
      body: form as any,
    }
  );

  const data = await resp.json();

  const base64 =
    data?.image ||
    data?.artifacts?.[0]?.base64 ||
    data?.images?.[0]?.base64;

  if (!base64) throw new Error("Face swap failed");

  return Buffer.from(base64, "base64");
}

/* ================== STABILITY stabillity calcio ================== */
async function generateStabilityImage(opts: {
  promptText: string;
  style?: string;
  ratio?: string;
  resolution?: string;
}) {
  const { promptText, style = "photorealistic", ratio = "9:16" } = opts;

  const STABILITY_API_KEY = requireEnv("STABILITY_API_KEY");

  const form = new FormData();
  form.append("prompt", String(promptText));
  form.append("output_format", "jpeg");
  form.append("aspect_ratio", toStabilityAspectRatio(String(ratio)));

  const preset = styleToPreset(String(style ?? ""));
  if (preset) form.append("style_preset", preset);

  const resp = await fetch(
    "https://api.stability.ai/v2beta/stable-image/generate/sd3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STABILITY_API_KEY}`,
        Accept: "application/json",
        ...form.getHeaders(),
      },
      body: form as any,
    }
  );

  const text = await resp.text();

  if (!resp.ok) {
    console.log("❌ Stability TEXT2IMG status:", resp.status);
    console.log("❌ Stability TEXT2IMG body:", text);
    throw new Error(`Stability error ${resp.status}: ${text}`);
  }

  const result = safeJsonParse(text);
  if (!result) {
    throw new Error("Stability: risposta non JSON");
  }

  const base64 = pickBase64(result);
  if (!base64) {
    console.log("❌ Stability TEXT2IMG JSON:", result);
    throw new Error("Stability: nessuna immagine trovata nella risposta");
  }

  return {
    imageUrl: `data:image/jpeg;base64,${base64}`,
  };
}
/* ================== FUNZIONE UPSCALE ================== */
async function upscaleImage(buffer: Buffer): Promise<Buffer> {
  const apiKey = requireEnv("STABILITY_API_KEY");

  const form = new FormData();
  form.append("image", buffer, {
    filename: "image.jpg",
    contentType: "image/jpeg",
  });

  form.append("output_format", "jpeg");

  const resp = await fetch(
    "https://api.stability.ai/v2beta/stable-image/upscale/creative",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        ...form.getHeaders(),
      },
      body: form as any,
    }
  );

  const text = await resp.text();
  const data = safeJsonParse(text);

  if (!resp.ok) {
    console.log("❌ Upscale error:", text);
    throw new Error("Upscale failed");
  }

  const base64 =
    data?.image ||
    data?.artifacts?.[0]?.base64 ||
    data?.images?.[0]?.base64;

  if (!base64) {
    console.log("❌ Upscale response:", data);
    throw new Error("Upscale no image");
  }

  return Buffer.from(base64, "base64");
}
/* ================== STABILITY TEXT → IMAGE ================== */
app.post("/generate-image", async (req, res) => {
  try {
    const isPremium =
      req.body?.isPremium === "true" || req.body?.isPremium === true;

    const { promptText, style, ratio, resolution } = req.body ?? {};

    if (!promptText || !ratio) {
      return res.status(400).json({
        error: "promptText o ratio mancanti",
      });
    }

    // 📐 RATIO MAP
    const ratioPromptMap: any = {
      "9:16": "vertical image, portrait orientation, full body framing",
      "1:1": "square image, centered composition",
      "16:9": "wide cinematic image, landscape orientation",
      "3:4": "portrait image, classic photography ratio",
      "4:3": "horizontal photography, balanced composition",
      "2:3": "portrait photography, DSLR ratio",
    };

    // 🧠 BASE PROMPT
    let finalPrompt = String(promptText);

 if (resolution === "2k" && isPremium) {
  finalPrompt += `

ULTRA PREMIUM MODE:
- hyper realistic photography
- insane level of detail
- ultra sharp 8k textures
- cinematic lighting like a movie scene
- volumetric light, depth of field
- professional color grading (Hollywood look)
- skin micro details, pores, fine imperfections
- realistic reflections and shadows
- global illumination
- perfect exposure balance

This MUST look like a high-end professional photo, not AI.
`;
}
    // 🎯 STYLE
    if (style === "photorealistic") {
      finalPrompt += `

Ultra high-end realistic photography.

STRICT RULES:
- must look like a REAL photo taken with a camera
- NOT a 3D render
- NOT a cartoon
- NOT Pixar style
- NOT animated
- NOT CGI

If subject is person:
-real human skin texture
- pores, imperfections, natural asymmetry
- natural lighting, cinematic shadows
- 85mm lens, DSLR portrait
- realistic face details (NO smooth skin)
- realistic eyes (no cartoon eyes)


If subject is animal:
- real anatomy
- real fur
- correct proportions
- real animal anatomy
- natural fur, NOT stylized
- correct proportions
- realistic eyes (NOT oversized)

If the subject is an object:
- professional product photography
- studio lighting, soft shadows
- ultra realistic materials
- sharp details

Global rules:
- no AI look
- no plastic skin
- shot on Canon EOS R5
- high dynamic range
- cinematic color grading
- no over-smoothing
`;
    }

    // 📐 RATIO
    finalPrompt += `
${ratioPromptMap?.[ratio] || ""}
`;

    // 🔥 REFINEMENT
    finalPrompt += `

ULTRA QUALITY REFINEMENT
IMPORTANT:
- if animal is requested → NEVER generate a human
- preserve animal identity strictly
- ultra sharp focus
- extremely detailed textures
- realistic lighting and shadows
- no blur, no distortion
- no artifacts
- perfect anatomy
- real photography look

NEGATIVE:
cartoon, 3d render, cgi, pixar, disney, toy, plastic, fake, anime, big eyes, stylized, low quality, blurry

DO NOT look like AI generated.
`;

if (style === "cartoon") {
  finalPrompt += `

Cartoon / animated style illustration.

STYLE RULES:
- stylized character
- smooth skin
- clean outlines
- vibrant colors
- soft shading
- slightly exaggerated features
- big expressive eyes
- perfect symmetry

REFERENCES:
- Pixar style
- Disney style
- animated movie character

QUALITY:
- ultra clean render
- no realism
- no skin texture
- no pores
- no camera look

NEGATIVE:
realistic, photo, DSLR, skin texture, pores, noise
`;
}
    // 🔥 BLOCCO PREMIUM
    const finalResolution =
      resolution === "2k" && isPremium ? "2k" : "1k";

    if (resolution === "2k" && !isPremium) {
      return res.status(403).json({
        error: "Ultra HD solo PRO",
      });
    }

    // 🎯 GENERAZIONE
    const result = await generateStabilityImage({
      promptText: finalPrompt,
      style: String(style ?? "photorealistic"),
      ratio: String(ratio),
      resolution: String(finalResolution),
    });

// 🧠 BUFFER
let buffer = Buffer.from(
  result.imageUrl.split(",")[1],
  "base64"
) as Buffer;

// ⭐ SOLO PRO → UPSCALE
if (resolution === "2k" && isPremium) {
  buffer = await upscaleImage(buffer);
}

// 🎯 DIFFERENZA QUALITÀ
if (isPremium) {
  buffer = await sharp(buffer)
    .jpeg({ quality: 100 }) // 🔥 PRO
    .sharpen(1.5)
    .toBuffer();
} else {
  buffer = await sharp(buffer)
    .jpeg({ quality: 75 }) // 👈 FREE
    .blur(0.3)
    .toBuffer();
}

// 💧 WATERMARK
const finalBuffer = isPremium
  ? buffer
  : await applyWatermarkToBuffer(buffer);

return res.json({
  imageUrl: `data:image/jpeg;base64,${finalBuffer.toString("base64")}`,
});

  } catch (err: any) {
    console.log("❌ Errore generate-image:", err?.message || err);

    return res.status(500).json({
      error: err?.message || "Errore interno server",
    });
  }
});

/* ================== RUNWAY IMAGE → VIDEO ================== */
app.post("/api/runway/image-to-video", upload.single("image"), async (req: any, res) => {
  try {
    console.log("IS PREMIUM:", req.body.isPremium);

    const isPremium =
      req.body?.isPremium === "true" || req.body?.isPremium === true;

    // 🔥 QUALITY
    const { quality } = req.body;
    const isUltra = quality === "ultra";

    console.log("📦 FILE:", req.file);
    console.log("REQ.FILE:", req.file);

    if (!req.file || !req.file.buffer) {
  console.log("❌ FILE NON ARRIVATO");
  return res.status(400).json({ error: "Missing image file" });
}

    const prompt = String(req.body?.prompt ?? "Animate this image naturally");
    const ratio = toRunwayRatio(String(req.body?.ratio ?? "720:1280"));
    const durationRaw = Number(req.body?.duration ?? 5);
    const duration = durationRaw === 10 ? 10 : 5;

    console.log("🎬 Runway start image-to-video...");
    console.log("ratio:", ratio);
    console.log("duration:", duration);
    console.log("QUALITY:", quality);

    const mimeType = req.file.mimetype || "image/jpeg";
    const dataUri = bufferToDataUri(req.file.buffer, mimeType);

    // 🚀 GENERAZIONE VIDEO
    const task = await runway.imageToVideo
      .create({
        model: "gen4.5",
        promptImage: dataUri,
        promptText: prompt,
        ratio,
        duration,
      })
      .waitForTaskOutput();

    const videoUrl = normalizeRunwayOutput(task);

    if (!videoUrl) {
      console.log("❌ Runway task output:", task);
      return res.status(500).json({
        error: "Runway non ha restituito un videoUrl valido",
      });
   }

    console.log("🎬 Processing video...");

    // 📥 scarica video
    const videoBuffer = await fetch(videoUrl).then((r) => r.buffer());

     //📁 path
    const inputPath = path.join(TEMP_DIR, `runway_${Date.now()}.mp4`);
    const outputPath = path.join(VIDEOS_DIR, `runway_wm_${Date.now()}.mp4`);

    fs.writeFileSync(inputPath, videoBuffer);

    let processedInput = inputPath;

    // 💧 WATERMARK SOLO FREE
    const filters = isPremium
      ? []
      : [
          {
            filter: "drawtext",
            options: {
              text: "JenesisAI",
              fontcolor: "white@0.5",
              fontsize: "h/20",
              x: "(w-text_w)/2",
              y: "(h-text_h)*0.9",
              shadowcolor: "black",
              shadowx: 2,
              shadowy: 2,
            },
          },
        ];

        const filterString = isPremium
  ? null
  : "drawtext=text='JenesisAI':fontcolor=white@0.5:fontsize=40:x=(w-text_w)/2:y=h-60:shadowcolor=black:shadowx=2:shadowy=2";

     //🎬 FFMPEG (QUALITÀ REALE)
   await new Promise((resolve, reject) => {
  const command = ffmpeg(processedInput)
    .outputOptions([
      "-c:v libx264",
      isUltra ? "-crf 16" : "-crf 23",
      "-preset slow",
      "-pix_fmt yuv420p",
    ]);

  if (filterString) {
    command.videoFilters(filterString);
  }

  command
    .save(outputPath)
    .on("end", resolve)
    .on("error", reject);
});

    // 🧹 cleanup
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(processedInput); } catch {}

    const finalUrl = `${getPublicBaseUrl(req)}/videos/${path.basename(outputPath)}`;

    console.log("✅ Runway video pronto");

    return res.json({
      videoUrl: finalUrl,
      taskId: task?.id ?? null,
    });

  } catch (err: any) {
  console.error("💥 RUNWAY ERROR:", err);

  // 🔥 gestione intelligente errori
let errorType = "GENERIC";

if (err?.message?.includes("credit") || err?.message?.includes("quota")) {
  errorType = "NO_CREDITS";
}

res.status(500).json({
  error: errorType,
  message: err?.message,
});
}
});

/* ================== HEDRA VOICES ================== */
app.get("/api/hedra/voices", async (_req, res) => {
  try {
    const apiKey = requireEnv("HEDRA_API_KEY");

    const resp = await fetch("https://api.hedra.com/web-app/public/voices", {
      headers: {
        "X-API-Key": apiKey,
      },
    });

    const text = await resp.text();
    const data = safeJsonParse(text);

    if (!resp.ok) {
      console.log("❌ Hedra voices raw error:", text);
      return res.status(resp.status).json({
        error:
          data?.messages?.[0] ||
          data?.message ||
          `Hedra voices error ${resp.status}`,
      });
    }

    const voices = Array.isArray(data)
      ? data.map((v: any) => ({
          id: v.id,
          name: v.name,
          preview_url: v.asset?.preview_url || null,
        }))
      : [];

    return res.json({ voices });

  } catch (err: any) {
    console.error("❌ Hedra voices error:", err);
    return res.status(500).json({ error: err?.message });
  }
});

/* -------------------NUOVA ROUTE per image-video--------------*/
app.post("/generate-motion-speaking-video", upload.single("image"), async (req: any, res) => {
  try {
    console.log("BODY:", req.body);

    const isPremium = req.body?.isPremium === "true" || req.body?.isPremium === true;
    const prompt = String(req.body?.actionPrompt || "Animate naturally");
    const speech = String(req.body?.speechText || "");
    const voiceId = String(req.body?.voiceId || "");
    
    console.log("VOICE ID:", voiceId);
    console.log("SPEECH:", speech);
    
    if (!speech || speech.trim().length < 2) {
  return res.status(400).json({
    error: "speechText vuoto"
  });
}

if (!voiceId) {
  return res.status(400).json({
    error: "voiceId mancante"
  });
}

    if (!req.file?.buffer) {
      return res.status(400).json({ error: "Missing image" });
    }

    /* STEP 1 — Runway motion */
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const runwayTask = await runway.imageToVideo.create({
      model: "gen4.5",
      promptImage: dataUri,
      promptText: prompt,
      ratio: "720:1280",
      duration: 5,
    }).waitForTaskOutput();

    const videoUrl =
      (Array.isArray((runwayTask as any).output)
        ? ((runwayTask as any).output[0]?.url || (runwayTask as any).output[0])
        : null) ||
      (runwayTask as any).videoUrl ||
      null;

    if (!videoUrl) {
      throw new Error("Runway video generation failed");
    }

    /* STEP 2 — Hedra voice */
    const audioGenId = await hedraGenerateAudio({
      text: speech,
      voiceId,
    });

    const audioResult = await hedraPollGenerationResult(audioGenId);

    console.log("✅ HEDRA AUDIO RESULT:");
    console.log(JSON.stringify(audioResult, null, 2));

    let audioUrl =
      audioResult?.url ||
      audioResult?.audio_url ||
      audioResult?.download_url ||
      audioResult?.streaming_url ||
      audioResult?.asset?.url ||
      audioResult?.asset?.download_url ||
      audioResult?.result?.url ||
      null;

    if (!audioUrl) {
      const audioAssetId =
        audioResult?.asset_id ||
        audioResult?.asset?.id ||
        null;

      if (!audioAssetId) {
        throw new Error("Audio generation failed: no audioUrl and no asset_id");
      }

      audioUrl = await hedraGetAssetDownloadUrl(audioAssetId);

      if (!audioUrl) {
        throw new Error("Audio generation failed: Hedra did not return audioUrl");
      }

      console.log("✅ HEDRA AUDIO FALLBACK URL:", audioUrl);
    }

    /* STEP 3 — download video + audio */
    const videoPath = path.join(TEMP_DIR, `video_${Date.now()}.mp4`);
    const audioPath = path.join(TEMP_DIR, `audio_${Date.now()}.mp3`);
    const outputPath = path.join(VIDEOS_DIR, `final_${Date.now()}.mp4`);

    const videoBuffer = await fetch(videoUrl).then((r) => r.buffer());
    const audioBuffer = await fetch(audioUrl).then((r) => r.buffer());

    fs.writeFileSync(videoPath, videoBuffer);
    fs.writeFileSync(audioPath, audioBuffer);
    
    const filters = isPremium
  ? []
  : [
      {
        filter: "drawtext",
        options: {
          text: "JenesisAI",
          fontcolor: "white@0.5",
          fontsize: "h/20",
          x: "(w-text_w)/2",
          y: "(h-text_h)*0.9",
          shadowcolor: "black",
          shadowx: 2,
          shadowy: 2,
        },
      },
    ];
    /* STEP 4 — merge audio + video */
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(audioPath)
        .videoFilters(filters)
        .outputOptions("-shortest")
        .save(outputPath)
        .on("end", resolve)
        .on("error", reject);
    });
   try { fs.unlinkSync(videoPath); } catch {}
   try { fs.unlinkSync(audioPath); } catch {}

    const finalUrl = `${getPublicBaseUrl(req)}/videos/${path.basename(outputPath)}`; 
    console.log("✅ FINAL VIDEO URL:", finalUrl);
    return res.json({ videoUrl: finalUrl });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});
/* ================== TALKING PHOTO ================== */
app.post("/generate-talking-photo", async (req, res) => {
  try {
    const { imageBase64, script, voiceId, audioBase64 } = req.body ?? {};

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image" });
    }

    if (!script && !audioBase64) {
      return res.status(400).json({
        error: "Missing script or audioBase64",
      });
    }

    console.log("🗣️ Hedra talking photo start");

    const imageAssetId = await hedraCreateAsset({
      name: "talking.jpg",
      type: "image",
    });

    await hedraUploadAsset({
      assetId: imageAssetId,
      fileBuffer: Buffer.from(imageBase64, "base64"),
      fileName: "talking.jpg",
      mimeType: "image/jpeg",
    });

    let finalAudioAssetId: string | undefined;

    if (audioBase64) {
      console.log("🎤 Uploading user audio...");

      const uploadedAudioAssetId = await hedraCreateAsset({
        name: "voice.mp3",
        type: "audio",
      });

      await hedraUploadAsset({
        assetId: uploadedAudioAssetId,
        fileBuffer: Buffer.from(audioBase64, "base64"),
        fileName: "voice.mp3",
        mimeType: "audio/mpeg",
      });

      finalAudioAssetId = uploadedAudioAssetId;
      console.log("✅ User audio uploaded:", finalAudioAssetId);
    } else {
      if (!voiceId) {
        return res.status(400).json({ error: "Missing voiceId" });
      }

      const audioGenId = await hedraGenerateAudio({
        text: String(script).slice(0, 300),
        voiceId,
      });

      const audioResult = await hedraPollGenerationResult(audioGenId);

      const generatedAudioAssetId =
        audioResult?.asset_id ||
        audioResult?.id ||
        audioResult?.asset?.id ||
        null;

      if (!generatedAudioAssetId) {
        console.log(
          "❌ Hedra audio result:",
          JSON.stringify(audioResult, null, 2)
        );
        throw new Error("Hedra audio asset_id mancante");
      }

      finalAudioAssetId = generatedAudioAssetId;
    }

    if (!finalAudioAssetId) {
      throw new Error("Audio asset finale mancante");
    }

    const videoGenId = await hedraCreateTalkingVideo({
      imageAssetId,
      audioAssetId: finalAudioAssetId,
    });

    const videoResult = await hedraPollGenerationResult(videoGenId);

    let videoUrl =
      videoResult?.url ||
      videoResult?.video_url ||
      videoResult?.download_url ||
      videoResult?.streaming_url ||
      videoResult?.asset?.url ||
      videoResult?.asset?.download_url ||
      videoResult?.result?.url ||
      null;

    const finalAssetId =
      videoResult?.asset_id ||
      videoResult?.id ||
      videoResult?.asset?.id ||
      null;

    if (!videoUrl && finalAssetId) {
      console.log("ℹ️ Trying Hedra asset lookup with assetId:", finalAssetId);
      videoUrl = await hedraGetAssetDownloadUrl(finalAssetId);
    }

    if (!videoUrl) {
      console.log(
        "❌ Hedra video result without URL:",
        JSON.stringify(videoResult, null, 2)
      );
      throw new Error("Hedra non ha restituito videoUrl");
    }

    console.log("✅ Hedra talking photo ready:", videoUrl);

    return res.json({ videoUrl });
  } catch (err: any) {
    console.error("❌ Talking photo error:", err);
    return res.status(500).json({ error: stringifyUnknownError(err) });
  }
})
/* ================== ROUTE AVATAR ================== */
app.post("/generate-avatar", async (req, res) => {
  try {
    const isPremium = req.body?.isPremium === "true" || req.body?.isPremium === true;
    const {
      imageBase64,
      avatarAction,
      avatarStyle,
      avatarMode,
      avatarInputType,
      avatarPreset,
    } = req.body;

    console.log("🔥 /generate-avatar HIT");
    console.log("BODY KEYS:", Object.keys(req.body || {}));
    console.log("BASE64 LENGTH:", req.body?.imageBase64?.length || 0);

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image" });
    }

    if (!avatarAction) {
      return res.status(400).json({ error: "Missing avatar action" });
    }

    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
    const prompt = `
Create a vertical TikTok style talking avatar video.

Action:
${avatarAction}

Style:
${avatarStyle === "3d" ? "3D animated avatar" : "2D animated avatar"}

Natural speaking, expressive gestures, short viral style video.
`;

    console.log("🚀 Runway avatar create START");

    const createdTask: any = await runway.imageToVideo.create({
      model: "gen4.5",
      promptImage: imageUrl,
      promptText: prompt,
      ratio: "720:1280",
      duration: 5,
    });

    console.log("✅ Runway task created:", createdTask.id);

    const finishedTask: any = await runway.tasks
      .retrieve(createdTask.id)
      .waitForTaskOutput();

    console.log("✅ Runway task finished");

    const videoUrl =
      (Array.isArray(finishedTask?.output)
        ? finishedTask.output[0]?.url || finishedTask.output[0]
        : null) ||
      finishedTask?.videoUrl ||
      null;

    if (!videoUrl) {
      console.log("❌ finishedTask:", finishedTask);
      return res.status(500).json({ error: "Video generation failed" });
    }

    return res.json({ videoUrl });
  } catch (err: any) {
    console.error("Avatar error:", err);
    return res.status(500).json({ error: err?.message || "Avatar generation failed" });
  }
});

/* ============= AVATAR JOB START ============ */
app.post("/generate-speaking-avatar", async (req, res) => {
  const isPremium = req.body?.isPremium === "true" || req.body?.isPremium === true;
  try {
   const {
  imageBase64,
  avatarPrompt,
  avatarVisualPrompt,
  voiceMode,
  voiceId,
  recordedAudioBase64,
} = req.body ?? {};

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image" });
    }

    if (!avatarPrompt?.trim() && voiceMode !== "my_voice" && voiceMode !== "clone") {
      return res.status(400).json({ error: "Missing avatar prompt" });
    }

    if ((voiceMode === "my_voice" || voiceMode === "clone") && !recordedAudioBase64) {
      return res.status(400).json({ error: "Missing recorded audio" });
    }

    const job = createAvatarJob();

    res.json({
      ok: true,
      jobId: job.id,
      status: job.status,
    });

    void runAvatarJob(job.id, {
  imageBase64,
  avatarPrompt,
  avatarVisualPrompt,
  voiceMode,
  voiceId,
  recordedAudioBase64,
  isPremium,
});

  } catch (err: any) {
    return res.status(500).json({
      error: stringifyUnknownError(err),
    });
  }
});

/* ============= AVATAR JOB STATUS ============ */
app.get("/avatar-job/:jobId", async (req, res) => {
  try {
    const jobId = String(req.params.jobId || "");
    const job = avatarJobs.get(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json(job);
  } catch (err: any) {
    return res.status(500).json({
      error: stringifyUnknownError(err),
    });
  }
});

/* ================== ROUTE VOCI ELEVENLABS ================== */
app.get("/api/elevenlabs/voices", async (_req, res) => {
  
  try {
    const apiKey = requireEnv("ELEVENLABS_API_KEY");

    const resp = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": apiKey,
      },
    });

    const text = await resp.text();
    const data = safeJsonParse(text);

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: data?.detail?.message || data?.message || "ElevenLabs voices error",
      });
    }

    const voices = Array.isArray(data?.voices)
      ? data.voices.map((v: any) => ({
          id: v.voice_id,
          name: v.name,
          preview_url: v.preview_url || null,
        }))
      : [];

    return res.json({ voices });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Errore interno server" });
  }
});

/* ================== ROUTE elevenlabs clone VOCI  ================== */
app.post("/api/elevenlabs/clone-voice", async (req, res) => {
  try {
    const isPremium = req.body?.isPremium === "true" || req.body?.isPremium === true;
    const {
      recordedAudioBase64,
      recordedAudioMimeType,
      voiceName,
    } = req.body ?? {};

    if (!recordedAudioBase64) {
      return res.status(400).json({ error: "Missing recordedAudioBase64" });
    }

    const buffer = Buffer.from(recordedAudioBase64, "base64");

    const mimeType = recordedAudioMimeType || "audio/mp4";

    const extension =
      mimeType.includes("wav")
        ? "wav"
        : mimeType.includes("mpeg")
        ? "mp3"
        : "m4a";

    const cloned = await elevenCloneVoice({
      name: voiceName || `My Voice ${Date.now()}`,
      audioBuffer: buffer,
      fileName: `voice_sample.${extension}`,
      mimeType,
      description: "Voice clone from app",
    });

    return res.json({
      ok: true,
      voiceId: cloned.voiceId,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: stringifyUnknownError(err),
    });
  }
});

app.get("/api/elevenlabs/my-voices", async (_req, res) => {
  try {
    const voices = await elevenGetUserVoices();

    const cloned = voices.filter(
      (v: any) =>
        v.category === "cloned" ||
        v.category === "generated" ||
        v.category === "professional"
    );

    return res.json({ voices: cloned });
  } catch (err: any) {
    return res.status(500).json({
      error: stringifyUnknownError(err),
    });
  }
});

/* ================== ROUTE effetti per cards photo ================== */
app.post("/ai-photos/generate", async (req, res) => {
  try {
    const { imageBase64, templateKey } = req.body as {
      imageBase64: string;
      templateKey: string;
    };

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image" });
    }

    if (!templateKey) {
      return res.status(400).json({ error: "Missing templateKey" });
    }

    // 🔥 convert base64 → buffer
    const userBuffer = Buffer.from(imageBase64, "base64");

    // 🔥 templates
    const templates = getTemplates(templateKey);

    const results: string[] = [];

    for (const templatePath of templates) {
      console.log("➡️ TEMPLATE:", templatePath);

      const swapped = await swapFace(templatePath, userBuffer);

      console.log("✅ SWAP DONE:", templatePath);

      results.push(swapped);
    }

    return res.json({ images: results });

  } catch (err: any) {
    console.error("❌ AI PHOTOS ERROR:", err);

    return res.status(500).json({
      error: err?.message || "AI Photos failed",
    });
  }
});

function getTemplates(templateKey: string) {
  const basePath = path.join(
    process.cwd(),
    "backend/src/assets/style-templates",
    templateKey
  );

  return [
    path.join(basePath, "autunno1.jpg"),
    path.join(basePath, "autunno2.jpg"),
    path.join(basePath, "autunno3.jpg"),
    path.join(basePath, "autunno4.jpg"),
  ];
}
/* ================== ROUTE AI EFFECTS ================== */
app.post("/effects/generate", async (req, res) => {
  try {
    const isPremium = req.body?.isPremium === "true" || req.body?.isPremium === true;
    console.log("EFFECTS ROUTE START");

    const { imageBase64, effect } = req.body ?? {};

    console.log("EFFECTS imageBase64 =", imageBase64 ? "OK" : "MISSING");
    console.log("EFFECTS effect =", effect);

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64" });
    }

    if (!effect) {
      return res.status(400).json({ error: "Missing effect" });
    }
   
const prompt = req.body.prompt || "";

const finalPrompt = `
Keep the same person, same face identity.

Apply this style:
${prompt}

IMPORTANT:
- The face must remain ultra realistic and identical
- Natural skin texture, real human face
- No distortion, no fake AI look
- cinematic camera, depth of field, 35mm lens

The environment and outfit must follow the style (${effect})
with strong cinematic impact, dramatic lighting, high detail.
`;
   const finalImageUrl = await restyleImage(
  String(imageBase64),
  finalPrompt
);
   const buffer = await downloadToBuffer(finalImageUrl);

   const finalBuffer = isPremium
  ? buffer
  : await applyWatermarkToBuffer(buffer);

return res.json({
  imageUrl: `data:image/jpeg;base64,${finalBuffer.toString("base64")}`,
});

  } catch (err: any) {
    console.error("EFFECTS ROUTE ERROR =", err);
    return res.status(500).json({
      error: err?.message || "Effects generation failed",
    });
  }
});
/* ================== STYLE CARDS PRO (EXPLORER) ================== */
// memoria jobs
const styleCardJobs = new Map();

/* ===== START JOB ===== */
app.post("/style-cards/start", upload.single("image"), async (req: any, res) => {
  try {
 const isPremium = req.body?.isPremium === "true" || req.body?.isPremium === true;
  console.log("FILE:", req.file);
  console.log("BODY:", req.body);

const templateKey = req.body?.templateKey;

if (!req.file) {
  return res.status(400).json({
    error: "file non ricevuto",
  });
}

if (!templateKey || templateKey === "undefined") {
  return res.status(400).json({
    error: "templateKey mancante",
    body: req.body,
  });
}  

    if (!req.file?.buffer) {
      return res.status(400).json({ error: "Missing image file" });
    }

    const jobId = createJobId();

    styleCardJobs.set(jobId, {
      status: "processing",
      images: [],
      error: null,
    });

    // 🚀 async (NON blocca)
    processStyleCardsJob(jobId, req.file.buffer, templateKey, isPremium);

    return res.json({ jobId });
  } catch (e) {
    return res.status(500).json({ error: "Errore start job" });
  }
});

/* ===== STATUS ===== */
app.get("/style-cards/status/:jobId", (req, res) => {
  const job = styleCardJobs.get(req.params.jobId);
  console.log("STATUS CHECK:", req.params.jobId, job?.status);

  if (!job) {
    return res.status(404).json({ error: "Job non trovato" });
  }

  return res.json(job);
});

/* ===== PROCESS JOB CORRETTO explorer ===== */
async function processStyleCardsJob(
  jobId: string,
  userBuffer: Buffer,
  templateKey: string,
  isPremium: boolean
) {
  try {
    console.log("🎯 STYLE CARDS JOB START:", jobId);

    // 1. Mappa i template in base alla chiave che arriva dal front-end
    const templateFolder = path.join(__dirname, "assets", "style-templates", templateKey);
    
    // Controlla se la cartella esiste, altrimenti usa una di fallback
    if (!fs.existsSync(templateFolder)) {
       throw new Error(`Cartella template non trovata: ${templateFolder}`);
    }

    const files = fs.readdirSync(templateFolder).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    const templatePaths = files.map(f => path.join(templateFolder, f)).slice(0, 4); // Prendi i primi 4

    const finalImagesBase64: string[] = [];

    for (const templatePath of templatePaths) {
      console.log("➡️ Elaborazione Face Swap su:", templatePath);
      
      // USA FAL AI (swapFace) - È IL PIÙ VELOCE E PRECISO PER I CONNOTATI
      const swappedUrl = await swapFace(templatePath, userBuffer);
      
      // Scarica il risultato per applicare post-processing o watermark
      const swappedBuffer = await downloadToBuffer(swappedUrl);

      // Migliora leggermente la qualità (Sharp)
      const refinedBuffer = await sharp(swappedBuffer)
        .modulate({ brightness: 1.05, saturation: 1.1 })
        .sharpen()
        .jpeg({ quality: 90 })
        .toBuffer();

      // Applica Watermark se non premium
      const finalBuf = isPremium ? refinedBuffer : await applyWatermarkToBuffer(refinedBuffer);

      finalImagesBase64.push(`data:image/jpeg;base64,${finalBuf.toString("base64")}`);
    }

    // Aggiorna lo stato del Job
    styleCardJobs.set(jobId, {
      status: "complete",
      images: finalImagesBase64,
      error: null,
    });

  } catch (e: any) {
    console.error("❌ STYLE CARDS ERROR:", e);
    styleCardJobs.set(jobId, {
      status: "failed",
      images: [],
      error: e.message,
    });
  }
}
/* ================== CALCIO GENERATE ================== */
app.post("/calcio/generate", upload.single("image"), async (req: any, res) => {
  try {
    const isPremium = req.body?.isPremium === "true" || req.body?.isPremium === true;
    console.log("⚽ /calcio/generate HIT");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file ? "OK" : "MISSING");

    const archetypeKey = String(req.body?.archetypeKey || "");
    const scene = String(req.body?.scene || "");

    if (!req.file?.buffer) {
      return res.status(400).json({ error: "Missing image file" });
    }

    if (!archetypeKey) {
      return res.status(400).json({ error: "Missing archetypeKey" });
    }

    if (!scene) {
      return res.status(400).json({ error: "Missing scene" });
    }

    if (!["campo", "tunnel", "panchina"].includes(scene)) {
      return res.status(400).json({ error: "Invalid scene" });
    }

    const archetype = CALCIO_ARCHETYPES_MAP[archetypeKey];

    if (!archetype) {
      return res.status(404).json({ error: "Archetype not found" });
    }

    const sceneKey = scene as CalcioSceneKey;
    const scenePrompt = archetype.scenes[sceneKey];

    const userImageBase64 = req.file.buffer.toString("base64");

    console.log("archetypeKey:", archetypeKey);
    console.log("scene:", scene);
    console.log("image buffer size:", req.file.buffer.length);

    const finalUrl = await restyleCalcioImage({
      imageBase64: `data:image/jpeg;base64,${userImageBase64}`,
      archetypePrompt: archetype.basePrompt,
      scenePrompt,
    });

    // AGGIUNGI QUESTO:
  const imageBuffer = await downloadToBuffer(finalUrl);

const finalBuffer = isPremium
  ? imageBuffer
  : await applyWatermarkToBuffer(imageBuffer);

const finalBase64 = `data:image/jpeg;base64,${finalBuffer.toString("base64")}`;

return res.json({
  ok: true,
  imageUrl: finalBase64,
});

  } catch (err: any) {
    console.error("❌ /calcio/generate error:", err);
    return res.status(500).json({
      error: err?.message || "Calcio generation failed",
    });
  }
});

/* ================== COUPLE CARDS ================== */
app.post("/couple/generate", upload.fields([
  { name: "image1" },
  { name: "image2" }
]), async (req, res) => {

  const userId = req.query.userId;

if (!userId) {
  return res.status(400).json({ error: "userId mancante" });
}
  try {
    const isPremium = req.body?.isPremium === "true" || req.body?.isPremium === true;

    // ✅ QUI VA IL TUO CODICE
   const image1 = (req.files as any)?.image1?.[0];
const image2 = (req.files as any)?.image2?.[0];

if (!image1 || !image2) {
  return res.status(400).json({ error: "Immagini mancanti" });
}

const file1 = image1;
const file2 = image2;
  
const buffer1 = await convertIfHeic(file1);
const buffer2 = await convertIfHeic(file2);

const face1 = await sharp(buffer1)
  .resize(512, 512, { fit: "cover" })
  .jpeg()
  .toBuffer();

const face2 = await sharp(buffer2)
  .resize(512, 512, { fit: "cover" })
  .jpeg()
  .toBuffer();

    // ---------------- TEMPLATE IMAGE ----------------
const templateMap: any = {
  cheek: "./assets/couple/1.jpg",
  forehead: "./assets/couple/2.jpg",
  arms: "./assets/couple/3.jpg",
  studio: "./assets/couple/4.jpg",
  walk: "./assets/couple/5.jpg",
  luxury: "./assets/couple/6.jpg",
};

const templatePath = templateMap[req.body.templateKey];

if (!templatePath) {
  return res.status(400).json({ error: "Invalid templateKey" });
}

const templateBuffer = fs.readFileSync(templatePath);

    if (!file1 || !file2) {
      return res.status(400).json({ error: "Missing images" });
    }

    // unisci immagini
   const merged = await sharp({
  create: {
    width: 1536,
    height: 768,
    channels: 3,
    background: { r: 0, g: 0, b: 0 }
  }
})
  .composite([
    { input: face1, top: 0, left: 0 },
    { input: face2, top: 0, left: 512 },
    { input: templateBuffer, top: 0, left: 1024, blend: "over" },
  ])
  .jpeg({ quality: 95 })
  .toBuffer();

const mergedBase64 = merged.toString("base64");
    
    const imageUrl = await restyleStyleCardImage({
  imageBase64: `data:image/jpeg;base64,${mergedBase64}`,
  prompt: getCouplePrompt(req.body.templateKey),
  templateKey: req.body.templateKey,
});
    // 👉 qui dopo chiameremo FAL
   const buffer = await downloadToBuffer(imageUrl);

const finalBuffer = isPremium
  ? buffer
  : await applyWatermarkToBuffer(buffer);

const finalBase64 = `data:image/jpeg;base64,${finalBuffer.toString("base64")}`;

return res.json({
  imageUrl: finalBase64,
});

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
/* ================== START ================== */

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server avviato su porta ${PORT}`);
});
