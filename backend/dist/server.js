"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fal = __importStar(require("@fal-ai/serverless-client"));
const sdk_1 = __importDefault(require("@runwayml/sdk"));
const cloudinary_1 = require("cloudinary");
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const elevenlabs_1 = require("elevenlabs");
const express_1 = __importDefault(require("express"));
//import ffmpegPath from "ffmpeg-static";
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const heic_convert_1 = __importDefault(require("heic-convert"));
const multer_1 = __importDefault(require("multer"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
dotenv_1.default.config({ path: "../.env" });
//const replicate = new Replicate({
// auth: process.env.REPLICATE_API_KEY,
//});
async function applyWatermarkToVideo(videoUrl) {
    const tempInput = path_1.default.join(os_1.default.tmpdir(), `input_${Date.now()}.mp4`);
    const tempOutput = path_1.default.join(os_1.default.tmpdir(), `output_${Date.now()}.mp4`);
    const res = await (0, node_fetch_1.default)(videoUrl);
    const buffer = await res.buffer();
    fs_1.default.writeFileSync(tempInput, buffer);
    await new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(tempInput)
            .videoFilter("drawtext=text='Jenesis AI':fontcolor=white:fontsize=28:x=W-tw-20:y=H-th-20")
            .output(tempOutput)
            .on("end", resolve)
            .on("error", reject)
            .run();
    });
    const exists = fs_1.default.existsSync(tempOutput);
    console.log("🎬 FILE EXISTS:", exists);
    if (!exists) {
        throw new Error("FFMPEG_NON_HA_CREATO_FILE");
    }
    const stats = fs_1.default.statSync(tempOutput);
    console.log("📦 FILE SIZE:", stats.size);
    const finalBuffer = fs_1.default.readFileSync(tempOutput);
    fs_1.default.unlinkSync(tempInput);
    fs_1.default.unlinkSync(tempOutput);
    return finalBuffer;
}
// usa il binario di sistema
//if (!ffmpegPath) {
// throw new Error("FFMPEG NOT FOUND");
//}
fluent_ffmpeg_1.default.setFfmpegPath("/usr/bin/ffmpeg");
//ffmpeg.setFfmpegPath(ffmpegPath as string);
console.log("REPLICATE KEY:", process.env.REPLICATE_API_KEY);
console.log("FAL KEY LENGTH:", process.env.FAL_KEY?.length);
console.log("FFMPEG USATO:", "/usr/bin/ffmpeg");
//console.log("FFMPEG PATH:", ffmpegPath);
console.log("🔥 NUOVA VERSIONE SERVER");
process.env.FAL_KEY = process.env.FAL_KEY || "";
fal.config({
    credentials: process.env.FAL_KEY,
});
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
//console.log("CLOUD NAME:", process.env.CLOUD_NAME);
//console.log("API KEY:", process.env.CLOUD_API_KEY);
//console.log("SECRET:", process.env.CLOUD_API_SECRET);
console.log("CLOUD NAME EXISTS:", !!process.env.CLOUDINARY_CLOUD_NAME);
console.log("API KEY EXISTS:", !!process.env.CLOUDINARY_API_KEY);
console.log("SECRET EXISTS:", !!process.env.CLOUDINARY_API_SECRET);
console.log("CLOUDINARY CONFIG:", cloudinary_1.v2.config());
const app = (0, express_1.default)();
// 1. CONFIGURAZIONE MIDDLEWARE (Mettili qui!)
// Serve per gestire i dati inviati come JSON (es. le stringhe Base64 pesanti)
app.use(express_1.default.json({ limit: '50mb' }));
// Serve per gestire i dati inviati tramite form HTML o URL-encoded
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// 2. CONFIGURAZIONE STORAGE (Multer)
const storage = multer_1.default.memoryStorage();
//const upload = multer({ storage: storage });
// 4. AVVIO SERVER
//app.listen(3000, () => console.log("Server running on port 3000"));
app.get('/', (req, res) => {
    res.send('Server attivo 🚀');
});
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const ROOT_DIR = process.cwd();
const TEMP_DIR = path_1.default.join(ROOT_DIR, "temp");
const VIDEOS_DIR = path_1.default.join(ROOT_DIR, "videos");
app.use("/videos", express_1.default.static(VIDEOS_DIR));
if (!fs_1.default.existsSync(TEMP_DIR))
    fs_1.default.mkdirSync(TEMP_DIR, { recursive: true });
