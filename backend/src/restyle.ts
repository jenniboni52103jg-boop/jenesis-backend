import "dotenv/config";
import { fal } from "@fal-ai/client";
import sharp from "sharp";
import { Blob } from "buffer";

console.log("RESTYLE FILE = FAL");
console.log("FAL_KEY =", process.env.FAL_KEY ? "OK" : "MISSING");

fal.config({
  credentials: process.env.FAL_KEY!,
});

/* ================= STYLE CARDS PROMPTS ================= */

export function getStyleCardPrompts(templateKey: string) {
  if (templateKey === "autunno") {
    return [
  `
Full body photo of the SAME person walking in an autumn park.

Wide shot, natural perspective.
Outfit: elegant autumn coat, warm tones.

Environment:
- trees with orange leaves
- soft natural light
- depth of field

IMPORTANT:
- keep same face identity
- DO NOT zoom on face
- show full body or half body
- realistic skin texture (pores, imperfections)
- natural photography, NOT AI look
`,

  `
Medium shot of the SAME person holding a coffee in an autumn forest.

Framing: from knees up (NOT close-up)

Outfit:
- scarf
- coat
- casual autumn style

Lighting: natural daylight

IMPORTANT:
- keep identity
- no beauty filter
- realistic skin
- slight imperfections
`,

  `
Full body candid photo of the SAME person walking on leaves.

Motion shot, natural vibe.

Environment:
- autumn park
- leaves on ground

IMPORTANT:
- full body visible
- NOT portrait
- realistic camera photo
- no smooth skin
`,

  `
Lifestyle photo of the SAME person sitting on a bench in autumn.

Framing: medium-wide shot

IMPORTANT:
- show environment clearly
- cinematic but realistic
- natural skin texture
- not overprocessed
`
];

    const prompt2 = `
Keep the exact same woman, exact same face, exact same identity.

Portrait shot, centered composition.

Pose:
front facing, relaxed expression, natural confident look.

Outfit:
beige coat, large scarf wrapped around neck, cozy autumn styling.

Environment:
autumn park with trees and leaves, softly blurred background.

Lighting:
soft natural light, warm tones, cinematic autumn mood.

Style:
professional editorial portrait, sharp face, soft background, high-end DSLR look.

IMPORTANT:
Do NOT keep original clothes.
Do NOT keep original background.
Keep ONLY the face identity.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    const prompt3 = `
Keep the exact same woman, exact same face, exact same identity.

Mid-body shot of a woman walking in an autumn park.

Pose:
slightly turned, holding a red autumn leaf in hand, natural movement.

Outfit:
elegant camel coat, small shoulder bag, autumn fashion style.

Environment:
autumn park with fallen leaves, trees, warm orange tones.

Lighting:
golden hour light, cinematic, warm and soft.

Style:
lifestyle fashion photography, natural movement, Instagram editorial style.

IMPORTANT:
Do NOT keep original clothes.
Do NOT keep original background.
Keep ONLY the face identity.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    const prompt4 = `
Keep the exact same woman, exact same face, exact same identity.

Mid-body portrait of a woman sitting in an autumn park.

Pose:
sitting relaxed, holding a warm drink (coffee or tea), cozy pose.

Outfit:
beige coat and light sweater, soft elegant autumn style.

Environment:
autumn park with leaves, wooden table or bench, warm cozy atmosphere.

Lighting:
soft cinematic light, warm tones, shallow depth of field.

Style:
cozy luxury autumn photoshoot, lifestyle editorial, realistic.

IMPORTANT:
Do NOT keep original clothes.
Do NOT keep original background.
Keep ONLY the face identity.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    return [ prompt2, prompt3, prompt4];
  }

  if (templateKey === "photoshop") {
    const prompt1 = `
Keep the exact same woman, exact same face, exact same identity, same hair.

Studio fashion photoshoot.

Pose:
woman sitting on a stool, legs slightly open, hands resting on thighs, strong confident posture, facing camera.

Outfit:
elegant black tailored suit, deep neckline blazer, no colors except black.

Environment:
minimal studio background, smooth grey backdrop.

Lighting:
high contrast black and white lighting, dramatic shadows, studio spotlight.

Style:
luxury fashion editorial, Vogue style, sharp, clean, professional.

Color:
black and white only.

IMPORTANT:
Keep ONLY the face and hair identity.
Do NOT change facial features.
Do NOT keep original outfit or background.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    const prompt2 = `
Keep the exact same woman, exact same face, exact same identity, same hair.

Close-up portrait.

Pose:
front facing, serious expression, slightly angled face, direct eye contact.

Outfit:
black blazer, elegant minimal styling.

Environment:
clean studio background.

Lighting:
soft but dramatic studio lighting, high contrast, beauty lighting.

Style:
high-end beauty editorial, magazine cover look.

Color:
black and white.

IMPORTANT:
Keep ONLY the identity.
Do NOT change face structure.
Do NOT change hair style.
Do NOT keep original background.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    const prompt3 = `
Keep the exact same woman, exact same face, exact same identity, same hair.

Studio fashion shoot.

Pose:
woman sitting on stool, one elbow resting on knee, head slightly tilted, relaxed but confident pose.

Outfit:
black elegant suit, fashion editorial styling.

Environment:
minimal grey studio.

Lighting:
cinematic black and white lighting, strong shadows and highlights.

Style:
luxury editorial photography, model test shoot, high-end fashion.

Color:
black and white.

IMPORTANT:
Keep ONLY face identity.
Do NOT change facial features.
Do NOT keep original clothes.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    const prompt4 = `
Keep the exact same woman, exact same face, exact same identity, same hair.

Full body fashion portrait.

Pose:
standing straight, one leg slightly forward, hands relaxed, confident model pose.

Outfit:
black tailored suit, elegant and minimal.

Environment:
studio background, clean grey wall.

Lighting:
high contrast studio lighting, black and white editorial style.

Style:
fashion campaign, luxury brand shoot, sharp and professional.

Color:
black and white only.

IMPORTANT:
Keep ONLY the face identity.
Do NOT change face.
Do NOT keep original outfit or environment.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    return [prompt1, prompt2, prompt3, prompt4];
  }

  if (templateKey === "portraits") {
    const prompt1 = `
Keep the exact same person, exact same face, exact same identity, same hair.

Luxury business portrait.

Pose:
man sitting on a chair, legs crossed, hands joined in front, confident posture, looking straight at camera.

Outfit:
elegant tailored suit, white shirt, classic formal style.

Environment:
dark studio background, minimal and clean.

Lighting:
dramatic studio lighting, strong contrast, cinematic shadows.

Style:
luxury business portrait, CEO style, high-end editorial.

Color:
black and white.

IMPORTANT:
Keep ONLY the face identity.
Do NOT change facial structure.
Do NOT keep original outfit or background.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    const prompt2 = `
Keep the exact same person, exact same face, exact same identity, same hair.

Professional portrait in library.

Pose:
standing slightly angled, holding a book in one hand, relaxed confident posture.

Outfit:
elegant suit with coat, formal business style.

Environment:
library interior with bookshelves, soft depth background.

Lighting:
soft cinematic lighting, professional editorial look.

Style:
luxury intellectual portrait, sophisticated atmosphere.

Color:
black and white.

IMPORTANT:
Keep ONLY the identity.
Do NOT change face.
Do NOT keep original clothes or background.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    const prompt3 = `
Keep the exact same person, exact same face, exact same identity, same hair.

Fashion business portrait.

Pose:
standing straight, adjusting jacket cuff, confident expression, slightly angled body.

Outfit:
tailored suit, elegant formal wear.

Environment:
dark studio background.

Lighting:
dramatic high contrast lighting, cinematic shadows.

Style:
luxury fashion editorial, premium brand campaign.

Color:
black and white.

IMPORTANT:
Keep ONLY face identity.
Do NOT change facial features.
Do NOT keep original outfit or background.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    const prompt4 = `
Keep the exact same person, exact same face, exact same identity, same hair.

Close-up portrait.

Pose:
frontal close-up, confident gaze, neutral expression.

Outfit:
formal vest and shirt, elegant minimal style.

Environment:
dark clean background.

Lighting:
soft but dramatic lighting, high-end beauty portrait.

Style:
luxury portrait photography, magazine cover look.

Color:
black and white.

IMPORTANT:
Keep ONLY the identity.
Do NOT change face structure.
Do NOT keep original background.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    return [prompt1, prompt2, prompt3, prompt4];
  }

  if (templateKey === "anime") {
    const prompt1 = `
Keep the exact same person, preserve facial identity, eyes, nose, lips, and proportions.

Transform into a high-quality anime character.

Scene:
girl sitting on a cozy sofa at home, holding a small white dog in her arms.

Pose:
relaxed sitting pose, gentle smile, looking slightly down at the dog.

Outfit:
soft casual home clothes, pastel tones.

Environment:
warm cozy living room, soft light, plants and cushions.

Style:
modern anime, soft shading, clean lines, detailed eyes.

Lighting:
warm, soft, cozy light.

IMPORTANT:
The face must remain recognizable as the same person.
Do NOT create a different character.
Do NOT distort facial proportions too much.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    const prompt2 = `
Keep the exact same person, preserve identity and facial structure.

Transform into anime style.

Scene:
girl sitting indoors reading a book.

Pose:
holding a book with both hands, calm expression, slightly smiling.

Outfit:
soft sweater, cozy aesthetic.

Environment:
library or home bookshelf background.

Style:
high-quality anime, detailed eyes, soft shading, clean lines.

Lighting:
soft natural light from window.

IMPORTANT:
Keep face recognizable.
Do NOT change identity.
Do NOT exaggerate anime features too much.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    const prompt3 = `
Keep the exact same person, preserve identity and facial features.

Transform into anime character.

Scene:
girl at the beach, sunny day.

Pose:
facing camera, relaxed smile.

Outfit:
summer outfit with a straw hat.

Environment:
ocean, blue sky, bright sunny beach.

Style:
modern anime, vibrant colors, soft shading.

Lighting:
bright sunlight, summer atmosphere.

IMPORTANT:
Face must remain recognizable.
Do NOT change identity.
Do NOT over-stylize face too much.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    const prompt4 = `
Keep the exact same person, preserve identity and facial structure.

Transform into anime style.

Scene:
girl standing under cherry blossom trees.

Pose:
standing, light movement, soft smile, looking slightly to the side.

Outfit:
light elegant dress.

Environment:
spring landscape with pink cherry blossoms, soft petals in the air.

Style:
high-end anime, cinematic, detailed background.

Lighting:
soft warm spring light.

IMPORTANT:
Keep identity recognizable.
Do NOT change face too much.
Do NOT create a different character.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();

    return [prompt1, prompt2, prompt3, prompt4];
  }

  return [
    `Keep the exact same person, exact same face, exact same identity. Enhance the portrait in a premium editorial style.`.trim(),
    `Keep the exact same person, exact same face, exact same identity. Enhance the portrait in a premium editorial style.`.trim(),
    `Keep the exact same person, exact same face, exact same identity. Enhance the portrait in a premium editorial style.`.trim(),
    `Keep the exact same person, exact same face, exact same identity. Enhance the portrait in a premium editorial style.`.trim(),
  ];
}

function getStyleCardNegativePrompt(templateKey: string) {
  if (templateKey === "anime") {
    return `
different person, different identity, male, man, masculine face,
distorted face, deformed face, blurry, low quality, duplicate character,
extra fingers, extra limbs, watermark, text, logo, photorealistic
`.trim();
  }

  return `
different person, different identity, male, man, masculine face,
distorted face, deformed face, blurry, low quality, duplicate person,
same outfit, same clothes, same background, same pose, unchanged original image,
extra fingers, extra limbs, watermark, text, logo
`.trim();
}

/* ================= cards couple black and white ================= */
export function getCouplePrompt(templateKey: string) {

  let scene = "";

  if (templateKey === "cheek") {
    scene = "woman kissing man's cheek, close romantic pose";
  }

  if (templateKey === "forehead") {
    scene = "forehead touching, eyes closed, intimate moment";
  }

  if (templateKey === "arms") {
    scene = "man holding woman from behind, strong embrace";
  }

  if (templateKey === "studio") {
    scene = "studio fashion pose, both facing camera, elegant posture";
  }

  if (templateKey === "car") {
    scene = "couple inside a car, candid romantic moment";
  }

  if (templateKey === "walk") {
    scene = "couple walking together, natural movement";
  }

  if (templateKey === "luxury") {
    scene = "luxury evening couple, elegant pose, high-end atmosphere";
  }

  return `
Create a black and white professional couple portrait with TWO people.

PERSON 1:
Use first uploaded face.

PERSON 2:
Use second uploaded face.

IMPORTANT:
- Do NOT merge faces
- Do NOT change gender

STYLE:
black and white, cinematic lighting, DSLR quality

FACE:
ultra detailed face, high skin detail, natural pores, sharp focus

Use the THIRD image as strict composition and pose reference.

FACE CONSISTENCY (VERY IMPORTANT):
- Keep both faces anatomically correct
- Eyes must be aligned and natural
- No distorted faces
- No duplicated facial features
- Preserve realistic skin texture

LIGHT MATCHING:
- Match lighting from reference image
- Same shadows and highlights
- Same contrast and exposure

REALISM:
- Photorealistic result
- No AI artifacts
- No plastic skin
- No blur on faces

IMPORTANT:
- Copy EXACT pose, camera angle, framing and composition from the reference image
- Do NOT invent a new pose
- Do NOT change scene
- Replace only the faces with the uploaded identities

This must look like the SAME photo but with different people.
`;
}
function getCoupleNegativePrompt() {
  return `
two faces merged, distorted face, deformed eyes, cross eyes,
duplicate face, extra face, bad anatomy, asymmetrical face,
blurry face, low quality skin, plastic skin,
extra fingers, extra limbs,
wrong lighting, inconsistent shadows,
different ethnicity, different identity,
text, watermark, logo
`.trim();
}

/* ================= EFFECTS PROMPTS ================= */

function getEffectPrompt(effect: string) {
  if (effect === "movie") {
    return `
Keep the exact same woman, exact same face, exact same identity, exact same ethnicity,
clearly recognizable as the same person.

Transform her into a powerful cinematic movie character.

IMPORTANT:
Completely remove original clothing.
Do NOT generate modern outfits.
Do NOT generate blazers, jackets, or casual clothes.

Create a strong movie costume such as:
- fantasy warrior armor
- cinematic heroine outfit
- epic battle costume
- dramatic high-budget movie wardrobe

Use a random cinematic setting each time such as:
burning battlefield, fantasy kingdom, dramatic ruins, luxury film set, dark cinematic hallway.

Ensure different outfit and scene every generation.

Lighting and style must be cinematic:
epic lighting, volumetric light, cinematic depth of field, dramatic shadows.

Shot style:
shot on 35mm film, movie still, high-budget production, ultra realistic.

The result must look like a real frame from a Hollywood movie.

Do not keep original clothes.
Do not keep original background.
Do not make it a normal portrait.
Do not make the subject male.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();
  }

  if (effect === "cyberpunk") {
    return `
Keep the exact same woman, exact same face, exact same identity, exact same ethnicity,
clearly recognizable as the same person.

Transform her into a futuristic cyberpunk character.

IMPORTANT:
Completely remove original clothing.
Do NOT generate modern casual outfits.

Create a strong cyberpunk outfit such as:
- futuristic jacket with neon details
- high-tech armor
- glowing accessories
- sci-fi fashion with holographic elements

Place her in a cyberpunk environment:
neon city, futuristic streets, glowing signs, night city, rain reflections.

Lighting and style:
neon lighting, glowing lights, reflections, cinematic shadows, high contrast.

Style must be:
ultra detailed, futuristic, cyberpunk aesthetic, high-end sci-fi movie.

Ensure different outfit and background every time.

Do not keep original clothes.
Do not keep original background.
Do not make it a normal portrait.
Do not make the subject male.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();
  }

  if (effect === "photorealistic") {
    return `
Keep the exact same woman, exact same face, exact same identity.

Enhance the image into a professional photorealistic portrait.

IMPORTANT:
Do NOT change identity.
Do NOT change outfit drastically.
Do NOT change environment completely.

Improve:
- skin quality (natural, not fake)
- lighting (soft professional lighting)
- sharpness and detail
- depth of field

Style:
ultra realistic, DSLR camera, studio quality, natural colors.

Optional:
slightly improve outfit styling but keep it realistic.

The result must look like a high-end professional photoshoot.

Do not make it look artificial.
Do not make it cartoon.
Do not change the person.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();
  }

  if (effect === "cartoon") {
    return `
Keep the exact same woman, preserving identity and facial structure,
but transform into a high-quality cartoon character.

IMPORTANT:
Do not keep realistic skin texture.
Do not generate photorealism.

Create a stylized cartoon version with:
- smooth skin
- big expressive eyes
- clean soft shading
- friendly and appealing look

Style:
Pixar-style, Disney-style, 3D cartoon, vibrant colors, soft lighting.

Outfit:
adapt outfit into cartoon style, colorful and stylized.

Background:
bright, warm, animated environment.

The result must look like a high-end animated movie character.

Do not generate realistic photo.
Do not distort identity too much.
Do not make the subject male.

Face quality:
ultra detailed face, high skin detail, natural pores, realistic skin texture, sharp focus, DSLR quality
`.trim();
  }

  return `
Keep the exact same woman, exact same face, exact same identity.
Change outfit and background only.
Do not make the subject male.
`.trim();
}

