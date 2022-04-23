import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import localforage from "localforage";
import { useContext } from "react";
import { Context } from "./context";
import { getLocalStorageFiles } from "./utils";

localforage.config({ name: "infomap" });

export default function InfomapOnline({
  isDisabled,
  onFileClick,
}: {
  isDisabled: boolean;
  onFileClick: (file: File) => void;
}) {
  const { state, dispatch } = useContext(Context);
  const { localStorageFiles } = state;

  const loadLocalStorage = async () => {
    try {
      const localStorageFiles = await getLocalStorageFiles();
      dispatch({ type: "set", payload: { localStorageFiles } });
    } catch (e: any) {
      console.warn(e);
    }
  };

  return (
    <Menu onOpen={loadLocalStorage}>
      <MenuButton
        as={Button}
        disabled={isDisabled}
        variant="outline"
        rightIcon={<ChevronDownIcon />}
      >
        Infomap Online
      </MenuButton>
      <MenuList>
        {localStorageFiles.map((file, i) => (
          <MenuItem key={i} onClick={() => onFileClick(file)}>
            {file.name}
          </MenuItem>
        ))}
        {localStorage.length !== 0 && <MenuDivider />}
        <MenuItem
          icon={<DeleteIcon />}
          isDisabled={localStorage.length === 0}
          onClick={() => {
            dispatch({ type: "set", payload: { localStorageFiles: [] } });
            void localforage.clear();
          }}
        >
          Clear
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
