// ================= TYPES =================

export type CalcioSceneKey = "campo" | "tunnel" | "panchina";

export type CalcioCard = {
  id: string;
  title: string;
  subtitle: string;
  archetypeKey: string;
  presetKey: string;
  basePrompt: string;
  scenes: {
    campo: string;
    tunnel: string;
    panchina: string;
  };
};

// ================= CARDS =================

export const CALCIO_ARCHETYPES_CARDS: CalcioCard[] = [
  {
    id: "arg_compact_playmaker",
    title: "Argentina – Playmaker compatto",
    subtitle: "Selfie a bordo campo",
    archetypeKey: "arg_compact_playmaker",
    presetKey: "realistic",
   basePrompt: "A world-class male Argentine football star, realistic athletic build, premium professional footballer, handsome and masculine face, wearing a realistic Argentina national team style jersey with light blue and white stripes, elite sports presence, authentic match-day look, looks like a real famous football player",
    scenes: {
      campo:
        "On a football pitch after the match, stadium lights, realistic sports atmosphere, natural selfie perspective.",
      tunnel:
        "Inside a football stadium tunnel before a match, dramatic sports lighting, realistic environment.",
      panchina:
        "Sitting on the bench inside a football stadium, relaxed sports atmosphere, realistic setting.",
    },
  },

  {
    id: "col_strong_striker",
    title: "Colombia – Attaccante potente",
    subtitle: "Tunnel pre-partita",
    archetypeKey: "col_strong_striker",
    presetKey: "cinematic",
    basePrompt: "A world-class male Colombian football star, realistic athletic build, premium professional footballer, handsome and masculine face, wearing a realistic Colombia national team style jersey in strong yellow with dark blue and red details, elite sports presence, authentic match-day look, looks like a real famous football player",
    scenes: {
      campo:
        "On a football pitch before kickoff, energetic stadium atmosphere, realistic sports environment.",
      tunnel:
        "Inside a football stadium tunnel before the match, cinematic sports lighting, intense mood.",
      panchina:
        "Near the team bench in a stadium, strong sports atmosphere, realistic environment.",
    },
  },

  {
    id: "bra_skills_winger",
    title: "Brazil – Ala tecnica",
    subtitle: "Panchina relax",
    archetypeKey: "bra_skills_winger",
    presetKey: "social",
    basePrompt: "A world-class male Brazilian football star, realistic athletic build, premium professional footballer, handsome and masculine face, wearing a realistic Brazil national team style jersey in bright yellow with green details and deep blue accents, elite sports presence, authentic match-day look, looks like a real famous football player",
    scenes: {
      campo:
        "On a football field during a relaxed moment, bright stadium lighting, realistic environment.",
      tunnel:
        "Inside a football stadium tunnel, stylish sports atmosphere, clean lighting.",
      panchina:
        "Sitting on the bench in a football stadium, relaxed and friendly sports mood.",
    },
  },

  {
    id: "por_skills_winger",
    title: "Portogallo – Ala tecnica",
    subtitle: "Panchina relax",
    archetypeKey: "por_skills_winger",
    presetKey: "social",
    basePrompt: "A world-class male Portuguese football star, realistic athletic build, premium professional footballer, handsome and masculine face, wearing a realistic Portugal national team style jersey in deep red with green details, elite sports presence, authentic match-day look, looks like a real famous football player",
    scenes: {
      campo:
        "On a football pitch in a premium stadium atmosphere, realistic lighting.",
      tunnel:
        "Inside a football stadium tunnel before the match, polished sports lighting.",
      panchina:
        "On the stadium bench in a calm pre-match moment, realistic environment.",
    },
  },

  {
    id: "fra_skills_winger",
    title: "Francia – Ala tecnica",
    subtitle: "Panchina relax",
    archetypeKey: "fra_skills_winger",
    presetKey: "social",
    basePrompt: "A world-class male French football star, realistic athletic build, premium professional footballer, handsome and masculine face, wearing a realistic France national team style jersey in dark navy blue with elegant national details, elite sports presence, authentic match-day look, looks like a real famous football player",
    scenes: {
      campo:
        "On a football pitch in a large stadium, realistic sports mood.",
      tunnel:
        "Inside a football stadium tunnel, modern dramatic lighting.",
      panchina:
        "Relaxed moment on the stadium bench, realistic sports background.",
    },
  },
];

// ================= MAP (IMPORTANTISSIMO) =================

export const CALCIO_ARCHETYPES_MAP = Object.fromEntries(
  CALCIO_ARCHETYPES_CARDS.map((card) => [card.archetypeKey, card])
) as Record<string, CalcioCard>;