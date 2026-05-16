// app/services/calcioCards.ts

// ================= TYPES =================

export type CalcioCard = {
  id: string;

  title: string;

  subtitle: string;

  preview: any;

  templateImage: any;

  maskImage: any;

  prompt: string;
};

// ================= CARDS =================

export const CALCIO_ARCHETYPES_CARDS: CalcioCard[] = [
  // ================= ARGENTINA =================

  {
    id: "arg_selfie",

    title: "Argentina Superstar",
    subtitle: "Selfie bordo campo",

    preview: require("../../assets/explorer/arg_preview.jpg"),

    templateImage: require("../../assets/calcio/arg_template.png"),

    maskImage: require("../../assets/calcio/arg_mask.png"),

    prompt: `
Preserve the football player,
stadium, lighting and selfie composition.

Replace only the fan beside the player
with the uploaded user.

Realistic smartphone selfie.
Authentic football atmosphere.
Natural skin texture and realistic proportions.
`,
  },

  {
    id: "arg2_selfie",

    title: "Argentina Matchday",
    subtitle: "VIP selfie",

    preview: require("../../assets/explorer/arg2_preview.jpg"),

    templateImage: require("../../assets/calcio/arg2_template.png"),

    maskImage: require("../../assets/calcio/arg2_mask.png"),

    prompt: `
Keep the football player,
stadium environment and selfie framing unchanged.

Replace only the supporter beside the player
with the uploaded user.

Realistic football selfie.
Authentic Argentina stadium atmosphere.
`,
  },

  // ================= BRAZIL =================

  {
    id: "bra_selfie",

    title: "Brazil Bench Selfie",
    subtitle: "Selfie calcistico",

    preview: require("../../assets/explorer/bra_preview.jpg"),

    templateImage: require("../../assets/calcio/bra_template.png"),

    maskImage: require("../../assets/calcio/bra_mask.png"),

    prompt: `
Keep the football player,
bench environment and stadium details unchanged.

Replace only the fan beside the player
with the uploaded user.

Natural smartphone selfie look.
Realistic lighting and skin texture.
`,
  },

  {
    id: "bra2_selfie",

    title: "Brazil Superstar",
    subtitle: "Pitch-side selfie",

    preview: require("../../assets/explorer/bra2_preview.jpg"),

    templateImage: require("../../assets/calcio/bra2_template.png"),

    maskImage: require("../../assets/calcio/bra2_mask.png"),

    prompt: `
Preserve the football player,
stadium lighting and football atmosphere.

Replace only the supporter area
with the uploaded user.

Realistic Brazilian football selfie.
Natural facial identity and skin texture.
`,
  },

  {
    id: "bra3_selfie",

    title: "Brazil Victory Cam",
    subtitle: "Post match selfie",

    preview: require("../../assets/explorer/bra3_preview.jpg"),

    templateImage: require("../../assets/calcio/bra3_template.png"),

    maskImage: require("../../assets/calcio/bra3_mask.png"),

    prompt: `
Keep the football player,
stadium crowd and sports atmosphere intact.

Replace only the fan beside the player
with the uploaded user.

Authentic football selfie.
Realistic proportions and lighting.
`,
  },

  // ================= COLOMBIA =================

  {
    id: "col_selfie",

    title: "Colombia Matchday",
    subtitle: "Atmosfera stadio",

    preview: require("../../assets/explorer/col_preview.jpg"),

    templateImage: require("../../assets/calcio/col_template.png"),

    maskImage: require("../../assets/calcio/col_mask.png"),

    prompt: `
Preserve the football player,
stadium and lighting exactly.

Replace only the supporter/fan area
with the uploaded user.

Realistic football selfie.
Natural sports atmosphere.
`,
  },

  {
    id: "col2_selfie",

    title: "Colombia Superstar",

    subtitle: "VIP stadium selfie",

    preview: require("../../assets/explorer/col2_preview.jpg"),

    templateImage: require("../../assets/calcio/col2_template.png"),

    maskImage: require("../../assets/calcio/col2_mask.png"),

    prompt: `
Keep the football player,
stadium environment and lighting unchanged.

Replace only the fan beside the player
with the uploaded user.

Realistic Colombian football selfie.
Natural skin texture and identity preservation.
`,
  },

  {
    id: "col3_selfie",

    title: "Colombia Victory",

    subtitle: "Post match selfie",

    preview: require("../../assets/explorer/col3_preview.jpg"),

    templateImage: require("../../assets/calcio/col3_template.png"),

    maskImage: require("../../assets/calcio/col3_mask.png"),

    prompt: `
Preserve the football player,
match atmosphere and selfie framing.

Replace only the supporter area
with the uploaded user.

Authentic football selfie.
Realistic sports photography.
`,
  },

  // ================= ENGLAND =================

  {
    id: "eng_selfie",

    title: "England Superstar",

    subtitle: "VIP stadium selfie",

    preview: require("../../assets/explorer/eng_preview.jpg"),

    templateImage: require("../../assets/calcio/eng_template.png"),

    maskImage: require("../../assets/calcio/eng_mask.png"),

    prompt: `
Keep the football player,
stadium crowd and lighting unchanged.

Replace only the fan beside the football player
with the uploaded user.

Realistic smartphone selfie.
Authentic English football atmosphere.
Natural facial identity and realistic skin texture.
`,
  },

  // ================= FRANCE =================

  {
    id: "fra_selfie",

    title: "France Victory Selfie",

    subtitle: "Post match moment",

    preview: require("../../assets/explorer/fra_preview.jpg"),

    templateImage: require("../../assets/calcio/fra_template.png"),

    maskImage: require("../../assets/calcio/fra_mask.png"),

    prompt: `
Keep the football player,
stadium and match atmosphere intact.

Replace only the fan/supporter
with the uploaded user.

Realistic post-match smartphone selfie.
Natural facial details and realistic proportions.
`,
  },

  // ================= PORTUGAL =================

  {
    id: "por_selfie",

    title: "Portugal Tunnel Cam",

    subtitle: "Pre-match selfie",

    preview: require("../../assets/explorer/por_preview.jpg"),

    templateImage: require("../../assets/calcio/por_template.png"),

    maskImage: require("../../assets/calcio/por_mask.png"),

    prompt: `
Preserve the football player,
tunnel environment and cinematic lighting.

Replace only the fan area
with the uploaded user.

Realistic pre-match selfie.
Authentic sports photography.
`,
  },

  // ================= SPAIN =================

  {
    id: "spa_selfie",

    title: "Spain Matchday",

    subtitle: "Pitch-side selfie",

    preview: require("../../assets/explorer/spa_preview.jpg"),

    templateImage: require("../../assets/calcio/spa_template.png"),

    maskImage: require("../../assets/calcio/spa_mask.png"),

    prompt: `
Preserve the football player,
stadium environment and sports lighting.

Replace only the supporter area
with the uploaded user.

Realistic football selfie.
Natural Spanish matchday atmosphere.
`,
  },
];

// ================= MAP =================

export const CALCIO_ARCHETYPES_MAP = Object.fromEntries(
  CALCIO_ARCHETYPES_CARDS.map((card) => [card.id, card])
) as Record<string, CalcioCard>;