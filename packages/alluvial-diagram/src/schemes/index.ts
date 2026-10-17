import { palette, type HierarchyOptions, type PaletteOptions } from "@mapequation/c3";
import {
  interpolateBlues,
  interpolateBrBG,
  interpolateBuGn,
  interpolateBuPu,
  interpolateCividis,
  interpolateCool,
  interpolateCubehelixDefault,
  interpolateGnBu,
  interpolateGreens,
  interpolateGreys,
  interpolateInferno,
  interpolateMagma,
  interpolateOranges,
  interpolateOrRd,
  interpolatePiYG,
  interpolatePlasma,
  interpolatePRGn,
  interpolatePuBu,
  interpolatePuBuGn,
  interpolatePuOr,
  interpolatePuRd,
  interpolatePurples,
  interpolateRainbow,
  interpolateRdBu,
  interpolateRdGy,
  interpolateRdPu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateReds,
  interpolateSinebow,
  interpolateSpectral,
  interpolateTurbo,
  interpolateViridis,
  interpolateWarm,
  interpolateYlGn,
  interpolateYlGnBu,
  interpolateYlOrBr,
  interpolateYlOrRd,
  schemeAccent,
  schemeCategory10,
  schemeDark2,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
} from "d3";
import { schemeTab20, schemeTab20b, schemeTab20c } from "./matplotlib-schemes";
import {
  bright,
  colorblind,
  dark,
  deep,
  muted,
  pastel,
  flare,
  crest
} from "./seaborn-schemes";

// Englewood mural (5 first from a plugin to Illustrator, extended with glasbey)
const mural_colors = [
  "#afb581",
  "#efab6a",
  "#e78c6e",
  "#838eab",
  "#c4c0d5",
  "#55c2ba",
  "#55a26d",
  "#ae8635",
  "#8acaf3",
  "#82d79e",
  "#a68679",
  "#a6aaef",
  "#419eb2",
  "#8aa29e",
  "#aacac2",
  "#ceaa9e",
  "#8a9a45",
  "#35a292",
  "#8a9275",
  "#75a6d7",
  "#d7be61",
  "#9eb6c6",
  "#86ba71",
  "#c29669",
  "#79b696",
  "#b2ce75",
  "#8e8ace",
  "#a6a2c2",
  "#c67551",
  "#69b6ca",
  "#d7be92",
  "#b2a24d",
  "#79d2df",
  "#aec2ef",
  "#aecaa6",
  "#79d7be",
  "#f3aa92",
  "#7596a2",
  "#9aae96",
  "#719a82",
  "#69aaaa",
  "#a28a5d",
  "#82a26d",
  "#aea282",
  "#d2a251",
  "#8ebaba",
  "#a6b65d",
  "#8aa2ba",
  "#7592ca",
  "#9a9a61",
]

// Shared by the C3 schemes and hierarchy coloring, so both start from the same hues.
// Later colors get darker, so they don't compete with the first ones.
const C3_OPTIONS = {
  "C3 Turbo": { hue: "Turbo", end: "darker" },
  "C3 Rainbow": { hue: "Rainbow", end: "darker" },
  "C3 Sinebow": { hue: "Sinebow", end: "darker" },
  "C3 Viridis": { hue: "Viridis", end: "darker" },
} satisfies Record<string, PaletteOptions>;

const scheme = (
  (n: number) =>
    (interpolator: (t: number) => string): string[] => {
      const result = [];
      for (let i = 0; i < n; i++) {
        result.push(interpolator(i / (n - 1)));
      }
      return result;
    }
)(21);

