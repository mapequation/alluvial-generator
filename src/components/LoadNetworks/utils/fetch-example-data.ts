import { parse } from "@mapequation/infomap-parser";
import { NetworkFile } from "../types";
import { createFile } from "./parse-files";
import { setIdentifiers } from "./set-identifiers";

export async function fetchScienceData(): Promise<NetworkFile[]> {
  const years = [2001, 2003, 2005, 2007];
  const names = years.map((year) => `science${year}_2y.stree`);
  const files = names.map((name) => `/alluvial/data/${name}`);
  const format = "stree";

  const res = await Promise.all(
    files.map(async (url) => {
      const resp = await fetch(url);
      const text = await resp.text();
      const network = parse(text, undefined, true, false);
      setIdentifiers(network.nodes, format, "name");
      return network;
    })
  );

  return res.map((data, i) => {
    const emptyFile = new File([], names[i]);
    return createFile(emptyFile, format, {
      name: years[i].toString(),
      ...data
    });
  });
}