function getNegativePrompt() {
  return `
male, man, beard, mustache, masculine jaw, masculine face,
different person, different identity, different ethnicity,
low quality, blurry, distorted face, duplicate person,
extra fingers, extra limbs, bad anatomy, text, watermark, logo
`.trim();
}

/* ================= CALCIO PROMPTS ================= */

function getCalcioPrompt(opts: {
  archetypePrompt: string;
  scenePrompt: string;
}) {
  return `
Create a photorealistic World Cup 2026 football fan photo with EXACTLY TWO PEOPLE.

PERSON 1:
The uploaded person must remain clearly recognizable.
Preserve only the uploaded person's identity, face, eyes, nose, lips, skin tone, and overall facial structure.
Do not change the uploaded person's gender or identity.

IDENTITY LOCK:
The uploaded person's face must be used ONLY ONCE.
Do not reuse, duplicate, clone, or copy this face on any other person.
Only one person in the image can have this identity.

PERSON 2:
Add ONE professional MALE football player next to the uploaded person.
He must be clearly a man.
He must look like a world-famous elite football player.
He must have masculine facial structure, strong jawline, broad shoulders, athletic footballer body, premium realistic presence.
He must be a completely different identity from the uploaded person.
He must NOT look like her twin, sibling, clone, or female version.

IMPORTANT:
Do NOT create two women.
Do NOT create two similar faces.
Do NOT feminize the football player.
Do NOT create two copies of the same person.

COMPOSITION:
The image must look like a real fan moment during World Cup 2026.
Use a wider framing with much more visible stadium environment.
Do NOT make it a beauty portrait.
Do NOT make it a close-up selfie with only faces.

SCENE REFERENCE GOAL:
If the scene is campo, the framing should feel like a real fan photo near the pitch/border of the stadium, with open field and strong stadium visibility.
If the scene is panchina, the framing should feel like a realistic bench-side or seat-side moment, with both people visible and the stadium atmosphere around them.
If the scene is tunnel, the framing should feel like a realistic pre-match stadium tunnel moment, cinematic but believable, with visible tunnel depth and sports atmosphere.

STADIUM ENVIRONMENT:
The scene must clearly happen inside a large World Cup 2026 football stadium.
Show:
- stadium seating
- crowd
- football pitch or bench area or tunnel depending on scene
- realistic match atmosphere
- more background visibility
Do NOT blur the stadium too much.

STYLE GOAL:
The result must look like a real sports photo, not a fashion portrait, not a beauty photoshoot, not an AI poster.
It must feel like a believable fan moment captured during a real football event.

FOOTBALL LOOK:
The football player must wear the correct national team style jersey and realistic professional match outfit based on the selected archetype.
The jersey colors must match the country correctly.
The football player must look like a real professional national-team player.

ARCHETYPE:
${opts.archetypePrompt}

SCENE:
${opts.scenePrompt}
`.trim();
}

