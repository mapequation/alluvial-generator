import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { NetworkFile } from "@mapequation/alluvial-diagram";
import { setIdentifiers } from "@mapequation/alluvial-diagram";
import { initialState, LoadContext } from "../components/LoadNetworks/context";
import NodeIdentifier from "../components/LoadNetworks/NodeIdentifier";
import { Provider } from "../components/ui/provider";
import { toaster } from "../components/ui/toaster";
import { Store, StoreContext } from "../store/Store";

// Two nodes per name: unique by id, shared by name.
function treeFile(): NetworkFile {
  const nodes: [string, string][] = [
    ["1:1", "a"],
    ["1:2", "a"],
    ["2:1", "b"],
    ["2:2", "b"],
  ];
  const file = {
    id: "t",
    name: "t",
    filename: "t.tree",
    format: "tree",
    size: 0,
    lastModified: 0,
    haveModules: true,
    nodes: nodes.map(([path, name], i) => ({
      id: i + 1,
      name,
      path,
      flow: 0.25,
    })),
  } as NetworkFile;
  setIdentifiers(file.nodes, "tree", "id");
  return file;
}

describe("NodeIdentifier (WP5 review)", () => {
  it("warns when switching to an identifier that several nodes share", async () => {
    const create = vi.spyOn(toaster, "create");
    const file = treeFile();
    render(
      <Provider enableSystem defaultTheme="light">
        <StoreContext.Provider value={new Store()}>
          <LoadContext.Provider
            value={{
              state: { ...initialState, files: [file] },
              dispatch: () => {},
            }}
          >
            <NodeIdentifier isDisabled={false} />
          </LoadContext.Provider>
        </StoreContext.Provider>
      </Provider>
    );
    expect(create).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Name"));
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(file.nodes.map((n) => n.identifier)).toEqual(["a", "a", "b", "b"]);
    expect(create.mock.calls[0][0]).toMatchObject({
      type: "warning",
      description: expect.stringMatching(/^2 identifier\(s\)/),
    });

    fireEvent.click(screen.getByText("Id"));
    await waitFor(() =>
      expect(file.nodes.map((n) => n.identifier)).toEqual(["1", "2", "3", "4"])
    );
    expect(create).toHaveBeenCalledTimes(1);
    create.mockRestore();
  });
});
