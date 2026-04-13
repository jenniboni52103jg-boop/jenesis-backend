import RunwayML from "@runwayml/sdk";

const runway = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY!,
});

function mapRatio(ratio: UiRatio) {
  return ratio === "9:16" ? "720:1280" : "1280:720";
}

// =======================
// AVVIO GENERAZIONE
// =======================
export async function startGeneration({
  imageUrl,
  ratio,
}: {
  imageUrl: string;
  ratio: UiRatio;
}) {
  console.log("🎬 Avvio generazione Runway");

  const task: any = await runway.imageToVideo.create({
    model: "gen4_turbo",
    promptImage: imageUrl,
    promptText: "High quality cinematic motion",
    duration: 5,
    ratio: mapRatio(ratio),
  });

  console.log("🆔 Task creato:", task.id);
  return task.id as string;
}

// =======================
// CHECK STATUS
// =======================
export async function checkStatus(taskId: string) {
  const task: any = await runway.tasks.retrieve(taskId);

  console.log("📡 Stato Runway:", task.status);

  if (task.status !== "SUCCEEDED") {
    return { status: task.status };
  }

  const output = task.output;
  const videoUrl =
    output?.video?.url ||
    output?.video?.[0]?.url;

  if (!videoUrl) {
    throw new Error("Video non trovato nell'output Runway");
  }

  return {
    status: "completed",
    videoUrl,
  };
}

type UiRatio = "9:16" | "16:9" | "1:1" | string;

function mapImageRatio(ratio: UiRatio) {
  // tienilo semplice: se Runway vuole altro, modifichiamo qui
  return ratio;
}

export async function startImageGeneration({
  prompt,
  style,
  ratio,
}: {
  prompt: string;
  style?: string; // "photorealistic" | "cartoon"
  ratio: UiRatio;
}): Promise<{ imageUrl: string }> {
  const finalPrompt =
    style && style.trim().length > 0
      ? `${prompt}\nStyle: ${style}`
      : prompt;

  const mappedRatio = mapImageRatio(ratio);

  console.log("🎨 Avvio generazione IMMAGINE Runway...");

  /**
   * QUI È L’UNICO PUNTO “DIPENDENTE” DALL’SDK:
   * Alcune versioni espongono textToImage / imageGeneration / ecc.
   * Se questo metodo non esiste, dimmelo e ti do la chiamata corretta
   * in base a cosa ti appare nell’autocomplete del tuo Runway SDK.
   */
  // ✅ TENTATIVO 1 (molto comune nelle SDK moderne)
  // @ts-ignore
  const task = await runway.textToImage.create({
    promptText: finalPrompt,
    // @ts-ignore
    ratio: mappedRatio,
  });

  // @ts-ignore
  const result: any = await runway.textToImage.waitForTaskOutput(task.id);

  // prova a prendere un url immagine in modo robusto
  const url =
    result?.output?.[0] ||
    result?.output?.image ||
    result?.image ||
    result?.images?.[0];

  if (!url) {
    throw new Error("Nessun imageUrl trovato nella risposta Runway");
  }

  console.log("✅ Immagine generata:", url);
  return { imageUrl: url };
}