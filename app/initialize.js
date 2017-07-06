import Diagram from "./components/diagram.js";
import Settings from "./components/settings.js";
import diagramFactory from "./components/immutable-diagram.js";
import diagramConfig from "./components/diagram-config.js";

const { getNewDiagram, immutableDiagram, mapStrokes } = diagramFactory(diagramConfig);

function dispatch(props, action) {
    const newDiagram = getNewDiagram(props, action);
    Inferno.render( <App diagram={ newDiagram }/>, document.querySelector(".content"));
}

function App (props) {
    return  <div className="app">
                <Diagram
                        diagram={ mapStrokes(props.diagram.toJS()) }
                        dispatch={ dispatch.bind(null, props) }
                />
                <Settings
                        diagram={ props.diagram.toJS() }
                        dispatch={ dispatch.bind(null, props) }
                />
            </div>;
}

Inferno.render( <App diagram={ immutableDiagram }/>, document.querySelector(".content"));
