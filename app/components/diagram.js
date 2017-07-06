import { flattenProps, compose, withHandlers } from "incompose";
import R from "ramda";
import Line from "./line.js";
import Ellipse from "./ellipse.js";
import Selection from "./selection.js";


export default compose(
    flattenProps("diagram"),
    withHandlers({
        move: props => e => {
            const { dispatch } = props;
            const { offsetX, offsetY } = e;
            const isDragging = !!props.components.find(component => component.dragPosition);
            const isResizing = !!props.components.find(component => component.resize);
            if (isDragging) {
                dispatch({
                    type: "DRAG",
                    payload: {
                        dragPosition: {
                            x: offsetX,
                            y: offsetY
                        }
                    }
                });
            } else if (isResizing) {
                dispatch({
                    type: "RESIZE",
                    payload: {
                        x: offsetX,
                        y: offsetY
                    }
                });
            }
        },
        endDrag: props => e => {
            const { dispatch } = props;
            dispatch({
                type: "RESIZE_END",
                payload: {}
            });
        }
    })
)(Diagram);

const componentsMap = {
    line: Line,
    ellipse: Ellipse
};

function createShape(dispatch, component, index) {
    const ShapeComponent = componentsMap[component.type];
    return <ShapeComponent attributes={ R.assoc("index", index, component.properties) } dispatch={ dispatch } />;
}


function Diagram( diagram ) {
    return (
            <div>
                <h2>{ diagram.title }</h2>
                <svg width="1000" height="500" onMouseMove={ diagram.move } onMouseUp={ diagram.endDrag }>
                    { diagram.components.map(createShape.bind(null, diagram.dispatch)) }
                    <Selection diagram={ diagram } dispatch={ diagram.dispatch }/>
                </svg>
            </div>
    );
};