if (!fs_1.default.existsSync(VIDEOS_DIR))
    fs_1.default.mkdirSync(VIDEOS_DIR, { recursive: true });
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true })); // ✅ QUESTO MANCAVA
app.use("/videos", express_1.default.static("videos"));
function requireEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env: ${name}`);
    return v;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
function stringifyUnknownError(err) {
    if (typeof err === "string")
        return err;
    if (typeof err?.message === "string")
        return err.message;
    try {
        return JSON.stringify(err, null, 2);
    }
    catch {
        return "Errore sconosciuto";
    }
}
function createJobId() {
    return crypto_1.default.randomBytes(12).toString("hex");
}
const runway = new sdk_1.default({
    apiKey: requireEnv("RUNWAY_API_KEY"),
});
console.log("RUNWAY API KEY PREFIX:", requireEnv("RUNWAY_API_KEY").slice(0, 12));
app.get("/", (_req, res) => res.send("JG Backend OK ✅"));
app.get("/health", (_req, res) => res.status(200).send("OK"));
const eleven = new elevenlabs_1.ElevenLabsClient({
    apiKey: requireEnv("ELEVENLABS_API_KEY"),
});
async function generateImages(req) {
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
async function refineImages(images) {
    console.log("Refining images...");
    await new Promise((r) => setTimeout(r, 1000));
    return images; // per ora non cambia niente
}
// ============== FAKE DB (temporaneo ma funzionante) PER CREDITS ============
const users = {};
async function getUserFromDB(userId) {
    if (!users[userId]) {
        users[userId] = { credits: 0 };
    }
    return users[userId];
}
async function updateUserCredits(userId, credits) {
    users[userId] = { credits };
}
/* ================== FUNZIONE CLOUDINARI ================== */
async function uploadToCloudinary(buffer) {
    // DEBUG: Se questo stampa undefined, le variabili env non sono caricate
    console.log("Cloudinary Config Check:", cloudinary_1.v2.config().api_key);
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder: "app",
            resource_type: "video"
        }, (error, result) => {
            if (error) {
                console.error("Errore Cloudinary dettagliato:", error); // Questo ti dirà COSA manca
                return reject(error);
            }
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
}
/* ================== per cards couple ================== */
async function convertIfHeic(file) {
    if (file.mimetype === "image/heic" ||
        file.mimetype === "image/heif") {
        const outputBuffer = await (0, heic_convert_1.default)({
            buffer: file.buffer,
            format: "JPEG",
            quality: 1,
        });
        return outputBuffer;
    }
    return file.buffer;
}
/* ================== HELPERS RUNWAY ================== */
function toRunwayRatio(ratio) {
    if (ratio === "9:16" || ratio === "720:1280")
        return "720:1280";
    if (ratio === "16:9" || ratio === "1280:720")
        return "1280:720";
    if (ratio === "1:1" || ratio === "960:960")
        return "960:960";
    return "720:1280";
}
function bufferToDataUri(buffer, mimeType) {
    const base64 = buffer.toString("base64");
    return `data:${mimeType};base64,${base64}`;
}
function normalizeRunwayOutput(task) {
    if (!task)
        return null;
    if (typeof task.output === "string")
        return task.output;
    if (Array.isArray(task.output) && typeof task.output[0] === "string") {
        return task.output[0];
    }
    if (Array.isArray(task.output) && typeof task.output[0]?.url === "string") {
        return task.output[0].url;
    }
    if (typeof task.videoUrl === "string")
        return task.videoUrl;
    if (typeof task.url === "string")
        return task.url;
    return null;
}
/* ================== HELPERS STABILITY ================== */
function toStabilityAspectRatio(ratio) {
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
function styleToPreset(style) {
    if (style === "photorealistic")
        return "photographic";
    if (style === "travel")
        return "travel";
    return undefined;
}
function pickBase64(result) {
    return (result?.image ||
        result?.artifacts?.[0]?.base64 ||
        result?.images?.[0]?.base64 ||
        result?.output?.[0]?.base64);
}
/* ================== AI EFFECTS IMAGE FILTERS ================== */
function effectImageFilter(effect) {
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
async function normalizeEffectInputToJpeg(buffer) {
    return await (0, sharp_1.default)(buffer)
        .rotate()
        .jpeg({ quality: 95 })
        .toBuffer();
}
async function createEffectImage(opts) {
    const normalizedBuffer = await normalizeEffectInputToJpeg(opts.imageBuffer);
    const inputPath = path_1.default.join(TEMP_DIR, `effect_img_input_${Date.now()}.jpg`);
    const outputPath = path_1.default.join(TEMP_DIR, `effect_img_output_${Date.now()}.jpg`);
    fs_1.default.writeFileSync(inputPath, normalizedBuffer);
    const vf = effectImageFilter(opts.effect);
    await new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(inputPath)
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
    const outputBuffer = fs_1.default.readFileSync(outputPath);
    try {
        fs_1.default.unlinkSync(inputPath);
    }
    catch { }
    try {
        fs_1.default.unlinkSync(outputPath);
    }
    catch { }
    return outputBuffer;
}
/* ================== HELPERS WATERMARK ================== */
/**
 * Applica il watermark "JenesisAI" a un buffer di immagine
 */
async function applyWatermarkToBuffer(imageBuffer) {
    const metadata = await (0, sharp_1.default)(imageBuffer).metadata();
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
    return await (0, sharp_1.default)(imageBuffer)
        .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
        .jpeg({ quality: 95 })
        .toBuffer();
}
// ---------------- SWAPFACE per photo ai ----------------
async function swapFace(templatePath, userBuffer) {
    process.env.FAL_KEY = requireEnv("FAL_KEY");
    try {
        console.log("📸 Caricamento immagini...");
        // Trasformiamo i Buffer in File/Blob in un modo che non dia errori di tipo
        // Usiamo 'any' solo per il caricamento per bypassare il blocco di TypeScript
        const userImage = userBuffer;
        const templateImage = fs_1.default.readFileSync(templatePath);
        const userImageUrl = await fal.storage.upload(userImage);
        const templateImageUrl = await fal.storage.upload(templateImage);
        console.log("🚀 Esecuzione Face Swap con polling...");
        // Usiamo 'subscribe' invece di 'run' o 'queue'. 
        // È l'unico metodo che gestisce l'attesa senza dare "Request in progress" o "Timeout".
        const result = await fal.subscribe("fal-ai/face-swap", {
            input: {
                base_image_url: templateImageUrl,
                swap_image_url: userImageUrl,
            },
            pollInterval: 5000, // Controlla ogni 5 secondi
        });
        const finalUrl = result.image?.url || result.images?.[0]?.url;
        if (!finalUrl)
            throw new Error("Risultato non trovato");
        console.log("✅ Face Swap completato con successo!");
        return finalUrl;
    }
    catch (error) {
        console.error("❌ ERRORE:", error.message);
        throw error;
    }
}
// ---------------- SWAPFACE CALCIO ----------------
//async function swapFaceCalcio(
//templatePath: string,
//userBuffer: Buffer
//) {
//process.env.REPLICATE_API_KEY =
//requireEnv("REPLICATE_API_KEY");
//try {
//console.log("⚽ CALCIO FACE SWAP START");
// TEMPLATE
//const templateImage: any =
//fs.readFileSync(templatePath);
//const templateUrl =
//await fal.storage.upload(
//templateImage
//);
// USER
//const userUrl =
//await fal.storage.upload(
//userBuffer as any
//);
//console.log(
//"⚽ TEMPLATE URL =",
//templateUrl
//);
//console.log(
//"⚽ USER URL =",
//userUrl
//);
// ---------------- REPLICATE DIRECT API ----------------
//console.log(
//"⚽ START REPLICATE FACE SWAP"
//);
//const output = await replicate.run(
// "codeplugtech/face-swap:278a81e7ebb2664cf11efc7cac294b9d95f8f2db8b7d5cbf60d6ea0df19e9bdb",
// {
//input: {
//swap_image: userUrl,
//target_image: templateUrl,
//},
//}
//);
//console.log(
//"⚽ REPLICATE OUTPUT =",
//output
//);
//let finalUrl: string | null =
//null;
//if (
//Array.isArray(output)
//) {
//finalUrl =
//  output[0] as string;
//} else if (
//typeof output ===
//"string"
//) {
//finalUrl =
//  output;
//}
//if (!finalUrl) {
//throw new Error(
//"Calcio face swap failed"
//);
//}
//console.log(
// "✅ CALCIO FACE SWAP DONE"
//);
//return finalUrl;
//} catch (err: any) {
//console.error(
//"❌ CALCIO FACE SWAP ERROR =",
//  err
//);
//throw err;
//}
//}
/* ================== HELPERS ELEVENLABS ================== */
async function elevenTextToSpeech(text, voiceId) {
    const finalVoiceId = voiceId || requireEnv("ELEVENLABS_VOICE_ID");
    const audioStream = await eleven.textToSpeech.convert(finalVoiceId, {
        text: text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
    });
    const chunks = [];
    for await (const chunk of audioStream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}
//async function downloadToBuffer(url: string) {
//const resp = await fetch(url);
//if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
//return await resp.buffer();
//}
async function downloadToBuffer(url) {
    // BASE64 DATA URL
    if (url.startsWith("data:image")) {
        const base64Data = url.split(",")[1];
        return Buffer.from(base64Data, "base64");
    }
    // NORMAL HTTP URL
    const response = await (0, node_fetch_1.default)(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
/*============ helper elevenlabs ==========*/
async function elevenCloneVoice(opts) {
    const apiKey = requireEnv("ELEVENLABS_API_KEY");
    const form = new form_data_1.default();
    form.append("name", opts.name);
    if (opts.description) {
        form.append("description", opts.description);
    }
    form.append("files", opts.audioBuffer, {
        filename: opts.fileName,
        contentType: opts.mimeType,
    });
    const resp = await (0, node_fetch_1.default)("https://api.elevenlabs.io/v1/voices/add", {
        method: "POST",
        headers: {
            "xi-api-key": apiKey,
            ...form.getHeaders(),
        },
        body: form,
    });
    const text = await resp.text();
    const data = safeJsonParse(text);
    if (!resp.ok) {
        console.log("❌ Eleven clone voice error:", text);
        throw new Error(data?.detail?.message ||
            data?.message ||
            `Eleven clone voice error ${resp.status}`);
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
    const resp = await (0, node_fetch_1.default)("https://api.elevenlabs.io/v1/voices", {
        headers: {
            "xi-api-key": apiKey,
        },
    });
    const text = await resp.text();
    const data = safeJsonParse(text);
    if (!resp.ok) {
        console.log("❌ Eleven get voices error:", text);
        throw new Error(data?.detail?.message ||
            data?.message ||
            `Eleven get voices error ${resp.status}`);
    }
    const voices = Array.isArray(data?.voices)
        ? data.voices.map((v) => ({
            id: v.voice_id,
            name: v.name,
            category: v.category || null,
            preview_url: v.preview_url || null,
        }))
        : [];
    return voices;
}
/* ================== HELPERS AI EFFECTS ================== */
function getPublicBaseUrl(req) {
    const proto = req.headers["x-forwarded-proto"] ||
        req.protocol ||
        "http";
    const host = req.get("host");
    return `${proto}://${host}`;
}
function effectVideoFilter(effect) {
    const baseZoom = "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1";
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
async function createEffectVideoFromImage(opts) {
    const inputPath = path_1.default.join(TEMP_DIR, `effect_input_${Date.now()}.jpg`);
    const outputPath = path_1.default.join(VIDEOS_DIR, `effect_${opts.effect}_${Date.now()}.mp4`);
    fs_1.default.writeFileSync(inputPath, opts.imageBuffer);
    const vf = effectVideoFilter(opts.effect);
    await new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(inputPath)
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
        fs_1.default.unlinkSync(inputPath);
    }
    catch { }
    return outputPath;
}
/* ============== helper ai EFFECTS ================== */
function getEffectReference(effect) {
    const base = path_1.default.join(__dirname, "assets", "effects");
    if (effect === "movie")
        return path_1.default.join(base, "movie.jpg");
    if (effect === "cyberpunk")
        return path_1.default.join(base, "cyberpunk.jpg");
    if (effect === "photorealistic")
        return path_1.default.join(base, "photorealistic.jpg");
    if (effect === "cartoon")
        return path_1.default.join(base, "cartoon.jpg");
    throw new Error("Invalid effect");
}
/* ================== HELPERS PROMPT EFFECTS ================== */
function getEffectPrompt(effect) {
    const base = "portrait photo of the SAME person from the input image, preserve the exact same face, same identity, same gender, same ethnicity, same facial structure, same eyes, same nose, same lips, same hairline, same hairstyle, same age, same skin tone, same body proportions";
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
async function transformImageWithStyle(opts) {
    const apiKey = requireEnv("STABILITY_API_KEY");
    let prompt = "Keep the same person and same face. Preserve identity, facial features, hair, pose and framing. Apply only a cinematic portrait enhancement. Do not change gender, age or face.";
    let strength = "0.20";
    if (opts.effect === "movie") {
        prompt =
            "Keep the same person and same face. Preserve identity, facial features, hair, pose and framing. Apply only cinematic movie lighting, contrast and atmosphere. Do not change gender, age or face.";
        strength = "0.20";
    }
    else if (opts.effect === "cyberpunk") {
        prompt =
            "Keep the same person and same face. Preserve identity, facial features, hair, pose and framing. Apply only cyberpunk neon lighting, futuristic mood and color treatment. Do not change gender, age or face.";
        strength = "0.24";
    }
    else if (opts.effect === "photorealistic") {
        prompt =
            "Keep the same person and same face. Preserve identity, facial features, hair, pose and framing. Apply only premium photorealistic enhancement and studio-quality lighting. Do not change gender, age or face.";
        strength = "0.15";
    }
    else if (opts.effect === "cartoon") {
        prompt =
            "Keep the same person and same face. Preserve identity, facial features, hair, pose and framing. Apply only a soft cartoon stylization while keeping the person clearly recognizable. Do not change gender, age or face.";
        strength = "0.28";
    }
    const form = new form_data_1.default();
    form.append("prompt", prompt);
    form.append("output_format", "jpeg");
    form.append("strength", strength);
    form.append("image", opts.imageBuffer, {
        filename: "input.jpg",
        contentType: "image/jpeg",
    });
    const resp = await (0, node_fetch_1.default)("https://api.stability.ai/v2beta/stable-image/generate/core", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
            ...form.getHeaders(),
        },
        body: form,
    });
    const text = await resp.text();
    const data = safeJsonParse(text);
    if (!resp.ok) {
        console.log("❌ Stability effect transform error:", text);
        throw new Error(data?.message ||
            data?.error ||
            JSON.stringify(data) ||
            `Stability transform failed (${resp.status})`);
    }
    const base64 = data?.image ||
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
async function hedraCreateAsset(opts) {
    const apiKey = requireEnv("HEDRA_API_KEY");
    const resp = await (0, node_fetch_1.default)("https://api.hedra.com/web-app/public/assets", {
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
        throw new Error(data?.messages?.[0] ||
            data?.message ||
            `Hedra create asset error ${resp.status}`);
    }
    const assetId = data?.id || data?.asset_id;
    if (!assetId) {
        console.log("❌ Hedra create asset response:", data);
        throw new Error("Hedra asset_id mancante");
    }
    return assetId;
}
async function hedraUploadAsset(opts) {
    const apiKey = requireEnv("HEDRA_API_KEY");
    const form = new form_data_1.default();
    form.append("file", opts.fileBuffer, {
        filename: opts.fileName,
        contentType: opts.mimeType,
    });
    const resp = await (0, node_fetch_1.default)(`https://api.hedra.com/web-app/public/assets/${opts.assetId}/upload`, {
        method: "POST",
        headers: {
            "X-API-Key": apiKey,
            ...form.getHeaders(),
        },
        body: form,
    });
    const text = await resp.text();
    const data = safeJsonParse(text);
    if (!resp.ok) {
        console.log("❌ Hedra upload error:", text);
        throw new Error(data?.messages?.[0] ||
            data?.message ||
            `Hedra upload error ${resp.status}`);
    }
    return data;
}
async function hedraGenerateAudio(opts) {
    const apiKey = requireEnv("HEDRA_API_KEY");
    const resp = await (0, node_fetch_1.default)("https://api.hedra.com/web-app/public/generations", {
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
        throw new Error(data?.messages?.[0] ||
            data?.message ||
            `Hedra generate audio error ${resp.status}`);
    }
    const generationId = data?.id;
    if (!generationId) {
        console.log("❌ Hedra generate audio response:", data);
        throw new Error("Hedra audio generation id mancante");
    }
    return generationId;
}
//* TALKING VIDEO ASYNC*//
async function hedraCreateTalkingVideo(opts) {
    const apiKey = requireEnv("HEDRA_API_KEY");
    const resp = await (0, node_fetch_1.default)("https://api.hedra.com/web-app/public/generations", {
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
        throw new Error(data?.messages?.[0] ||
            data?.message ||
            `Hedra create video error ${resp.status}`);
    }
    const generationId = data?.id;
    if (!generationId) {
        console.log("❌ Hedra create video response:", data);
        throw new Error("Hedra video generation id mancante");
    }
    return generationId;
}
async function hedraCreateAvatarTalkingVideo(opts) {
    const apiKey = requireEnv("HEDRA_API_KEY");
    const resp = await (0, node_fetch_1.default)("https://api.hedra.com/web-app/public/generations", {
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
    });
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
async function hedraPollGenerationResult(generationId) {
    const apiKey = requireEnv("HEDRA_API_KEY");
    for (let i = 0; i < 120; i++) {
        const resp = await (0, node_fetch_1.default)(`https://api.hedra.com/web-app/public/generations/${generationId}/status`, {
            headers: { "X-API-Key": apiKey },
        });
        const text = await resp.text();
        const data = safeJsonParse(text);
        console.log(`Hedra poll [${i + 1}/120]:`, data?.status || "no-status");
        console.log("👉 HEDRA HIT");
        if (!resp.ok) {
            console.log("❌ Hedra polling raw body:", text);
            throw new Error(data?.messages?.[0] ||
                data?.message ||
                `Hedra polling error ${resp.status}`);
        }
        const status = data?.status;
        if (status === "complete") {
            console.log("✅ Hedra complete:", JSON.stringify(data, null, 2));
            return data;
        }
        if (status === "failed" || status === "error") {
            console.log("❌ Hedra failed:", JSON.stringify(data, null, 2));
            throw new Error(data?.messages?.[0] ||
                data?.message ||
                data?.error_message ||
                "Hedra generation failed");
        }
        await sleep(4000);
    }
    throw new Error("Hedra timeout");
}
async function hedraGetAssetDownloadUrl(assetId) {
    const apiKey = requireEnv("HEDRA_API_KEY");
    const resp = await (0, node_fetch_1.default)(`https://api.hedra.com/web-app/public/assets/${assetId}`, {
        headers: { "X-API-Key": apiKey },
    });
    const text = await resp.text();
    const data = safeJsonParse(text);
    if (!resp.ok) {
        console.log("❌ Hedra get asset error:", text);
        throw new Error(data?.messages?.[0] ||
            data?.message ||
            `Hedra get asset error ${resp.status}`);
    }
    return (data?.url ||
        data?.download_url ||
        data?.streaming_url ||
        data?.asset?.url ||
        data?.asset?.download_url ||
        null);
}
const avatarJobs = new Map();
const styleJobs = new Map();
const STYLE_TEMPLATES = {
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
function createAvatarJob() {
    const job = {
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
function createStyleJob() {
    const job = {
        id: createJobId(),
        status: "queued",
        images: [],
    };
    styleJobs.set(job.id, job);
    return job;
}
function updateStyleJob(jobId, patch) {
    const job = styleJobs.get(jobId);
    if (!job)
        return;
    const updated = { ...job, ...patch };
    styleJobs.set(jobId, updated);
}
function updateAvatarJob(jobId, patch) {
    const current = avatarJobs.get(jobId);
    if (!current)
        return;
    const updated = {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
    };
    avatarJobs.set(jobId, updated);
}
async function runAvatarJob(jobId, payload) {
    try {
        const { imageBase64, avatarPrompt, avatarVisualPrompt, voiceMode, voiceId, recordedAudioBase64, isPremium, } = payload;
        updateAvatarJob(jobId, {
            status: "processing",
            progress: "Generating voice",
            error: null,
        });
        let finalAudioBuffer;
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
        }
        else {
            console.log("STEP 0: ElevenLabs TTS start");
            finalAudioBuffer = await elevenTextToSpeech(String(avatarPrompt || "").trim(), voiceId || undefined);
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
        let videoUrl = videoResult?.url ||
            videoResult?.video_url ||
            videoResult?.download_url ||
            videoResult?.streaming_url ||
            videoResult?.asset?.url ||
            videoResult?.asset?.download_url ||
            videoResult?.result?.url ||
            null;
        const finalAssetId = videoResult?.asset_id ||
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
        // console.log("🎬 Applying avatar watermark...");
        const videoBuffer = await (0, node_fetch_1.default)(videoUrl).then(r => r.buffer());
        const inputPath = path_1.default.join(TEMP_DIR, `avatar_${Date.now()}.mp4`);
        const outputPath = path_1.default.join(VIDEOS_DIR, `avatar_wm_${Date.now()}.mp4`);
        fs_1.default.writeFileSync(inputPath, videoBuffer);
        const filterString = isPremium
            ? null
            : "drawtext=text='JenesisAI':fontcolor=white@0.5:fontsize=40:x=(w-text_w)/2:y=h-60:shadowcolor=black:shadowx=2:shadowy=2";
        //const filters = isPremium
        // ? []
        //: [
        // {
        // filter: "drawtext",
        // options: {
        //   text: "JenesisAI",
        //  fontcolor: "white@0.5",
        //  fontsize: "h/20",
        //  x: "(w-text_w)/2",
        //  y: "(h-text_h)*0.9",
        //  shadowcolor: "black",
        //  shadowx: 2,
        //  shadowy: 2,
        //  },
        // },
        // ];
        //await new Promise((resolve, reject) => {
        //ffmpeg(inputPath)
        //.videoFilters(filters)
        //(filterString ? [".videoFilters(filterString)"] : [])
        //.save(outputPath)
        //.on("end", resolve)
        //.on("error", reject);
        //});
        await new Promise((resolve, reject) => {
            const command = (0, fluent_ffmpeg_1.default)(inputPath);
            if (filterString) {
                command.videoFilters(filterString);
            }
            command
                .on("end", resolve)
                .on("error", reject)
                .save(outputPath);
        });
        try {
            fs_1.default.unlinkSync(inputPath);
        }
        catch { }
        const finalUrl = `${process.env.BASE_URL || "https://injurable-giavanna-purselike.ngrok-free.dev"}/videos/${path_1.default.basename(outputPath)}`;
        console.log("✅ Avatar final video ready:", finalUrl);
    }
    catch (err) {
        console.error("Speaking avatar job error:", err);
        updateAvatarJob(jobId, {
            status: "failed",
            progress: "Failed",
            error: stringifyUnknownError(err),
        });
    }
}
/* ================== STABILITY stabillity cards ================== */
async function preprocessUserImage(buffer) {
    return await (0, sharp_1.default)(buffer)
        .rotate()
        .resize(1024, 1820, {
        fit: "inside",
        withoutEnlargement: true
    }) // Mantiene il formato verticale senza tagliare
        .jpeg({ quality: 95 })
        .toBuffer();
}
async function extractFace(buffer) {
    return await (0, sharp_1.default)(buffer)
        .rotate()
        .resize(512, 512, { fit: "cover" })
        .normalise() // 🔥 bilancia luci
        .sharpen() // 🔥 migliora dettagli
        .jpeg({ quality: 100 })
        .toBuffer();
}
async function matchColorToTemplate(faceBuffer, templateBuffer) {
    const templateStats = await (0, sharp_1.default)(templateBuffer).stats();
    return await (0, sharp_1.default)(faceBuffer)
        .modulate({
        brightness: templateStats.channels[0].mean / 128,
        saturation: 1.05,
    })
        .toBuffer();
}
