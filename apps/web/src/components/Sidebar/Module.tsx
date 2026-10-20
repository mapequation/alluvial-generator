import { ButtonGroup, Editable, Kbd, List } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import {
  MdOutlineArrowBack,
  MdOutlineArrowDownward,
  MdOutlineArrowForward,
  MdOutlineArrowUpward,
  MdTableRows,
  MdUnfoldLess,
  MdUnfoldMore,
} from "react-icons/md";
import { StoreContext } from "../../store";
import { Button, Label, ListItemButton, ListItemHeader } from "./components";
import { SidebarContext } from "./Sidebar";

export default observer(function Module({
  onModuleViewClick,
}: {
  onModuleViewClick: () => void;
}) {
  const store = useContext(StoreContext);
  const { headerColor } = useContext(SidebarContext);
  const { selectedModule } = store;

  return (
    <>
      <ListItemHeader color={headerColor}>Module</ListItemHeader>

      {selectedModule != null ? (
        <>
          <List.Item>
            <ButtonGroup attached w="100%">
              <Button
                onClick={() => store.moveSelectedModule("up")}
                disabled={store.selectedModule === null}
              >
                <MdOutlineArrowUpward />
                Move up
                <Kbd ml="auto">W</Kbd>
              </Button>
              <Button
                onClick={() => store.moveSelectedModule("down")}
                disabled={store.selectedModule === null}
              >
                <MdOutlineArrowDownward />
                Move down
                <Kbd ml="auto">S</Kbd>
              </Button>
            </ButtonGroup>
          </List.Item>
          <List.Item>
            <ButtonGroup attached w="100%">
              <Button
                onClick={() => store.moveNetwork("left")}
                disabled={store.selectedModule === null}
              >
                <MdOutlineArrowBack />
                Move left
                <Kbd ml="auto">A</Kbd>
              </Button>
              <Button
                onClick={() => store.moveNetwork("right")}
                disabled={store.selectedModule === null}
              >
                <MdOutlineArrowForward />
                Move right
                <Kbd ml="auto">D</Kbd>
              </Button>
            </ButtonGroup>
          </List.Item>
          <List.Item>
            <ButtonGroup attached w="100%">
              <Button
                onClick={() => store.expand(selectedModule)}
                disabled={!selectedModule.canExpand}
              >
                <MdUnfoldMore />
                Expand
                <Kbd ml="auto">E</Kbd>
              </Button>
              <Button
                onClick={() => store.regroup(selectedModule)}
                disabled={selectedModule.isTopModule}
              >
                <MdUnfoldLess />
                Contract
                <Kbd ml="auto">C</Kbd>
              </Button>
            </ButtonGroup>
          </List.Item>

          <ListItemButton onClick={onModuleViewClick}>
            <MdTableRows />
            Show node list
          </ListItemButton>

          <List.Item>
            <Label>Network</Label>
            <Editable.Root
              w="50%"
              display="inline-block"
              defaultValue={selectedModule.networkName || "Click to set name"}
              onValueCommit={(details) => {
                store.setNetworkName(selectedModule.networkId, details.value);
                store.setEditMode(false);
              }}
              onEditChange={(details) => store.setEditMode(details.edit)}
            >
              <Editable.Preview />
              <Editable.Input />
            </Editable.Root>
          </List.Item>
          <List.Item>
            <Label>Codelength</Label>
            {selectedModule.networkCodelength.toPrecision(3) + " bits"}
          </List.Item>
          <List.Item>
            <Label>Module id</Label>
            {selectedModule.moduleId}
          </List.Item>
          <List.Item>
            <Label>Module name</Label>
            <Editable.Root
              w="50%"
              display="inline-block"
              defaultValue={selectedModule.name || "Click to set name"}
              onValueCommit={(details) => {
                store.setModuleName(selectedModule, details.value);
                store.setEditMode(false);
              }}
              onEditChange={(details) => store.setEditMode(details.edit)}
            >
              <Editable.Preview />
              <Editable.Input />
            </Editable.Root>
          </List.Item>
        </>
      ) : (
        <List.Item>No module selected. Click on any module.</List.Item>
      )}
    </>
  );
});
