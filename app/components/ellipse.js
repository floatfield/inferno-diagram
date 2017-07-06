import {
    flattenProps,
    compose
} from "incompose";

import withShapeSelection from "./shape-selection-helper.js";

export default compose(
    flattenProps("attributes"),
    withShapeSelection
)(Ellipse);

function Ellipse ( props ) {
    return  <ellipse
                cx={ props.x }
                cy={ props.y }
                rx={ props.rx }
                ry={ props.ry }
                fill={ props.fill }
                stroke={ props["stroke-color"] }
                stroke-width={ props["stroke-width"] }
                stroke-dasharray={ props["stroke-style"] }
                onClick={ props.select }
                onMouseDown={ props.dragStart }
                onMouseUp={ props.dragEnd }>
            </ellipse>;
}
