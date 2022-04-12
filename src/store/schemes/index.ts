import * as c3 from "@mapequation/c3";
import {
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
  Turbo: c3.colors(512, { scheme: "Turbo", ...c3options }),
  Rainbow: c3.colors(512, { scheme: "Rainbow", ...c3options }),
  Sinebow: c3.colors(512, { scheme: "Sinebow", ...c3options }),
  Viridis: c3.colors(512, { scheme: "Viridis", ...c3options }),
} as const;

export const SCHEME_NAMES = [...Object.keys(COLOR_SCHEMES)];

export type ColorScheme = typeof COLOR_SCHEMES[keyof typeof COLOR_SCHEMES];

export type SchemeName = keyof typeof COLOR_SCHEMES;