function getCalcioNegativePrompt() {
  return `
two women, two girls, female football player, same face, same identity, clone, twin, sisters,
duplicate face, copied face, mirrored face, similar female face,
beauty portrait, glamour portrait, fashion editorial, studio portrait,
close-up only, face close-up, portrait crop, shallow background only,
blurred stadium, no stadium, missing pitch, missing crowd,
extra people, third person, child, deformed face, blurry face, bad anatomy
`.trim();
}

/* ================= SHARED FAL HELPER ================= */

async function uploadBase64ToFal(imageBase64: string) {
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  let inputBuffer: Buffer;

  try {
    inputBuffer = Buffer.from(cleanBase64, "base64");
  } catch {
    throw new Error("Invalid base64 image");
  }

  if (!inputBuffer || inputBuffer.length < 1000) {
    throw new Error("Image buffer too small / invalid");
  }

  const metadata = await sharp(inputBuffer).metadata();

  if (!metadata.format) {
    throw new Error("Unsupported image format");
  }

  const jpegBuffer = await sharp(inputBuffer)
    .rotate()
    .jpeg({ quality: 95 })
    .toBuffer();

  const blob = new Blob([jpegBuffer], { type: "image/jpeg" });

  const uploaded = await (fal.storage.upload as any)(blob);

  return uploaded;
}

