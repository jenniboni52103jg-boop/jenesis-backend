import * as faceapi from "@vladmandic/face-api/dist/face-api.esm.js";
import * as canvas from "canvas";
import path from "path";

process.env.TFJS_NODE_DISABLE = "1";

const { Canvas, Image, ImageData } = canvas as any;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let loaded = false;

export async function loadModels() {
  if (loaded) return;

  const modelPath = path.join(__dirname, "../../models");

  await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(modelPath);

  loaded = true;
}

export async function detectAndCropFace(imageBuffer: Buffer) {
  await loadModels();

  const img = await canvas.loadImage(imageBuffer);

 const detection = await faceapi
  .detectSingleFace(img as any, new faceapi.TinyFaceDetectorOptions())
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

  ctx.drawImage(
    img,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    cropW,
    cropH
  );

  return out.toBuffer("image/jpeg");
}