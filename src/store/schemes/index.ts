import * as c3 from "@mapequation/c3";
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
} from "./seaborn-schemes";

const c3options = {
  saturation: 0.55,
  saturationEnd: 0.8,
  lightness: 0.5,
  lightnessEnd: 0.9,
  midpoint: 4.5,
  steepness: 1,
};

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
  "C3 Turbo": c3.colors(512, { scheme: "Turbo", ...c3options }),
  "C3 Rainbow": c3.colors(512, { scheme: "Rainbow", ...c3options }),
  "C3 Sinebow": c3.colors(512, { scheme: "Sinebow", ...c3options }),
  "C3 Viridis": c3.colors(512, { scheme: "Viridis", ...c3options }),
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
