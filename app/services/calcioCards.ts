export type CalcioSceneKey = "campo" | "tunnel" | "panchina";

export type CalcioCard = {
  id: string;
  title: string;
  subtitle: string;
  archetypeKey: string;
  presetKey: string;
  image: any;
  basePrompt: string;
  scenes: {
    campo: string;
    tunnel: string;
    panchina: string;
  };
};

export const CALCIO_ARCHETYPES_CARDS = [
  {
    id: "arg_compact_playmaker",
    title: "Argentina – Playmaker compatto",
    subtitle: "Selfie a bordo campo",
    archetypeKey: "arg_compact_playmaker",
    presetKey: "realistic",
    image: require("../../assets/explorer/arg_explorer.jpg"),

    basePrompt:
      "A photorealistic selfie with the uploaded person and a professional football playmaker, both looking natural and confident, premium sports photography, realistic skin texture, authentic proportions, social-media-ready result.",

    scenes: {
      campo:
        "On a football pitch after the match, stadium lights, realistic sports atmosphere, natural perspective, close selfie framing.",
      tunnel:
        "Inside a football stadium tunnel before a match, dramatic sports lighting, realistic depth, natural selfie composition.",
      panchina:
        "Sitting on the bench inside a football stadium, relaxed sports atmosphere, realistic environment, believable selfie angle.",
    },
  },

  {
    id: "col_strong_striker",
    title: "Colombia – Attaccante potente",
    subtitle: "Tunnel pre-partita",
    archetypeKey: "col_strong_striker",
    presetKey: "cinematic",
    image: require("../../assets/explorer/col_explorer.jpg"),

    basePrompt:
      "A photorealistic selfie with the uploaded person and a powerful professional football striker, strong athletic presence, natural facial expressions, premium sports photography, realistic skin texture, authentic body proportions, dynamic but believable result.",

    scenes: {
      campo:
        "On a football pitch before kickoff, energetic stadium atmosphere, realistic lighting, close and natural selfie framing.",
      tunnel:
        "Inside a football stadium tunnel before the match, cinematic sports lighting, intense pre-match mood, realistic selfie composition.",
      panchina:
        "Near the team bench in a stadium, strong sports atmosphere, realistic environment, natural close selfie perspective.",
    },
  },

  {
    id: "bra_skills_winger",
    title: "Brazil – Ala tecnica",
    subtitle: "Panchina relax",
    archetypeKey: "bra_skills_winger",
    presetKey: "social",
    image: require("../../assets/explorer/bra_explorer.jpg"),

    basePrompt:
      "A photorealistic selfie with the uploaded person and a skillful professional football winger, relaxed and charismatic vibe, modern social-media sports look, realistic skin details, natural proportions, warm and believable expression.",

    scenes: {
      campo:
        "On a football field during a relaxed training or post-match moment, bright stadium setting, realistic sports environment, selfie perspective.",
      tunnel:
        "Inside a football stadium tunnel, stylish but realistic sports atmosphere, clean lighting, natural selfie composition.",
      panchina:
        "Sitting on the bench in a football stadium, relaxed and friendly sports mood, realistic environment, close selfie framing.",
    },
  },

  {
    id: "por_skills_winger",
    title: "Portogallo – Ala tecnica",
    subtitle: "Panchina relax",
    archetypeKey: "por_skills_winger",
    presetKey: "social",
    image: require("../../assets/explorer/por_explorer.jpg"),

    basePrompt:
      "A photorealistic selfie with the uploaded person and a technical professional football winger, elegant sporty charisma, realistic facial details, premium social-media sports style, natural body proportions, clean and believable result.",

    scenes: {
      campo:
        "On a football pitch in a premium stadium atmosphere, realistic sports environment, flattering natural light, selfie camera framing.",
      tunnel:
        "Inside a football stadium tunnel before the match, polished sports lighting, realistic perspective, stylish but believable selfie look.",
      panchina:
        "On the stadium bench in a calm pre-match moment, realistic sports setting, relaxed and polished selfie composition.",
    },
  },

  {
    id: "fra_skills_winger",
    title: "Francia – Ala tecnica",
    subtitle: "Panchina relax",
    archetypeKey: "fra_skills_winger",
    presetKey: "social",
    image: require("../../assets/explorer/fra_explorer.jpg"),

    basePrompt:
      "A photorealistic selfie with the uploaded person and a stylish professional football winger, modern athletic energy, premium sports photography, realistic skin texture, natural facial expression, believable proportions, social-ready result.",

    scenes: {
      campo:
        "On a football pitch in a large stadium, realistic sports mood, natural lighting, close selfie framing with believable perspective.",
      tunnel:
        "Inside a football stadium tunnel, modern dramatic sports lighting, realistic details, premium selfie composition.",
      panchina:
        "Relaxed moment on the stadium bench, realistic sports background, friendly and modern atmosphere, natural selfie angle.",
    },
  },
] as const;