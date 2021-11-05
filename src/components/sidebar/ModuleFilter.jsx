import { useContext } from "react";
import { Button, Dropdown, Form, Header, Icon } from "semantic-ui-react";
import Dispatch from "../../context/Dispatch";

export default function ModuleFilter({
  selectedNetworkId,
  setSelectedNetworkId,
  networkIdOptions,
  moduleIdsForNetwork,
  setModuleIdsForNetwork,
  moduleIdOptions,
  moduleIds,
  clearFilter,
}) {
  const { dispatch } = useContext(Dispatch);

  const buttonProps = { compact: true, size: "tiny", basic: true, fluid: true };

  return (
    <>
      <Header as="h4" content="Module filter" />
      <Dropdown
        placeholder="Select network"
        selection
        clearable
        onChange={(e, { value }) => setSelectedNetworkId(value)}
        value={selectedNetworkId}
        options={networkIdOptions}
      />
      {selectedNetworkId !== "" && (
        <Form>
          <Dropdown
            placeholder="Select module ids to include"
            fluid
            autoComplete="on"
            allowAdditions={false}
            multiple
            search
            selection
            options={moduleIdOptions}
            value={moduleIdsForNetwork(selectedNetworkId)}
            onChange={(e, { value }) =>
              setModuleIdsForNetwork(selectedNetworkId)(value)
            }
          />
          <Button.Group style={{ margin: "4px 0 0 0 " }} {...buttonProps}>
            <Button
              type="submit"
              onClick={() =>
                dispatch({ type: "changeVisibleModules", value: moduleIds })
              }
              content="Apply filter"
            />
          </Button.Group>
        </Form>
      )}
      <Button.Group negative style={{ margin: "4px 0 0 0 " }} {...buttonProps}>
        <Button onClick={clearFilter} icon labelPosition="right">
          <Icon name="x" style={{ background: "transparent" }} />
          Clear filter
        </Button>
      </Button.Group>
    </>
  );
}
