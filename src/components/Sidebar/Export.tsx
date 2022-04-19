import { observer } from "mobx-react";
import { useContext } from "react";
import { MdFileDownload } from "react-icons/md";
import { saveSvg } from "../../io/export";
import { StoreContext } from "../../store";
import { ListItemButton, ListItemHeader } from "./utils";

interface ExportProps {
  headerColor: string;
}

export default observer(function Export({ headerColor }: ExportProps) {
  const store = useContext(StoreContext);
  const downloadSvg = () => {
    store.setSelectedModule(null);
    const svg = document.getElementById("alluvialSvg");
    const filename =
      store.diagram.children.map((n) => n.name).join("-") + ".svg";

    setTimeout(() => saveSvg(svg, filename), 500);
  };

  return (
    <>
      <ListItemHeader color={headerColor}>Export</ListItemHeader>

      <ListItemButton
        onClick={downloadSvg}
        variant="link"
        leftIcon={<MdFileDownload />}
      >
        Download SVG
      </ListItemButton>
    </>
  );
});
