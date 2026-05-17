import { fal } from "@fal-ai/client";

async function uploadBase64ToFal(base64: string) {
  const clean = base64.replace(
    /^data:image\/\w+;base64,/,
    ""
  );

  const buffer = Buffer.from(clean, "base64");

  const file = new File(
    [buffer],
    "image.png",
    { type: "image/png" }
  );

  const url = await fal.storage.upload(file);

  return url;
}

export async function generateFootballSelfie(opts: {
  userImageBase64: string;
  prompt: string;
}) {
  console.log("⚽ FLUX KONTEXT START");

  const userUrl = await uploadBase64ToFal(
    opts.userImageBase64
  );

  console.log("USER URL =", userUrl);

  const result: any = await fal.subscribe(
    "fal-ai/flux-pro/kontext",
    {
      input: {
        prompt: opts.prompt,

        image_url: userUrl,

        strength: 0.8,

        guidance_scale: 4,

        num_inference_steps: 28,

        safety_tolerance: 5,

        output_format: "jpeg",
      },

      logs: true,

      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          for (const log of update.logs ?? []) {
            console.log(log.message);
          }
        }
      },
    } as any
  );

  console.log(
    "FULL RESULT =",
    JSON.stringify(result, null, 2)
  );

  const finalUrl =
    result?.data?.images?.[0]?.url;

  if (!finalUrl) {
    throw new Error(
      "Flux Kontext failed"
    );
  }

  return finalUrl;
}