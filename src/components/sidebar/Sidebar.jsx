import { PureComponent } from "react";
import {
  Button,
  Header,
  Menu,
  Sidebar as SemanticSidebar,
} from "semantic-ui-react";
import Dispatch from "../../context/Dispatch";
import { savePng, saveSvg } from "../../io/export";
import ConvertToPdfModal from "./ConvertToPdfModal";
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

export default class Sidebar extends PureComponent {
  static contextType = Dispatch;

  constructor(props) {
    super(props);

    this.state = {
      selectedNetworkId: "",
      moduleIds: {
        ...createEmptyFilter(props.networks),
        ...props.modulesVisibleInFilter,
      },
      modalOpen: false,
      pdfModalOpen: false,
    };
  }

  render() {
    const {
      networks,
      defaultHighlightColor,
      highlightColors,
      sidebarVisible,
      selectedModule,
      visibleModules,
    } = this.props;

    const { selectedNetworkId, moduleIds, modalOpen, pdfModalOpen } =
      this.state;

    const { dispatch } = this.context;

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
      this.setState({ moduleIds: updated });
    };

    const clearFilter = () => {
      this.setState({ moduleIds: createEmptyFilter(networks) });
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
        animation="overlay"
        width="wide"
        direction="right"
        visible={sidebarVisible}
        vertical
      >
        <Menu.Item header href="//www.mapequation.org/alluvial">
          <MenuHeader />
        </Menu.Item>
        <Menu.Item
          icon="close"
          content="Hide sidebar"
          onClick={() => dispatch({ type: "sidebarVisible", value: false })}
        />
        <Menu.Item>
          <Header as="h4" content="Module explorer" />
          {!!selectedModule ? (
            <>
              <ModuleExplorer
                open={modalOpen}
                onClose={() => this.setState({ modalOpen: false })}
                module={selectedModule}
                highlightColors={highlightColors}
              />
              <SelectedModule
                module={selectedModule}
                highlightColors={highlightColors}
                defaultHighlightColor={defaultHighlightColor}
                selectedNetworkId={selectedNetworkId}
                setSelectedNetworkId={(selectedNetworkId) =>
                  this.setState({ selectedNetworkId })
                }
                moduleIds={moduleIdsForNetwork(selectedModule.networkId)}
                setModuleIds={setModuleIdsForNetwork(selectedModule.networkId)}
              />
              <Button
                icon="info"
                {...buttonProps}
                style={{ margin: "4px 0 0 0" }}
                content={modalOpen ? "Close info" : "Open info"}
                onClick={() => this.setState({ modalOpen: !modalOpen })}
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
            setSelectedNetworkId={(selectedNetworkId) =>
              this.setState({ selectedNetworkId })
            }
            networkIdOptions={networkIdOptions}
            moduleIdsForNetwork={moduleIdsForNetwork}
            setModuleIdsForNetwork={setModuleIdsForNetwork}
            moduleIdOptions={moduleIdOptions}
            moduleIds={moduleIds}
            clearFilter={clearFilter}
          />
        </Menu.Item>
        <Menu.Item>
          <LayoutSettings {...this.props} />
        </Menu.Item>
        <Menu.Item>
          <Export
            onSaveClick={() => dispatch({ type: "saveDiagram" })}
            onDownloadSvgClick={() => saveSvg("alluvialSvg", basename + ".svg")}
            onDownloadPngClick={() => savePng("alluvialSvg", basename + ".png")}
            onConvertToPdfClick={() => this.setState({ pdfModalOpen: true })}
          />
        </Menu.Item>
        <ConvertToPdfModal
          open={pdfModalOpen}
          onClose={() => this.setState({ pdfModalOpen: false })}
        />
      </SemanticSidebar>
    );
  }
}
