import { ListItem } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import type { Network } from "../../../alluvial";
import { StoreContext } from "../../../store";
import ErrorBoundary from "../../ErrorBoundary";
import { Label, ListItemHeader } from "../Components";
import MetadataCollection from "./MetadataCollection";

export default observer(function Metadata({
  headerColor,
  color,
}: {
  headerColor: string;
  color: string;
}) {
  const store = useContext(StoreContext);
  const { selectedModule } = store;

  const diagramHaveMeta = store.diagram.children.some(
    (network: Network) => network.haveMetadata
  );

  if (!diagramHaveMeta) return null;

  const network = selectedModule?.parent;

  const diagramMeta = store.diagram.children
    .filter((net) => net.haveMetadata && net !== network)
    .map((net) => net.metadata);

  return (
    <>
      <ListItemHeader color={headerColor}>Network metadata</ListItemHeader>

      <ListItem>
        {selectedModule != null ? (
          network?.haveMetadata ? (
            <>
              <Label>{network.name ?? "Network"}</Label>
              <ErrorBoundary>
                <MetadataCollection
                  networkMeta={network.metadata}
                  diagramMeta={diagramMeta}
                  color={color}
                />
              </ErrorBoundary>
            </>
          ) : (
            "No metadata in network"
          )
        ) : (
          "Select a module to see network metadata"
        )}
      </ListItem>
    </>
  );
});
