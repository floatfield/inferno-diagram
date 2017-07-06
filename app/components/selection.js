import { flattenProps, compose } from "incompose";
import { getSelectionHandlesCoords } from "./state-managment.js";
import withHandleResize from "./handle-resize-helper.js";

export default compose(
    flattenProps("diagram"),
    withHandleResize
)(Selection);

function Selection ( props ) {
    const selectionCoords = getSelectionCoords(props);
    if (selectionCoords) {
        const { x, y, width, height } = selectionCoords;
        const selectionHandlesCoords = getSelectionHandlesCoords(selectionCoords);
        const handles = selectionHandlesCoords.map(drawResizeHandle.bind(null, props));
        return (
                <g mouseMove={ props.drag }>
                    <rect
                        className="selection"
                        x={ x }
                        y={ y }
                        width={ width }
                        height={ height }
                    />
                    { handles }
                </g>
        );
    } else {
        return null;
    }
}

function getSelectionCoords(diagram) {
    const selectedComponent = diagram.components.find(component => component.properties.selected);
    return selectedComponent ? getComponentSelectionCoords(selectedComponent) : undefined;
}

function getComponentSelectionCoords(component) {
    const types = {
        ellipse: getEllipseSelectionCoords,
        line: getLineSelectionCoords
    };
    return types[component.type] ? types[component.type](component.properties) : undefined;
}

function getEllipseSelectionCoords(properties) {
    const { x, y, rx, ry } = properties;
    const strokeWidth = properties["stroke-width"];
    return {
        x: x - rx - strokeWidth / 2,
        y: y - ry - strokeWidth / 2,
        width: 2 * rx + strokeWidth,
        height: 2 * ry + strokeWidth
    };
}

function getLineSelectionCoords(properties) {
    const { start, end } = properties;
    const strokeWidth = properties["stroke-width"];
    return {
        x: Math.min(start.x, end.x) - strokeWidth / 2,
        y: Math.min(start.y, end.y) - strokeWidth / 2,
        width: Math.abs(start.x - end.x) + strokeWidth,
        height: Math.abs(start.y - end.y) + strokeWidth
    };
}

function drawResizeHandle(props, { x, y, transformDragPosition }) {
    return (
        <rect
            className="selection-handle"
            x={ x - 3 }
            y={ y - 3 }
            width={ 6 }
            height={ 6 }
            onMouseDown={ dragStart.bind(null, transformDragPosition, props) }
        />
    );
}

function dragStart(transformDragPosition, props, e) {
    const { dispatch } = props;
    const { offsetX, offsetY } = e;
    dispatch({
        type: "RESIZE_START",
        payload: {
            x: offsetX,
            y: offsetY,
            transformDragPosition
        }
    });
}
