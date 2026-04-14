import * as faceapi from "@vladmandic/face-api";
import * as canvas from "canvas";

const { Canvas, Image, ImageData } = canvas as any;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let loaded = false;

export async function loadFaceModels() {
  if (loaded) return;

  await faceapi.nets.ssdMobilenetv1.loadFromDisk("./models");
  await faceapi.nets.faceLandmark68Net.loadFromDisk("./models");
  await faceapi.nets.faceRecognitionNet.loadFromDisk("./models");

  loaded = true;
}

export async function getFaceDescriptor(buffer: Buffer) {
  const img = await canvas.loadImage(buffer);

  const detection = await faceapi
    .detectSingleFace(img as any)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) throw new Error("No face detected");

  return detection;
}