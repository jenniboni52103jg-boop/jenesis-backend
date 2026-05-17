// app/services/calcioCards.ts

// ================= TYPES =================

export type CalcioCard = {
  id: string;

  title: string;

  subtitle: string;

  preview: any;

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

    prompt: `
Realistic football selfie with the uploaded user beside the football player.

Ultra realistic smartphone photography.
Natural stadium lighting.
Authentic football atmosphere.
Natural skin texture.
Realistic proportions.
`,
  },

  {
    id: "arg2_selfie",

    title: "Argentina Matchday",
    subtitle: "VIP selfie",

    preview: require("../../assets/explorer/arg2_preview.jpg"),

    prompt: `
Realistic VIP football selfie beside the football player.

Authentic Argentina stadium atmosphere.
Natural lighting.
Realistic skin texture.
High-end sports photography.
`,
  },

  // ================= BRAZIL =================

  {
    id: "bra_selfie",

    title: "Brazil Bench Selfie",
    subtitle: "Selfie calcistico",

    preview: require("../../assets/explorer/bra_preview.jpg"),

    prompt: `
Realistic football selfie on the bench beside the football player.

Natural smartphone camera look.
Realistic lighting.
Authentic sports atmosphere.
`,
  },

  {
    id: "bra2_selfie",

    title: "Brazil Superstar",
    subtitle: "Pitch-side selfie",

    preview: require("../../assets/explorer/bra2_preview.jpg"),

    prompt: `
Realistic Brazilian football selfie beside the football player.

Natural facial identity.
Authentic stadium lighting.
Ultra realistic sports photography.
`,
  },

  {
    id: "bra3_selfie",

    title: "Brazil Victory Cam",
    subtitle: "Post match selfie",

    preview: require("../../assets/explorer/bra3_preview.jpg"),

    prompt: `
Authentic football victory selfie beside the football player.

Realistic stadium crowd.
Natural lighting.
Real smartphone photography look.
`,
  },

  // ================= COLOMBIA =================

  {
    id: "col_selfie",

    title: "Colombia Matchday",
    subtitle: "Atmosfera stadio",

    preview: require("../../assets/explorer/col_preview.jpg"),

    prompt: `
Realistic Colombia football selfie beside the football player.

Natural sports atmosphere.
Authentic lighting.
Realistic selfie composition.
`,
  },

  {
    id: "col2_selfie",

    title: "Colombia Superstar",

    subtitle: "VIP stadium selfie",

    preview: require("../../assets/explorer/col2_preview.jpg"),

    prompt: `
VIP Colombian football selfie beside the football player.

Natural identity preservation.
Realistic stadium environment.
Authentic sports photography.
`,
  },

  {
    id: "col3_selfie",

    title: "Colombia Victory",

    subtitle: "Post match selfie",

    preview: require("../../assets/explorer/col3_preview.jpg"),

    prompt: `
Authentic football victory selfie.

Natural lighting.
Realistic sports photography.
Ultra realistic smartphone selfie.
`,
  },

  // ================= ENGLAND =================

  {
    id: "eng_selfie",

    title: "England Superstar",

    subtitle: "VIP stadium selfie",

    preview: require("../../assets/explorer/eng_preview.jpg"),

    prompt: `
Realistic English football selfie beside the football player.

Authentic stadium atmosphere.
Natural skin texture.
Realistic selfie perspective.
`,
  },

  // ================= FRANCE =================

  {
    id: "fra_selfie",

    title: "France Victory Selfie",

    subtitle: "Post match moment",

    preview: require("../../assets/explorer/fra_preview.jpg"),

    prompt: `
Authentic French football victory selfie.

Natural facial details.
Realistic proportions.
Post-match atmosphere.
`,
  },

  // ================= PORTUGAL =================

  {
    id: "por_selfie",

    title: "Portugal Tunnel Cam",

    subtitle: "Pre-match selfie",

    preview: require("../../assets/explorer/por_preview.jpg"),

    prompt: `
Realistic Portugal tunnel selfie beside the football player.

Cinematic sports lighting.
Authentic pre-match atmosphere.
Natural photography look.
`,
  },

  // ================= SPAIN =================

  {
    id: "spa_selfie",

    title: "Spain Matchday",

    subtitle: "Pitch-side selfie",

    preview: require("../../assets/explorer/spa_preview.jpg"),

    prompt: `
Realistic Spanish football selfie beside the football player.

Natural stadium atmosphere.
Authentic sports lighting.
Realistic smartphone photography.
`,
  },
];

// ================= MAP =================

export const CALCIO_ARCHETYPES_MAP = Object.fromEntries(
  CALCIO_ARCHETYPES_CARDS.map((card) => [card.id, card])
) as Record<string, CalcioCard>;