/* ================= EFFECTS AI CREATE ================= */
export async function restyleImage(imageBase64: string, effect: string) {
  console.log("RESTYLE START");
  console.log("RESTYLE EFFECT =", effect);

  const prompt = getEffectPrompt(effect);
  const negativePrompt = getNegativePrompt();

  const uploadedUrl = await uploadBase64ToFal(imageBase64);
  console.log("FAL STORAGE URL =", uploadedUrl);

  try {
    const result = await fal.subscribe("fal-ai/flux-pulid", {
      input: {
        prompt,
        reference_image_url: uploadedUrl,
        image_size: "portrait_16_9",
        num_inference_steps: 28,
        guidance_scale: 4.5,
        negative_prompt: negativePrompt,
        id_weight: 0.9,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          for (const log of update.logs ?? []) {
            console.log("FAL LOG:", log.message);
          }
        }
      },
    } as any);

    console.log("FAL RAW RESULT =", JSON.stringify(result, null, 2));

    const data: any = result?.data;
    const finalUrl = data?.images?.[0]?.url ?? null;

    if (!finalUrl) {
      console.error("FAL RAW DATA =", JSON.stringify(data, null, 2));
      throw new Error("fal did not return a valid image URL");
    }

    return finalUrl;
  } catch (err: any) {
    console.error("FAL FULL ERROR =", JSON.stringify(err, null, 2));
    throw err;
  }
}

