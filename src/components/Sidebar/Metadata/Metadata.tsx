import { ListItem } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import type { Network } from "../../../alluvial";
import { StoreContext } from "../../../store";
import { Label, ListItemHeader } from "../utils";
import MetadataCollection from "./MetadataCollection";

interface MetadataProps {
  headerColor: string;
  color: string;
}

export default observer(function Metadata({
  headerColor,
  color,
}: MetadataProps) {
  const store = useContext(StoreContext);
  const { selectedModule } = store;

  const diagramHasMeta = store.diagram.children.some(
    (network: Network) => network.haveMetadata
  );

  const selectedHasMeta = selectedModule?.parent.haveMetadata ?? false;

  return diagramHasMeta ? (
    <>
      <ListItemHeader color={headerColor}>Network metadata</ListItemHeader>

      <ListItem>
        {selectedModule != null ? (
          selectedHasMeta ? (
            <>
              <Label>{selectedModule.parent?.name ?? "Network"}</Label>
              <MetadataCollection
                metadata={selectedModule.parent.metadata}
                color={color}
              />
            </>
          ) : (
            "No metadata in network"
          )
        ) : (
          "Select a module to see network metadata"
        )}
      </ListItem>
    </>
  ) : null;
});
