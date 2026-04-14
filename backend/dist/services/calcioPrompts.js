"use strict";
// app/(tabs)/services/calcioPrompts.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCENES_3 = exports.CALCIO_ARCHETYPES = exports.PRESETS = exports.NEGATIVE_PROMPT = exports.BASE_PROMPT = void 0;
exports.buildCalcioPrompt = buildCalcioPrompt;
/**
 * NOTE IMPORTANTI:
 * - Niente nomi di persone reali, soprannomi, numeri iconici o riferimenti riconoscibili.
 * - Solo "archetype" generici.
 * - Maglie solo con colori generici, NO loghi, badge, sponsor, scritte.
 * - Questo prompt è scritto per SELFIE REALISTICI: utente + calciatore archetipico.
 */
exports.BASE_PROMPT = `
Ultra-realistic smartphone selfie photo, documentary sports photography, natural candid moment.

IMPORTANT COMPOSITION:
Exactly two people in the image:
1) the user from the uploaded reference photo
2) one professional football player archetype standing or sitting close to the user

IDENTITY PRESERVATION:
The uploaded user must remain clearly the same person.
Preserve the user's real facial identity, facial structure, skin tone, age appearance, hairstyle, eye area, nose, lips, and overall likeness.
Do not beautify excessively.
Do not glamorize the face.
Do not turn the user into a fashion model.
Do not change gender presentation.
Do not change ethnicity.
Do not replace the face.
Do not generate a different person.
Do not create a celebrity-style beauty portrait.

SELFIE RULES:
The result must look like a real selfie or casual phone photo.
Natural arm-length framing or close candid framing.
Both people must be visible in the same shot.
The football player must be clearly next to the user, interacting naturally.
Realistic body proportions, realistic distance, realistic height scale.
Natural facial expression, natural posture, natural skin texture, pores, subtle imperfections.

FOOTBALL PLAYER RULES:
The football player must be a generic fictional professional athlete archetype.
Not a real person, not recognizable, not a look-alike of any celebrity or athlete.
Sportswear must be generic, with national color inspiration only.
No logos, no badges, no sponsors, no text.

IMAGE QUALITY:
Realistic lighting, believable shadows, correct anatomy, realistic hands, correct fingers, realistic background depth.
Clean sports environment details.
No text, no watermark, no AI artifacts.
`;
exports.NEGATIVE_PROMPT = `
real person, celebrity, famous football player, recognizable athlete, look-alike,
beauty editorial portrait, glamour portrait, fashion campaign, luxury makeup,
different person, changed identity, face replacement, altered ethnicity, altered age,
logo, badge, sponsor, text, watermark, signature,
deformed hands, extra fingers, missing fingers, bad anatomy, wrong proportions,
duplicate face, multiple faces, extra limbs, uncanny face,
over-smoothed skin, plastic skin, waxy skin, ai artifacts,
blurry face, blurry eyes, asymmetrical eyes, distorted mouth,
single person only, football player missing, user missing
`;
exports.PRESETS = {
    cinematic: `
cinematic natural stadium lighting, realistic contrast,
subtle film grain, soft stadium glow,
cinematic but believable color grading,
smartphone photo realism, shallow depth of field only if natural
`,
    realistic: `
natural daylight, true-to-life colors,
real phone camera photo, crisp realistic detail,
documentary realism, balanced exposure
`,
    social: `
bright clean lighting, realistic clarity,
modern smartphone social photo,
slightly polished but still natural and believable
`,
};
/**
 * Archetypes sicuri:
 * - descrittori comuni e non identificanti
 * - nazionalità OK
 * - nessun riferimento iconico
 */
exports.CALCIO_ARCHETYPES = {
    // ===== ARGENTINA =====
    arg_compact_playmaker: `
Argentine professional football player archetype,
short-to-average height, compact athletic build,
short dark brown hair, subtle trimmed beard optional,
friendly calm expression,
wearing a light blue and white striped football shirt, no logos
`,
    arg_tall_centerback: `
Argentine professional football player archetype,
tall strong athletic build, broad shoulders,
short dark hair, clean-shaven,
serious focused expression,
wearing a light blue and white football shirt, no logos
`,
    // ===== PORTUGAL =====
    por_power_forward: `
Portuguese professional football player archetype,
tall muscular athletic build,
short dark hair, defined facial features but generic,
confident game-face expression,
wearing a red and green football shirt, no logos
`,
    // ===== FRANCE =====
    fra_speedy_striker: `
French professional football player archetype,
athletic fast-striker physique,
short hair, clean-shaven,
focused expression,
wearing a dark blue football shirt, no logos
`,
    // ===== BRAZIL =====
    bra_skills_winger: `
Brazilian professional football player archetype,
lean athletic build, agile winger physique,
short curly or wavy dark hair,
relaxed friendly smile,
wearing a yellow football shirt with green accents, no logos
`,
    // ===== SPAIN =====
    esp_midfield_maestro: `
Spanish professional football player archetype,
average height, athletic build,
short brown hair,
calm intelligent expression,
wearing a red football shirt, no logos
`,
    // ===== ITALY =====
    ita_defensive_fullback: `
Italian professional football player archetype,
compact strong athletic build,
short dark hair, light stubble optional,
focused expression,
wearing a blue football shirt, no logos
`,
    // ===== COLOMBIA =====
    col_creative_playmaker: `
Colombian professional football player archetype,
average height, athletic build,
short black hair, warm friendly smile,
expressive eyes,
wearing a yellow football shirt with blue and red accents, no logos
`,
    col_explosive_winger: `
Colombian professional football player archetype,
lean athletic build, quick winger physique,
short dark hair with subtle fade,
energetic expression,
wearing a yellow football shirt, no logos
`,
    col_strong_striker: `
Colombian professional football player archetype,
strong athletic build, powerful striker physique,
short dark hair, clean-shaven,
determined expression,
wearing a yellow football shirt, no logos
`,
};
/**
 * Scene più forti e più chiare:
 * - sempre 2 persone
 * - sempre utente + calciatore vicini
 * - sempre framing da selfie / casual photo
 */
exports.SCENES_3 = [
    "the user taking a casual selfie together with the football player near the pitch sideline, both faces visible, stadium in the background, daytime, natural candid sports atmosphere",
    "the user standing side by side with the football player inside the stadium tunnel before the match, close selfie-style framing, both people clearly visible, realistic pre-match atmosphere",
    "the user sitting next to the football player on the bench, relaxed pre-match vibe, both subjects visible in the same shot, natural candid smartphone photo, stadium background",
];
function buildCalcioPrompt(opts) {
    const archetype = exports.CALCIO_ARCHETYPES[opts.archetypeKey];
    const preset = exports.PRESETS[opts.presetKey];
    return `
${exports.BASE_PROMPT}

SCENE:
${opts.scene}

FOOTBALL PLAYER ARCHETYPE:
${archetype}

STYLE PRESET:
${preset}

STRICT INSTRUCTIONS:
Keep the uploaded user identity accurate.
Do not change the person into a different woman or man.
Do not create a solo portrait.
Show both the user and the football player together in one believable photo.
The football player must be next to the user, not far away.
The image must feel like a real smartphone selfie or casual fan moment.
The user should remain natural, realistic, and recognizable.

${opts.extra ? `EXTRA NOTES:\n${opts.extra}\n` : ""}
`.trim();
}
