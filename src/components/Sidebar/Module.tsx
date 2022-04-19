import {
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
  Kbd,
  ListItem,
} from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import {
  MdFileUpload,
  MdOutlineArrowBack,
  MdOutlineArrowDownward,
  MdOutlineArrowForward,
  MdOutlineArrowUpward,
  MdUnfoldLess,
  MdUnfoldMore,
} from "react-icons/md";
import { StoreContext } from "../../store";
import { Button, Label, ListItemButton, ListItemHeader } from "./utils";

interface ModuleProps {
  headerColor: string;
  onModuleViewClick: () => void;
}

export default observer(function Module({
  headerColor,
  onModuleViewClick,
}: ModuleProps) {
  const store = useContext(StoreContext);
  const { selectedModule } = store;
  return (
    <>
      <ListItemHeader color={headerColor}>Module</ListItemHeader>

      {selectedModule != null ? (
        <>
          <ListItem>
            <ButtonGroup isAttached w="100%">
              <Button
                onClick={() => store.moveSelectedModule("up")}
                isDisabled={store.selectedModule === null}
                leftIcon={<MdOutlineArrowUpward />}
              >
                Move up
                <Kbd ml="auto">W</Kbd>
              </Button>
              <Button
                onClick={() => store.moveSelectedModule("down")}
                isDisabled={store.selectedModule === null}
                leftIcon={<MdOutlineArrowDownward />}
              >
                Move down
                <Kbd ml="auto">S</Kbd>
              </Button>
            </ButtonGroup>
          </ListItem>
          <ListItem>
            <ButtonGroup isAttached w="100%">
              <Button
                onClick={() => store.moveNetwork("left")}
                isDisabled={store.selectedModule === null}
                leftIcon={<MdOutlineArrowBack />}
              >
                Move left
                <Kbd ml="auto">A</Kbd>
              </Button>
              <Button
                onClick={() => store.moveNetwork("right")}
                isDisabled={store.selectedModule === null}
                leftIcon={<MdOutlineArrowForward />}
              >
                Move right
                <Kbd ml="auto">D</Kbd>
              </Button>
            </ButtonGroup>
          </ListItem>
          <ListItem>
            <ButtonGroup isAttached w="100%">
              <Button
                onClick={() => store.expand(selectedModule)}
                isDisabled={selectedModule.isLeafModule}
                leftIcon={<MdUnfoldMore />}
              >
                Expand
                <Kbd ml="auto">E</Kbd>
              </Button>
              <Button
                onClick={() => store.regroup(selectedModule)}
                isDisabled={selectedModule.isTopModule}
                leftIcon={<MdUnfoldLess />}
              >
                Contract
                <Kbd ml="auto">C</Kbd>
              </Button>
            </ButtonGroup>
          </ListItem>

          <ListItemButton
            onClick={onModuleViewClick}
            leftIcon={<MdFileUpload />}
          >
            Open module
          </ListItemButton>

          <ListItem>
            <Label>Network</Label>
            <Editable
              w="50%"
              display="inline-block"
              defaultValue={selectedModule.networkName || "Click to set name"}
              onSubmit={(value) => {
                store.setNetworkName(selectedModule.networkId, value);
                store.setEditMode(false);
              }}
              onCancel={() => store.setEditMode(false)}
              onEdit={() => store.setEditMode(true)}
            >
              <EditablePreview />
              <EditableInput />
            </Editable>
          </ListItem>
          <ListItem>
            <Label>Codelength</Label>
            {selectedModule.networkCodelength.toPrecision(3) + " bits"}
          </ListItem>
          <ListItem>
            <Label>Module id</Label>
            {selectedModule.moduleId}
          </ListItem>
          <ListItem>
            <Label>Module name</Label>
            <Editable
              w="50%"
              display="inline-block"
              defaultValue={selectedModule.name || "Click to set name"}
              onSubmit={(value) => {
                store.setModuleName(selectedModule, value);
                store.setEditMode(false);
              }}
              onCancel={() => store.setEditMode(false)}
              onEdit={() => store.setEditMode(true)}
            >
              <EditablePreview />
              <EditableInput />
            </Editable>
          </ListItem>
        </>
      ) : (
        <ListItem>No module selected. Click on any module.</ListItem>
      )}
    </>
  );
});
