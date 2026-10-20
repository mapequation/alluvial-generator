import { List } from "@chakra-ui/react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NetworkFile } from "@mapequation/alluvial-diagram";
import Module from "../components/Sidebar/Module";
import { Provider } from "../components/ui/provider";
import { Store, StoreContext } from "../store/Store";

// Module 2 mixes a leaf at level 2 with one at level 3: it is not a leaf module, but
// Module.expand refuses it, so the Expand button must be disabled (H4).
function mixedNetwork(): NetworkFile {
  const paths: [string, number][] = [
    ["1:1:1", 0.3],
    ["1:2:1", 0.3],
    ["2:1", 0.2],
    ["2:2:1", 0.2],
  ];
  return {
    id: "mixed",
    name: "mixed",
    filename: "mixed.tree",
    format: "tree",
    size: 0,
    lastModified: 0,
    haveModules: true,
    nodes: paths.map(([path, flow], i) => ({
      id: i + 1,
      name: `${i + 1}`,
      identifier: `${i + 1}`,
      path,
      flow,
    })),
  } as NetworkFile;
}

function renderModulePanel() {
  const store = new Store();
  store.setNetworks([mixedNetwork()]);
  render(
    <Provider enableSystem defaultTheme="light">
      <StoreContext.Provider value={store}>
        <List.Root>
          <Module onModuleViewClick={() => {}} />
        </List.Root>
      </StoreContext.Provider>
    </Provider>
  );
  return store;
}

const expandButton = () => screen.getByRole("button", { name: /Expand/ });

describe("Expand button (H4)", () => {
  it("is disabled for a module that expand refuses", () => {
    const store = renderModulePanel();
    const module = store.diagram.children[0].getModule("2")!;
    expect(module.isLeafModule).toBe(false);
    expect(module.canExpand).toBe(false);
    act(() => store.setSelectedModule(module));
    expect((expandButton() as HTMLButtonElement).disabled).toBe(true);
  });

  it("is enabled for a module that can expand", () => {
    const store = renderModulePanel();
    act(() =>
      store.setSelectedModule(store.diagram.children[0].getModule("1")!)
    );
    expect((expandButton() as HTMLButtonElement).disabled).toBe(false);
  });
});