export const COLOR_SCHEMES = {
  // d3
  Accent: schemeAccent,
  Category10: schemeCategory10,
  Dark2: schemeDark2,
  Paired: schemePaired,
  Pastel1: schemePastel1,
  Pastel2: schemePastel2,
  Set1: schemeSet1,
  Set2: schemeSet2,
  Set3: schemeSet3,
  Tableau10: schemeTableau10,
  // seaborn
  Deep: deep,
  Muted: muted,
  Pastel: pastel,
  Bright: bright,
  Dark: dark,
  Colorblind: colorblind,
  // matplotlib
  Tableau20: schemeTab20,
  Tableau20b: schemeTab20b,
  Tableau20c: schemeTab20c,
  // c3
  "C3 Turbo": palette(512, C3_OPTIONS["C3 Turbo"]),
  "C3 Rainbow": palette(512, C3_OPTIONS["C3 Rainbow"]),
  "C3 Sinebow": palette(512, C3_OPTIONS["C3 Sinebow"]),
  "C3 Viridis": palette(512, C3_OPTIONS["C3 Viridis"]),
  // natural
  "Mural": mural_colors,
  // uniform
  Flare: flare,
  Crest: crest,
  // diverging
  "Brown-Green": scheme(interpolateBrBG),
  "Purple-Green": scheme(interpolatePRGn),
  "Pink-Green": scheme(interpolatePiYG),
  "Purple-Orange": scheme(interpolatePuOr),
  "Red-Blue": scheme(interpolateRdBu),
  "Red-Gray": scheme(interpolateRdGy),
  "Red-Yellow-Blue": scheme(interpolateRdYlBu),
  "Red-Yellow-Green": scheme(interpolateRdYlGn),
  Spectral: scheme(interpolateSpectral),
  // sequential-multi
  "Blue-Green": scheme(interpolateBuGn),
  "Blue-Purple": scheme(interpolateBuPu),
  "Green-Blue": scheme(interpolateGnBu),
  "Orange-Red": scheme(interpolateOrRd),
  "Purple-Blue-Green": scheme(interpolatePuBuGn),
  "Purple-Blue": scheme(interpolatePuBu),
  "Purple-Red": scheme(interpolatePuRd),
  "Red-Purple": scheme(interpolateRdPu),
  "Yellow-Green-Blue": scheme(interpolateYlGnBu),
  "Yellow-Green": scheme(interpolateYlGn),
  "Yellow-Orange-Brown": scheme(interpolateYlOrBr),
  "Yellow-Orange-Red": scheme(interpolateYlOrRd),
  // sequential-single
  Blues: scheme(interpolateBlues),
  Greens: scheme(interpolateGreens),
  Greys: scheme(interpolateGreys),
  Purples: scheme(interpolatePurples),
  Reds: scheme(interpolateReds),
  Oranges: scheme(interpolateOranges),
  // sequential-multi
  Cividis: scheme(interpolateCividis),
  Cubehelix: scheme(interpolateCubehelixDefault),
  Warm: scheme(interpolateWarm),
  Cool: scheme(interpolateCool),
  Turbo: scheme(interpolateTurbo),
  Viridis: scheme(interpolateViridis),
  Magma: scheme(interpolateMagma),
  Inferno: scheme(interpolateInferno),
  Plasma: scheme(interpolatePlasma),
  // cyclical
  Rainbow: scheme(interpolateRainbow),
  Sinebow: scheme(interpolateSinebow),
} as const;

export type ColorScheme = typeof COLOR_SCHEMES[keyof typeof COLOR_SCHEMES];

export type SchemeName = keyof typeof COLOR_SCHEMES;

/**
 * Options for c3's `hierarchy()` that make top modules follow a scheme: the C3
 * schemes give their hues, so flows can weigh the colors, and other schemes
 * give their colors as seeds.
 */
export function hierarchyOptions(name: SchemeName): HierarchyOptions {
  if (name in C3_OPTIONS) return C3_OPTIONS[name as keyof typeof C3_OPTIONS];
  return { seeds: COLOR_SCHEMES[name] };
}

export const SCHEME_GROUPS: { [key: string]: SchemeName[] } = {
  ColorBrewer: [
    "Accent",
    "Category10",
    "Dark2",
    "Paired",
    "Pastel1",
    "Pastel2",
    "Set1",
    "Set2",
    "Set3",
    "Tableau10",
  ],
  Seaborn: ["Deep", "Muted", "Pastel", "Bright", "Dark", "Colorblind"],
  Matplotlib: ["Tableau20", "Tableau20b", "Tableau20c"],
  C3: ["C3 Turbo", "C3 Rainbow", "C3 Sinebow", "C3 Viridis"],
  Natural: ["Mural"],
  Uniform: [
    "Flare",
    "Crest"
  ],
  Diverging: [
    "Brown-Green",
    "Purple-Green",
    "Pink-Green",
    "Purple-Orange",
    "Red-Blue",
    "Red-Gray",
    "Red-Yellow-Blue",
    "Red-Yellow-Green",
    "Spectral",
  ],
  "Sequential Multi": [
    "Blue-Green",
    "Blue-Purple",
    "Green-Blue",
    "Orange-Red",
    "Purple-Blue-Green",
    "Purple-Blue",
    "Purple-Red",
    "Red-Purple",
    "Yellow-Green-Blue",
    "Yellow-Green",
    "Yellow-Orange-Brown",
    "Yellow-Orange-Red",
    "Cividis",
    "Cubehelix",
    "Warm",
    "Cool",
    "Turbo",
    "Viridis",
    "Magma",
    "Inferno",
    "Plasma",
  ],
  "Sequential Single": [
    "Blues",
    "Greens",
    "Greys",
    "Purples",
    "Reds",
    "Oranges",
  ],
  Cyclical: ["Rainbow", "Sinebow"],
};
