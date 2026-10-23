import {
  palette,
  tones,
  type HierarchyOptions,
  type HueSource,
  type ToneName,
} from "@mapequation/c3";
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

// Where the C3 schemes take their hues from
const C3_HUES = {
  "C3 Oklch": "Oklch",
  "C3 Turbo": "Turbo",
  "C3 Rainbow": "Rainbow",
  "C3 Sinebow": "Sinebow",
  "C3 Viridis": "Viridis",
} as const satisfies Record<string, HueSource>;

type C3SchemeName = keyof typeof C3_HUES;

export type { ToneName };

/** The c3 tones, which set the lightness and chroma of the C3 schemes */
export const TONES = Object.keys(tones) as ToneName[];

// The default tone of the C3 schemes: "vivid", more saturated than c3's own default ("strong")
export const DEFAULT_TONE: ToneName = "vivid";

const c3Scheme = (
  name: C3SchemeName,
  tone: ToneName,
  offset: number | null = null
) =>
  palette(512, { hue: C3_HUES[name], tone, offset: offset ?? undefined });

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

// d3 interpolators, sampled for the schemes and used as hue sources by c3
const INTERPOLATED = {
  // diverging
  "Brown-Green": interpolateBrBG,
  "Purple-Green": interpolatePRGn,
  "Pink-Green": interpolatePiYG,
  "Purple-Orange": interpolatePuOr,
  "Red-Blue": interpolateRdBu,
  "Red-Gray": interpolateRdGy,
  "Red-Yellow-Blue": interpolateRdYlBu,
  "Red-Yellow-Green": interpolateRdYlGn,
  Spectral: interpolateSpectral,
  // sequential-multi
  "Blue-Green": interpolateBuGn,
  "Blue-Purple": interpolateBuPu,
  "Green-Blue": interpolateGnBu,
  "Orange-Red": interpolateOrRd,
  "Purple-Blue-Green": interpolatePuBuGn,
  "Purple-Blue": interpolatePuBu,
  "Purple-Red": interpolatePuRd,
  "Red-Purple": interpolateRdPu,
  "Yellow-Green-Blue": interpolateYlGnBu,
  "Yellow-Green": interpolateYlGn,
  "Yellow-Orange-Brown": interpolateYlOrBr,
  "Yellow-Orange-Red": interpolateYlOrRd,
  // sequential-single
  Blues: interpolateBlues,
  Greens: interpolateGreens,
  Greys: interpolateGreys,
  Purples: interpolatePurples,
  Reds: interpolateReds,
  Oranges: interpolateOranges,
  // sequential-multi
  Cividis: interpolateCividis,
  Cubehelix: interpolateCubehelixDefault,
  Warm: interpolateWarm,
  Cool: interpolateCool,
  Turbo: interpolateTurbo,
  Viridis: interpolateViridis,
  Magma: interpolateMagma,
  Inferno: interpolateInferno,
  Plasma: interpolatePlasma,
  // cyclical
  Rainbow: interpolateRainbow,
  Sinebow: interpolateSinebow,
} satisfies Record<string, (t: number) => string>;

const sampled = <K extends string>(
  interpolators: Record<K, (t: number) => string>
) =>
  Object.fromEntries(
    Object.entries<(t: number) => string>(interpolators).map(
      ([name, interpolator]) => [name, scheme(interpolator)]
    )
  ) as Record<K, string[]>;

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
  // c3, in the default tone
  "C3 Oklch": c3Scheme("C3 Oklch", DEFAULT_TONE),
  "C3 Turbo": c3Scheme("C3 Turbo", DEFAULT_TONE),
  "C3 Rainbow": c3Scheme("C3 Rainbow", DEFAULT_TONE),
  "C3 Sinebow": c3Scheme("C3 Sinebow", DEFAULT_TONE),
  "C3 Viridis": c3Scheme("C3 Viridis", DEFAULT_TONE),
  // natural
  "Mural": mural_colors,
  // uniform
  Flare: flare,
  Crest: crest,
  ...sampled(INTERPOLATED),
} as const;

export type ColorScheme = typeof COLOR_SCHEMES[keyof typeof COLOR_SCHEMES];

export type SchemeName = keyof typeof COLOR_SCHEMES;

const isC3Scheme = (name: SchemeName): name is C3SchemeName =>
  name in C3_HUES;

const isInterpolated = (
  name: SchemeName
): name is keyof typeof INTERPOLATED => name in INTERPOLATED;

/** The colors of a scheme, where the C3 schemes depend on the tone and offset */
export function schemeColors(
  name: SchemeName,
  tone: ToneName,
  offset: number | null = null
): ColorScheme {
  if (!isC3Scheme(name) || (tone === DEFAULT_TONE && offset === null)) {
    return COLOR_SCHEMES[name];
  }
  return c3Scheme(name, tone, offset);
}

/**
 * Whether c3 takes the scheme as a hue source, so that the tone and offset
 * change its colors or its hierarchy coloring
 */
export const schemeIsHueSource = (name: SchemeName) =>
  isC3Scheme(name) || isInterpolated(name);

/**
 * Where c3 puts the first color by default, in degrees around the hue source:
 * its hue on the OKLCH hue circle, or 0 at the start of a scheme
 */
export const defaultSchemeOffset = (name: SchemeName) =>
  isC3Scheme(name) && C3_HUES[name] === "Oklch" ? 245 : 0;

/**
 * Options for c3's `hierarchy()` that make top modules follow a scheme. The C3
 * and interpolated schemes are hue sources in the tone and offset, so flows can
 * weigh the colors. The other schemes are lists of colors, which c3 takes as seeds and
 * infers the tone from.
 */
export function hierarchyOptions(
  name: SchemeName,
  tone: ToneName,
  offset: number | null = null
): HierarchyOptions {
  const options = { tone, offset: offset ?? undefined };
  if (isC3Scheme(name)) return { hue: C3_HUES[name], ...options };
  if (isInterpolated(name)) return { hue: INTERPOLATED[name], ...options };
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
  C3: ["C3 Oklch", "C3 Turbo", "C3 Rainbow", "C3 Sinebow", "C3 Viridis"],
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
