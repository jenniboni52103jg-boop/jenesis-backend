// app/(tabs)/services/calcioPrompts.ts

export const BASE_PROMPT = `
Ultra realistic photograph.
The user’s face is preserved accurately and naturally.
Correct anatomy, realistic hands, correct proportions.
Same height scale between user and football player.
Professional sports photography.
Natural skin texture.
No logos, no text, no watermark.
`;

export const PRESETS = {
  cinematic: `
cinematic lighting, dramatic shadows,
film grain, stadium lights glow,
cinematic color grading, 85mm lens
`,
  realistic: `
natural daylight, true-to-life colors,
DSLR sports photography, 50mm lens
`,
  social: `
bright colors, clean lighting,
high clarity, instagram-ready, 35mm lens
`
};

export const CALCIO_PLAYERS = {
  Messi: "Lionel Messi, Argentine football player, short height, athletic build, beard",
  Ronaldo: "Cristiano Ronaldo, Portuguese football player, tall, muscular, sharp jawline",
  Mbappe: "Kylian Mbappé, French football player, athletic build, short hair"
};

export const SCENES = [
  "sitting together on the football bench, stadium background",
  "walking side by side inside the stadium tunnel before a match",
  "celebrating a goal together on the pitch, action shot",
  "inside the locker room after the match, candid moment"
];