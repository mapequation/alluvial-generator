import { useContext, useState } from "react";
import {
  Button,
  Header,
  Menu,
  Sidebar as SemanticSidebar,
} from "semantic-ui-react";
import Dispatch from "../../context/Dispatch";
import { savePng, saveSvg } from "../../io/export";
import Export from "./Export";
import LayoutSettings from "./LayoutSettings";
import MenuHeader from "./MenuHeader";
import ModuleExplorer from "./ModuleExplorer";
import ModuleFilter from "./ModuleFilter";
import PaintNetworks from "./PaintNetworks";
import SelectedModule from "./SelectedModule";

const buttonProps = { compact: true, size: "tiny", basic: true, fluid: true };

const createEmptyFilter = (networks) => {
  const emptyFilter = {};
  networks.forEach(({ id }) => (emptyFilter[id] = []));
  return emptyFilter;
};

export default function Sidebar(props) {
  const {
    networks,
    defaultHighlightColor,
    highlightColors,
    selectedModule,
    visibleModules,
    modulesVisibleInFilter,
  } = props;

  const { dispatch } = useContext(Dispatch);
  const [selectedNetworkId, setSelectedNetworkId] = useState("");
  const [moduleIds, setModuleIds] = useState({
    ...createEmptyFilter(networks),
    ...modulesVisibleInFilter,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const networkIdOptions = networks.map(({ name, id }, key) => ({
    key,
    text: name,
    value: id,
  }));

  const moduleIdOptions = (() => {
    const visibleModuleIds = visibleModules[selectedNetworkId] || [];
    return visibleModuleIds.map((moduleId, key) => ({
      key,
      text: moduleId,
      value: moduleId,
    }));
  })();

  const moduleIdsForNetwork = (networkId) => moduleIds[networkId] || [];

  const setModuleIdsForNetwork = (networkId) => (newModuleIds) => {
    if (!moduleIds[networkId]) return;
    const updated = Object.assign({}, moduleIds);
    updated[networkId] = newModuleIds;
    setModuleIds(updated);
  };

  const clearFilter = () => {
    setModuleIds(createEmptyFilter(networks));
    dispatch({ type: "clearFilters" });
  };

  Object.entries(moduleIds).forEach(([networkId, moduleIds]) => {
    const visible = visibleModules[networkId] || [];
    if (moduleIds.some((moduleId) => !visible.includes(moduleId))) {
      clearFilter();
    }
  });

  const basename = networks.map((network) => network.name);

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
        {!!selectedModule ? (
          <>
            <ModuleExplorer
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              module={selectedModule}
              highlightColors={highlightColors}
            />
            <SelectedModule
              module={selectedModule}
              highlightColors={highlightColors}
              defaultHighlightColor={defaultHighlightColor}
              selectedNetworkId={selectedNetworkId}
              setSelectedNetworkId={setSelectedNetworkId}
              moduleIds={moduleIdsForNetwork(selectedModule.networkId)}
              setModuleIds={setModuleIdsForNetwork(selectedModule.networkId)}
            />
            <Button
              icon="info"
              {...buttonProps}
              style={{ margin: "4px 0 0 0" }}
              content={modalOpen ? "Close info" : "Open info"}
              onClick={() => setModalOpen(!modalOpen)}
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
          onAutoPaintNodesClick={() => dispatch({ type: "autoPaintNodes" })}
          onAutoPaintModuleIdsClick={() =>
            dispatch({ type: "autoPaintModuleIds" })
          }
          onRemoveColorsClick={() => dispatch({ type: "removeColors" })}
        />
      </Menu.Item>
      <Menu.Item>
        <ModuleFilter
          selectedNetworkId={selectedNetworkId}
          setSelectedNetworkId={setSelectedNetworkId}
          networkIdOptions={networkIdOptions}
          moduleIdsForNetwork={moduleIdsForNetwork}
          setModuleIdsForNetwork={setModuleIdsForNetwork}
          moduleIdOptions={moduleIdOptions}
          moduleIds={moduleIds}
          clearFilter={clearFilter}
        />
      </Menu.Item>
      <Menu.Item>
        <LayoutSettings {...props} />
      </Menu.Item>
      <Menu.Item>
        <Export
          onSaveClick={() => dispatch({ type: "saveDiagram" })}
          onDownloadSvgClick={() => saveSvg("alluvialSvg", basename + ".svg")}
          onDownloadPngClick={() => savePng("alluvialSvg", basename + ".png")}
        />
      </Menu.Item>
    </SemanticSidebar>
  );
}
