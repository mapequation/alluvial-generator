import { observer } from "mobx-react";
import { useContext, useState } from "react";
import {
  Button,
  Header,
  Menu,
  Sidebar as SemanticSidebar,
} from "semantic-ui-react";
//import { savePng, saveSvg } from "../../io/export";
import { StoreContext } from "../../store";
//import Export from "./Export";
import LayoutSettings from "./LayoutSettings";
import MenuHeader from "./MenuHeader";
import ModuleExplorer from "./ModuleExplorer";
import PaintNetworks from "./PaintNetworks";
import SelectedModule from "./SelectedModule";

const buttonProps = { compact: true, size: "tiny", basic: true, fluid: true };

export default observer(function Sidebar() {
  const { selectedModule } = useContext(StoreContext);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <SemanticSidebar
      as={Menu}
      width="wide"
      direction="right"
      visible={true}
      vertical
    >
      <Menu.Item header href="//www.mapequation.org/alluvial">
        <MenuHeader />
      </Menu.Item>
      <Menu.Item>
        <Header as="h4" content="Module explorer" />
        {selectedModule != null ? (
          <>
            <SelectedModule />
            <Button
              icon="info"
              {...buttonProps}
              style={{ margin: "4px 0 0 0" }}
              content={modalOpen ? "Close info" : "Open info"}
              onClick={() => setModalOpen(!modalOpen)}
            />
            <ModuleExplorer
              open={modalOpen}
              onClose={() => setModalOpen(false)}
            />
          </>
        ) : (
          <div style={{ color: "#777" }}>
            No module selected. <br />
            Click on any module.
          </div>
        )}
      </Menu.Item>
      <Menu.Item>
        <PaintNetworks
          onAutoPaintNodesClick={
            () => null
            //dispatch({ type: "autoPaintNodes" })
          }
          onAutoPaintModuleIdsClick={
            () => null
            //dispatch({ type: "autoPaintModuleIds" })
          }
          onRemoveColorsClick={
            () => null
            //dispatch({ type: "removeColors" })
          }
        />
      </Menu.Item>
      <Menu.Item>
        <LayoutSettings />
      </Menu.Item>
      {/* <Menu.Item>
        <Export
          onSaveClick={
            () => null
            //dispatch({ type: "saveDiagram" })
          }
          onDownloadSvgClick={() => saveSvg("alluvialSvg", basename + ".svg")}
          onDownloadPngClick={() => savePng("alluvialSvg", basename + ".png")}
        />
      </Menu.Item> */}
    </SemanticSidebar>
  );
});
