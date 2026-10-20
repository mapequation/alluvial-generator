# @mapequation/alluvial-diagram

Interactive alluvial diagrams for hierarchical networks. Pan, zoom, select and expand modules; drive the diagram from a MobX store, render an SVG view from React.

This package is the engine behind the [Alluvial Diagram Generator](https://www.mapequation.org/alluvial).

## Install

```bash
npm install @mapequation/alluvial-diagram
```

Peer dependencies (install if you don't already have them):

```bash
npm install react react-dom mobx mobx-react framer-motion
```

## What's in the package

- **Data + layout**: `Diagram`, `Network`, `Module`, `LeafNode`, `Branch`, `StreamlineLink`, `HighlightGroup`.
- **File parsers**: `parseAcceptedFiles`, `fetchScienceData`, `setIdentifiers`, `getLocalStorageFiles`, `calcStatistics`, `mergeMultilayerFiles`, `expandMultilayerFile`.
- **State controller**: `DiagramStore` (MobX observable) — loads networks, lays them out and colors them; extend it for app-specific state.
- **Color schemes**: `COLOR_SCHEMES`, `SCHEME_GROUPS` (d3, seaborn, matplotlib and C3 palettes).
- **React renderer**: `<DiagramView>` — an SVG component reading from a `DiagramStore` via context.
- **Export**: `saveSvg(svgElement, filename)` downloads the rendered diagram as an SVG file.

## Quick start

Read partition files, load them into a store, render the diagram:

```tsx
import {
  DiagramStore,
  DiagramView,
  parseAcceptedFiles,
} from "@mapequation/alluvial-diagram";
import "@mapequation/alluvial-diagram/style.css";
import { observer } from "mobx-react";
import { useEffect } from "react";

const ACCEPTED = ["tree", "ftree", "stree", "clu", "net", "json", "zip"];
const store = new DiagramStore();

export default observer(function App({ files }: { files: File[] }) {
  useEffect(() => {
    parseAcceptedFiles(files, [], ACCEPTED, store.identifier).then(
      ([networks]) => store.setNetworks(networks)
    );
  }, [files]);

  return (
    <DiagramView
      store={store}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
});
```

`setNetworks(networks, selectLargest = true)` builds the diagram, lays it out and selects the largest module in the leftmost network. Before any networks are loaded the store is empty and `updateLayout()` is a no-op, so it is safe to render `<DiagramView>` and call setters right away.

### Styles

Import the stylesheet once (it sets cursors and the module hover outline):

```ts
import "@mapequation/alluvial-diagram/style.css";
```

`<DiagramView>` is keyboard-aware out of the box:

| Key             | Action                              |
| --------------- | ----------------------------------- |
| Arrow keys      | Select neighbouring module          |
| `w` / `s`       | Move selected module up / down      |
| `a` / `d`       | Move network left / right           |
| `e`             | Expand selected module              |
| `c`             | Regroup (collapse) selected module  |
| Mouse wheel     | Zoom                                |
| Drag            | Pan                                 |

## Store options

Pass initial settings to the constructor. Every layout/display setting on the store can be given here (`identifier`, `height`, `moduleWidth`, `sortModulesBy`, `showModuleId`, `fontSize`, …), plus `colorScheme`, a key of `COLOR_SCHEMES`. Defaults: `identifier: "id"`, `colorScheme: "C3 Sinebow"`, `showModuleId: false`.

```ts
const store = new DiagramStore({
  identifier: "name",
  colorScheme: "C3 Turbo",
  showModuleId: true,
});
```

## Extending `DiagramStore`

Subclass it to add app-specific state. Set the store's own defaults through `super(options)` — don't redeclare its fields in the subclass, since subclass field initializers run after the base class has made them observable:

```ts
import { DiagramStore } from "@mapequation/alluvial-diagram";
import { action, makeObservable, observable } from "mobx";

export class AppStore extends DiagramStore {
  query = "";

  constructor() {
    super({ identifier: "name", colorScheme: "C3 Turbo" });
    makeObservable(this, { query: observable });
  }

  setQuery = action((query: string) => {
    this.query = query;
  });
}
```

Components rendered inside `<DiagramView>` can read the store with `useDiagramStore()`; it is provided through `DiagramStoreContext`.

## Coloring

Coloring operations pick colors from the selected scheme (`store.setSelectedScheme("Tableau10")`, current palette in `store.selectedScheme`):

```ts
store.colorNodesInModulesInAllNetworks(undefined); // color by modules in the first network
store.colorMatchingModulesInAllNetworks();
store.colorModuleIdsInAllNetworks();
store.colorModule(module, "#e41a1c");
store.colorNodesInModule(module, "#e41a1c");
store.colorSelectedNodes(leafNodes, "#e41a1c");
store.colorByLayer();
store.colorByPhysicalId();
store.colorCategoricalMetadata(name, colorByValue);
store.colorRealMetadata(name, bins); // bins: { x0, x1, color }[]
store.clearColors();

store.getHighlightColor(group.highlightIndex); // color of a highlight group
```

## Loading data

Three convenience helpers cover the common input paths:

```ts
import {
  parseAcceptedFiles,   // File[] from <input type="file"> or drag-and-drop
  fetchScienceData,     // built-in example network (science 2001-2007)
  getLocalStorageFiles, // restore files persisted by @mapequation/infomap
  setIdentifiers,       // normalize node identifiers ("id" | "name")
} from "@mapequation/alluvial-diagram";

const exampleFiles = await fetchScienceData();
store.setNetworks(exampleFiles);

const [uploaded, errors] = await parseAcceptedFiles(
  fileList,
  store.networks, // already loaded files, used to avoid duplicate ids
  ["tree", "ftree", "stree", "clu", "net", "json", "zip"],
  "id",
);
store.setNetworks([...store.networks, ...uploaded]);
```

`store.networks` holds the files the current diagram was built from. `moveNetwork` reorders them and writes module names, colors and expanded modules back to them.

Supported input formats: `tree`, `ftree`, `stree`, `clu`, `net`, `json`, and `zip` of any of the above.

## Saving and opening diagrams

`serializeDiagram(store)` saves the current diagram as **alluvial network files**, `formatVersion` 1: one
Infomap-JSON text per network, named `NN_<network name>.json` in diagram order. `zipFiles(files)` packs them into a
zip (the web app's "Download diagram"). Opening them restores the diagram:

```ts
import {
  serializeDiagram,
  zipFiles,
  parseAcceptedFiles,
} from "@mapequation/alluvial-diagram";

const files = serializeDiagram(store, { generator: "my-app 1.0" }); // [{ name, text }]
const blob = await zipFiles(files);

// later: the zip (or all loose files) from <input type="file">
const [opened, errors] = await parseAcceptedFiles(fileList, [], ["json", "zip"], "id");
store.openNetworks(opened); // like setNetworks, then restores options, scheme, module orders and names
```

The contract of `formatVersion` 1:

- Each file is plain `infomap -o json` output plus a few keys, so any Infomap-JSON reader can load it. Infomap's
  top-level keys (`version`, `args`, `codelength`, `directed`, `flowModel`, `bipartiteStartId`, `modules`,
  `layers`, ...) are passed through unchanged. The file adds `name` (the network name), `colors` (the palette;
  omitted when empty) and, per node in input order, `identifier`, `highlightIndex` and `moduleLevel` next to
  Infomap's `path`, `flow`, `name`, `id`, `stateId`, `layerId` and `metadata`. A path is Infomap's integer array,
  or the stree string (e.g. `"1;1;63;"`) when a level is insignificant.
- Everything else is in one block that other readers ignore:
  `"alluvial": { "format": "alluvial-network", "formatVersion": 1, "generator", "diagram": { "saveId", "position",
  "numNetworks", "colorScheme", "colorTone", "colorOffset", "options" }, "network": { "moduleNames", "moduleOrder" }
  }`. `diagram` is the same in every file of one save (`saveId` ties them together, `position` orders them);
  `colorTone` and `colorOffset` are the c3 tone and offset of the scheme (`colorOffset` is `null` for c3's default);
  `options` holds every saved store option (`SAVED_OPTION_KEYS`). `network.moduleOrder` lists every module, hidden ones included, and is
  written only for a custom order.
- `parseAcceptedFiles` sorts the files of one save into saved order. `openNetworks` applies each file's `network`
  part, and the `diagram` part only when every file has a valid version-1 block of the same save and the positions
  are complete. Anything else warns and loads what it can: a block with a newer `formatVersion` or an invalid block
  is ignored, files from different saves or an incomplete save keep their module names and orders but not the
  options, and an invalid option value, an unknown scheme or tone, or an invalid offset is skipped. A save without
  `colorTone` or `colorOffset` keeps the current tone, and the current offset unless the scheme changes. The networks
  always load with their colours and module levels.
- Readers ignore unknown keys, so new optional keys do not change the version. Only an incompatible change to the
  block bumps `formatVersion`.

The Python package `alluvial` (alluvial-py) writes and reads the same files byte for byte. The 2019 single-JSON
format (`createFilesFromDiagramObject`) is no longer read.

## Custom tooltip

The renderer ships **no tooltip styling** — it exposes a render-prop slot so consumers stay framework-agnostic. Wrap the hovered module trigger in whatever component library you use:

```tsx
<DiagramView
  store={store}
  width={width}
  height={height}
  renderTooltip={({ module, fillColor, children }) => (
    <Tooltip
      content={
        <ModuleSummary module={module} fill={fillColor} />
      }
    >
      {children}
    </Tooltip>
  )}
/>
```

`children` is the SVG group `<DiagramView>` would otherwise render directly — pass it through your tooltip's trigger so hit-testing works.

## Sizing & layout

`<DiagramView>` doesn't read `window` — pass `width`/`height` from a `ResizeObserver`, parent container, or `window.innerWidth`. The diagram is centered horizontally and placed a third of the free space from the top, at least `minMargin` (default 100) px from the left and top edges. Use `offsetX` / `offsetY` to bias the placement (e.g. to leave room for a sidebar):

```tsx
<DiagramView
  store={store}
  width={containerWidth}
  height={containerHeight}
  offsetX={-sidebarWidth / 2}
/>
```

In a fixed-size box, center on both axes with a small margin:

```tsx
<DiagramView store={store} width={900} height={500} centerVertically minMargin={10} />
```

To export the rendered diagram, pass the `<svg>` (default `id="alluvialSvg"`) to `saveSvg`:

```ts
import { saveSvg } from "@mapequation/alluvial-diagram";

saveSvg(document.getElementById("alluvialSvg") as unknown as SVGSVGElement, "diagram.svg");
```

Layout parameters (`moduleWidth`, `streamlineFraction`, `flowThreshold`, `verticalAlign`, `moduleSize`, `sortModulesBy`, …) live on `DiagramStore` as observables — change them through their setters and the renderer re-layouts:

```ts
store.setModuleWidth(120);
store.setStreamlineFraction(1.5);
store.setSortModulesBy("nodes");
```

## React API

```ts
type DiagramViewProps = {
  store: DiagramStore;
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  centerVertically?: boolean; // default false: a third of the free space from the top
  minMargin?: number; // default 100
  renderTooltip?: (props: {
    module: Module;
    fillColor: (group: { highlightIndex: number; insignificant: boolean }) => string;
    children: ReactNode;
  }) => ReactNode;
  className?: string;
  id?: string;
};
```

## License

AGPL-3.0-or-later
