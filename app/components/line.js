import { flattenProps, compose } from "incompose";
import withShapeSelection from "./shape-selection-helper.js";

export default compose(
    flattenProps("attributes"),
    withShapeSelection
)(Line);

function Line ( props ) {
    return  <line
                x1={ props.start.x }
                y1={ props.start.y }
                x2={ props.end.x }
                y2={ props.end.y }
                stroke={ props["stroke-color"] }
                stroke-width={ props["stroke-width"] }
                stroke-dasharray={ props["stroke-style"] }
                onClick={ props.select }
                onMouseDown={ props.dragStart }
                onMouseUp={ props.dragEnd }>
            </line>;
}
