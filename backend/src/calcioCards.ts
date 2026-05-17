// backend/src/calcioCards.ts

// ================= TYPES =================

export type CalcioCard = {
  id: string;

  title: string;

  subtitle: string;

  prompt: string;
};

// ================= CARDS =================

export const CALCIO_ARCHETYPES_CARDS: CalcioCard[] = [
  // ================= ARGENTINA =================

  {
    id: "arg_selfie",

    title: "Argentina Superstar",

    subtitle: "Selfie bordo campo",

    prompt: `
Ultra realistic football selfie photo.

A young woman taking a selfie beside an Argentina football superstar at stadium side.

Preserve the uploaded person's:
- facial identity
- face shape
- skin tone
- hairstyle

The final image must look:
- authentic
- naturally photographed
- iphone selfie
- sports photography
- same lighting
- same camera lens
- same skin texture
- same depth of field

The football player and user must feel truly together in the same scene.

Natural candid moment.
Ultra realistic.
No CGI.
No cartoon.
No fake face.
`,
  },

  {
    id: "arg2_selfie",

    title: "Argentina Matchday",

    subtitle: "VIP selfie",

    prompt: `
Ultra realistic VIP football selfie.

A woman taking a selfie beside an Argentina football superstar during matchday.

Preserve the uploaded user's:
- facial identity
- skin tone
- hairstyle
- realistic facial details

Authentic stadium atmosphere.
Natural lighting.
Realistic iphone selfie.
Same camera perspective.
Natural sports photography.

Both subjects must look naturally photographed together.

No CGI.
No 3D render.
No cartoon.
`,
  },

  // ================= BRAZIL =================

  {
    id: "bra_selfie",

    title: "Brazil Bench Selfie",

    subtitle: "Selfie calcistico",

    prompt: `
Ultra realistic football bench selfie.

A young woman beside a Brazil football superstar near the team bench.

Preserve the uploaded person's:
- facial identity
- realistic face
- hairstyle
- skin tone

The final image must feel:
- naturally photographed
- authentic
- realistic
- candid

Real smartphone selfie.
Natural stadium lighting.
Same camera lens.
Realistic sports photography.

No fake face.
No CGI.
No cartoon.
`,
  },

  {
    id: "bra2_selfie",

    title: "Brazil Superstar",

    subtitle: "Pitch-side selfie",

    prompt: `
Ultra realistic football selfie beside a Brazil superstar.

A stylish woman taking a selfie near the football pitch before the match.

Preserve the uploaded user's:
- identity
- skin tone
- hairstyle
- facial structure

Authentic Brazilian football atmosphere.
Natural lighting.
Realistic skin texture.
Real iphone selfie look.

The image must look naturally photographed together.

No CGI.
No cartoon.
No 3D render.
`,
  },

  {
    id: "bra3_selfie",

    title: "Brazil Victory Cam",

    subtitle: "Post match selfie",

    prompt: `
Ultra realistic post-match football selfie.

A woman celebrating beside a Brazil football superstar after victory.

Preserve:
- facial identity
- face shape
- hairstyle
- skin tone

Authentic sports atmosphere.
Natural candid selfie.
Realistic stadium lighting.
Same camera perspective.
Real sports photography.

Both people must feel truly together.

No CGI.
No fake face.
No cartoon.
`,
  },

  // ================= COLOMBIA =================

  {
    id: "col_selfie",

    title: "Colombia Matchday",

    subtitle: "Atmosfera stadio",

    prompt: `
Ultra realistic Colombia football selfie.

A young woman taking a selfie beside a Colombia football superstar during matchday.

Preserve the uploaded user's:
- facial identity
- hairstyle
- skin tone
- realistic face proportions

Natural stadium atmosphere.
Authentic football photography.
Realistic lighting.
Natural skin texture.

Both subjects must look naturally together.

No cartoon.
No CGI.
No 3D.
`,
  },

  {
    id: "col2_selfie",

    title: "Colombia Superstar",

    subtitle: "VIP stadium selfie",

    prompt: `
Ultra realistic VIP stadium selfie.

A woman beside a Colombia football superstar inside a crowded stadium.

Preserve the uploaded person's:
- facial identity
- hairstyle
- realistic face details
- skin tone

The image must look:
- authentic
- naturally photographed
- cinematic
- realistic

Real smartphone selfie.
Natural stadium lighting.
Same depth of field.

No fake face.
No cartoon.
`,
  },

  {
    id: "col3_selfie",

    title: "Colombia Victory",

    subtitle: "Post match selfie",

    prompt: `
Ultra realistic football victory selfie.

A happy woman taking a selfie beside a Colombia football superstar after the match.

Preserve the uploaded user's:
- facial identity
- hairstyle
- skin tone
- facial realism

Authentic football celebration atmosphere.
Natural lighting.
Realistic sports photography.
Same camera perspective.

No CGI.
No cartoon.
No fake face.
`,
  },

  // ================= ENGLAND =================

  {
    id: "eng_selfie",

    title: "England Superstar",

    subtitle: "VIP stadium selfie",

    prompt: `
Ultra realistic English football selfie.

A stylish woman beside an England football superstar inside a premium stadium area.

Preserve the uploaded user's:
- facial identity
- face shape
- hairstyle
- skin tone

Realistic iphone selfie.
Authentic football atmosphere.
Natural lighting.
Real sports photography.

Both subjects must feel naturally photographed together.

No CGI.
No cartoon.
No fake face.
`,
  },

  // ================= FRANCE =================

  {
    id: "fra_selfie",

    title: "France Victory Selfie",

    subtitle: "Post match moment",

    prompt: `
Ultra realistic France football selfie.

A woman celebrating beside a France football superstar after victory.

Preserve the uploaded person's:
- facial identity
- hairstyle
- skin tone
- realistic face details

Natural sports photography.
Authentic celebration atmosphere.
Realistic lighting.
Natural skin texture.

The image must feel candid and real.

No CGI.
No fake face.
No cartoon.
`,
  },

  // ================= PORTUGAL =================

  {
    id: "por_selfie",

    title: "Portugal Tunnel Cam",

    subtitle: "Pre-match selfie",

    prompt: `
Cinematic football tunnel selfie.

A stylish young woman taking a selfie beside a Portugal football superstar before the match.

Preserve the uploaded user's:
- facial identity
- face shape
- hairstyle
- skin tone

The final image must look:
- naturally photographed
- realistic
- cinematic
- authentic
- iphone selfie quality

Same camera lens.
Same lighting.
Same skin texture.

No fake face.
No CGI.
No cartoon.
`,
  },

  // ================= SPAIN =================

  {
    id: "spa_selfie",

    title: "Spain Matchday",

    subtitle: "Pitch-side selfie",

    prompt: `
Ultra realistic Spain football selfie.

A woman taking a selfie beside a Spain football superstar near the football pitch.

Preserve the uploaded person's:
- facial identity
- hairstyle
- skin tone
- realistic face proportions

Authentic sports atmosphere.
Natural lighting.
Realistic iphone selfie.
Natural skin texture.
Same camera perspective.

Both people must feel naturally together.

No cartoon.
No CGI.
No fake face.
`,
  },
];

// ================= MAP =================

export const CALCIO_ARCHETYPES_MAP = Object.fromEntries(
  CALCIO_ARCHETYPES_CARDS.map((card) => [
    card.id,
    card,
  ])
) as Record<string, CalcioCard>;