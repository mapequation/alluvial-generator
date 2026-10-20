import { describe, expect, it } from "vitest";
import {
  COLOR_SCHEMES,
  DEFAULT_TONE,
  defaultSchemeOffset,
  hierarchyOptions,
  schemeColors,
  schemeIsHueSource,
} from ".";

describe("schemes", () => {
  it("gives the C3 schemes in the tone, and other schemes as they are", () => {
    expect(schemeColors("C3 Sinebow", DEFAULT_TONE)).toBe(
      COLOR_SCHEMES["C3 Sinebow"]
    );
    expect(schemeColors("C3 Sinebow", "pastel")).not.toEqual(
      COLOR_SCHEMES["C3 Sinebow"]
    );
    expect(schemeColors("Set3", "pastel")).toBe(COLOR_SCHEMES.Set3);
    expect(schemeColors("Blues", "pastel")).toBe(COLOR_SCHEMES.Blues);
  });

  it("uses schemes as hue sources for hierarchy coloring, and lists as seeds", () => {
    expect(hierarchyOptions("C3 Sinebow", "deep")).toEqual({
      hue: "Sinebow",
      tone: "deep",
    });

    const { hue, tone, seeds } = hierarchyOptions("Red-Blue", "deep");
    expect(typeof hue).toBe("function");
    expect(tone).toBe("deep");
    expect(seeds).toBeUndefined();

    expect(hierarchyOptions("Mural", "deep")).toEqual({
      seeds: COLOR_SCHEMES.Mural,
    });
  });

  it("moves the first color of the C3 schemes with the offset", () => {
    expect(schemeColors("C3 Oklch", DEFAULT_TONE, 90)).not.toEqual(
      COLOR_SCHEMES["C3 Oklch"]
    );
    expect(hierarchyOptions("C3 Oklch", "strong", 90)).toEqual({
      hue: "Oklch",
      tone: "strong",
      offset: 90,
    });
  });

  it("gives c3's default offsets", () => {
    for (const name of ["C3 Oklch", "C3 Sinebow"] as const) {
      expect(
        schemeColors(name, DEFAULT_TONE, defaultSchemeOffset(name))
      ).toEqual(COLOR_SCHEMES[name]);
    }
  });

  it("knows which schemes are hue sources", () => {
    expect(schemeIsHueSource("C3 Oklch")).toBe(true);
    expect(schemeIsHueSource("Viridis")).toBe(true);
    expect(schemeIsHueSource("Mural")).toBe(false);
    expect(schemeIsHueSource("Category10")).toBe(false);
  });
});
