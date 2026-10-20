import { observer } from "mobx-react";
import { useContext } from "react";
import FileSaver from "file-saver";
import { MdFileDownload } from "react-icons/md";
import {
  saveSvg,
  serializeDiagram,
  zipFiles,
} from "@mapequation/alluvial-diagram";
import { version } from "../../../package.json";
import { StoreContext } from "../../store";
import { ListItemButton, ListItemHeader } from "./components";
import { SidebarContext } from "./Sidebar";

export default observer(function Export() {
  const store = useContext(StoreContext);
  const { headerColor } = useContext(SidebarContext);

  const downloadSvg = () => {
    store.setSelectedModule(null);
    const svg = document.getElementById("alluvialSvg") as SVGSVGElement | null;
    if (!svg) return;

    const filename =
      store.diagram.children.map((n) => n.name).join("-") + ".svg";

    setTimeout(() => saveSvg(svg, filename), 500);
  };

  // The network files with their colors, module names, module order and
  // settings, in one zip that "Load networks" opens again.
  const downloadDiagram = async () => {
    const files = serializeDiagram(store, {
      generator: `alluvial web app ${version}`,
    });
    const blob = await zipFiles(files);
    const name = store.diagram.children.map((n) => n.name).join("-");
    FileSaver.saveAs(blob, `${name || "diagram"}.zip`);
  };

  return (
    <>
      <ListItemHeader color={headerColor}>Export</ListItemHeader>

      <ListItemButton onClick={downloadSvg} variant="ghost">
        <MdFileDownload />
        Download SVG
      </ListItemButton>

      <ListItemButton
        onClick={downloadDiagram}
        variant="ghost"
        title="Network files with colors, module names, order and settings. Open them again with Load networks."
      >
        <MdFileDownload />
        Download diagram (.zip)
      </ListItemButton>
    </>
  );
});
