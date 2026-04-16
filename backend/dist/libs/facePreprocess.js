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
exports.loadModels = loadModels;
exports.detectAndCropFace = detectAndCropFace;
const faceapi = __importStar(require("@vladmandic/face-api/dist/face-api.esm.js"));
const canvas = __importStar(require("canvas"));
const path_1 = __importDefault(require("path"));
process.env.TFJS_NODE_DISABLE = "1";
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
let loaded = false;
async function loadModels() {
    if (loaded)
        return;
    const modelPath = path_1.default.join(__dirname, "../../models");
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(modelPath);
    loaded = true;
}
async function detectAndCropFace(imageBuffer) {
    await loadModels();
    const img = await canvas.loadImage(imageBuffer);
    const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true);
    if (!detection) {
        throw new Error("Nessun volto trovato");
    }
    const { x, y, width, height } = detection.detection.box;
    const padding = 0.4;
    const cropX = Math.max(0, x - width * padding);
    const cropY = Math.max(0, y - height * padding);
    const cropW = width * (1 + padding * 2);
    const cropH = height * (1 + padding * 2);
    const out = canvas.createCanvas(cropW, cropH);
    const ctx = out.getContext("2d");
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    return out.toBuffer("image/jpeg");
}