/* ================= STYLE CARDS CREATE================= */
export async function restyleStyleCardImage(opts: {
  imageBase64: string;
  prompt: string;
  templateKey?: string;
}) {
  console.log("STYLE CARD RESTYLE START");
  console.log("STYLE CARD TEMPLATE =", opts.templateKey || "unknown");

  const uploadedUrl = await uploadBase64ToFal(opts.imageBase64);
  console.log("STYLE CARD FAL STORAGE URL =", uploadedUrl);

  try {
    const result = await fal.subscribe("fal-ai/flux-pulid", {
      input: {
  prompt: opts.prompt,
  reference_image_url: uploadedUrl,
  image_size: "portrait_16_9",
  num_inference_steps: 32,
  guidance_scale: 4.2,
  negative_prompt: getStyleCardNegativePrompt(String(opts.templateKey || "")),
  id_weight: 0.9,
  enable_safety_checker: true,
},

      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          for (const log of update.logs ?? []) {
            console.log("STYLE CARD FAL LOG:", log.message);
          }
        }
      },
    } as any);

    console.log("STYLE CARD FAL RAW RESULT =", JSON.stringify(result, null, 2));

    const data: any = result?.data;
    const finalUrl = data?.images?.[0]?.url ?? null;

    if (!finalUrl) {
      console.error("STYLE CARD FAL RAW DATA =", JSON.stringify(data, null, 2));
      throw new Error("fal did not return a valid style card image URL");
    }

    return finalUrl;
  } catch (err: any) {
    console.error("STYLE CARD FAL FULL ERROR =", JSON.stringify(err, null, 2));
    throw err;
  }
}

