import React from "react";

import AlluvialDiagram from "./AlluvialDiagram";
import FileLoadingScreen from "./FileLoadingScreen";
import Sidebar from "./Sidebar";

export default class App extends React.Component {
  state = {
    width: 1200,
    height: 600,
    duration: 400,
    maxModuleWidth: 300,
    streamlineFraction: 2,
    streamlineOpacity: 0.5,
    moduleFlowThreshold: 8e-3,
    streamlineThreshold: 1,
    networks: []
  };

  validNumber = value => (Number.isNaN(+value) ? 0 : +value);

  render() {
    const {
      networks,
      width,
      height,
      maxModuleWidth,
      streamlineFraction,
      streamlineOpacity,
      duration,
      moduleFlowThreshold,
      streamlineThreshold
    } = this.state;

    const loadingComplete = networks.length > 0;

    return !loadingComplete ? (
      <FileLoadingScreen onSubmit={networks => this.setState({ networks })} />
    ) : (
      <Sidebar
        width={width}
        onWidthChange={(e, { value }) =>
          this.setState({ width: this.validNumber(value) })
        }
        height={height}
        onHeightChange={(e, { value }) =>
          this.setState({ height: this.validNumber(value) })
        }
        streamlineFraction={streamlineFraction}
        onStreamlineFractionChange={streamlineFraction =>
          this.setState({ streamlineFraction })
        }
        streamlineOpacity={streamlineOpacity}
        onStreamlineOpacityChange={streamlineOpacity =>
          this.setState({ streamlineOpacity })
        }
        duration={duration}
        onDurationChange={duration => this.setState({ duration })}
        moduleFlowThreshold={moduleFlowThreshold}
        onModuleFlowThresholdChange={moduleFlowThreshold => this.setState({ moduleFlowThreshold })}
        streamlineThreshold={streamlineThreshold}
        onStreamlineThresholdChange={streamlineThreshold => this.setState({ streamlineThreshold })}
        maxModuleWidth={maxModuleWidth}
        onMaxModuleWidthChange={maxModuleWidth => this.setState({ maxModuleWidth })}
      >
        <React.StrictMode>
          <AlluvialDiagram
            networks={networks}
            width={width}
            height={height}
            maxModuleWidth={+maxModuleWidth}
            streamlineFraction={+streamlineFraction}
            streamlineOpacity={+streamlineOpacity}
            duration={+duration}
            moduleFlowThreshold={+moduleFlowThreshold}
            streamlineThreshold={+streamlineThreshold}
          />
        </React.StrictMode>
      </Sidebar>
    );
  }
}