/* ================= CALCIO ================= */

export async function restyleCalcioImage(opts: {
  imageBase64: string;
  archetypePrompt: string;
  scenePrompt: string;
}) {
  console.log("CALCIO RESTYLE START");

  const prompt = getCalcioPrompt({
    archetypePrompt: opts.archetypePrompt,
    scenePrompt: opts.scenePrompt,
  });

  const negativePrompt = getCalcioNegativePrompt();

  const uploadedUrl = await uploadBase64ToFal(opts.imageBase64);
  console.log("CALCIO FAL STORAGE URL =", uploadedUrl);

  try {
    const result = await fal.subscribe("fal-ai/flux-pulid", {
      input: {
        prompt,
        reference_image_url: uploadedUrl,
        image_size: "portrait_16_9",
        num_inference_steps: 28,
        guidance_scale: 4.5,
        negative_prompt: negativePrompt,
        id_weight: 0.82,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          for (const log of update.logs ?? []) {
            console.log("CALCIO FAL LOG:", log.message);
          }
        }
      },
    } as any);

    console.log("CALCIO FAL RAW RESULT =", JSON.stringify(result, null, 2));

    const data: any = result?.data;
    const finalUrl = data?.images?.[0]?.url ?? null;

    if (!finalUrl) {
      console.error("CALCIO FAL RAW DATA =", JSON.stringify(data, null, 2));
      throw new Error("fal did not return a valid calcio image URL");
    }

    return finalUrl;
  } catch (err: any) {
    console.error("CALCIO FAL FULL ERROR =", JSON.stringify(err, null, 2));
    throw err;
  }
}