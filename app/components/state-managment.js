import R from "ramda";
import Immutable from "immutable";

const deselectAllExceptOne = R.curry(function(index, diagram) {
    const selectedIndex = diagram.get("components").findIndex((component, i) => {
        return component.getIn(["properties", "selected"]) && i !== index;
    });
    return selectedIndex >= 0 ?
        diagram.setIn(["components", selectedIndex, "properties", "selected"], false) :
        diagram;
});

const toggleSelection = R.curry(function(index, diagram) {
    const isDragging = diagram.get("dragging");
    const isSelected = diagram.getIn(["components", index, "properties", "selected"]);
    return isDragging ?
        diagram.delete("dragging") :
        diagram.setIn(["components", index, "properties", "selected"], !isSelected);
});

const getSelectedIndex = function(diagram) {
    return diagram.get("components").findIndex((component, i) => {
        return component.getIn(["properties", "selected"]);
    });
};

const dragShape = function(dragPosition, diagram) {
    return R.compose(
        setDragFlag,
        setDragPosition(dragPosition),
        moveShape(dragPosition)
    )(diagram);
};

const setDragFlag = function(diagram) {
    return diagram.set("dragging", true);
};

const setDragPosition = R.curry(function(dragPosition, diagram) {
    const selectedIndex = getSelectedIndex(diagram);
    return diagram.setIn(["components", selectedIndex, "dragPosition"],
        Immutable.fromJS(dragPosition));
});

const moveShape = R.curry(function(dragPosition, diagram) {
    const selectedIndex = getSelectedIndex(diagram);
    const start = diagram.getIn(["components", selectedIndex, "dragPosition"]);
    const deltas = getDragDelta(dragPosition, start);
    return applyDeltas(deltas, diagram);
});

const getDragDelta = function({ x, y }, start) {
    return {
        dx: x - start.get("x"),
        dy: y - start.get("y")
    };
};

const applyDeltas = function(deltas, diagram) {
    const moveType = {
        ellipse: moveEllipse,
        line: moveLine
    };
    const selectedIndex = getSelectedIndex(diagram);
    const type = diagram.getIn(["components", selectedIndex, "type"]);
    return moveType[type] ? moveType[type](deltas, selectedIndex, diagram) : diagram;
};

const moveEllipse = function({ dx, dy }, selectedIndex, diagram) {
    const cx = diagram.getIn(["components", selectedIndex, "properties", "x"]);
    const cy = diagram.getIn(["components", selectedIndex, "properties", "y"]);
    const newDiagram = diagram.setIn(["components", selectedIndex, "properties", "x"], cx + dx);
    return newDiagram.setIn(["components", selectedIndex, "properties", "y"], cy + dy);
};

const moveLine = function(deltas, selectedIndex, diagram) {
    const newDiagram = diagram.updateIn(["components", selectedIndex, "properties", "start"], updatePoint(deltas));
    return newDiagram.updateIn(["components", selectedIndex, "properties", "end"], updatePoint(deltas));
};

const updatePoint = R.curry(function({ dx, dy }, point) {
    const newPoint = point.update("x", x => x + dx);
    return newPoint.update("y", y => y + dy);
});

const clearDragPosition = function(diagram) {
    const selectedIndex = getSelectedIndex(diagram);
    return diagram.deleteIn(["components", selectedIndex, "dragPosition"]);
};

function getSelectionHandlesCoords({ x, y, width, height }) {
    // TODO add base point coordinates for each entry
    return [
        {
            point: "top-left",
            x: x,
            y: y,
            transformDragPosition: identity
        },
        {
            point: "top",
            x: x + width / 2,
            y: y,
            transformDragPosition: preserveX(x)
        },
        {
            point: "top-right",
            x: x + width,
            y: y,
            transformDragPosition: identity
        },
        {
            point: "right",
            x: x + width,
            y: y + height / 2,
            transformDragPosition: preserveY(y)
        },
        {
            point: "bootom-right",
            x: x + width,
            y: y + height,
            transformDragPosition: identity
        },
        {
            point: "bottom",
            x: x + width / 2,
            y: y + height,
            transformDragPosition: preserveX(x)
        },
        {
            point: "bottom-left",
            x: x,
            y: y + height,
            transformDragPosition: identity
        },
        {
            point: "left",
            x: x,
            y: y + height / 2,
            transformDragPosition: preserveY(y)
        }
    ];
}

const identity = R.identity;

const preserveX = R.curry(function(x0, { x, y }) {
    return { x: x0, y };
});

const preserveY = R.curry(function(y0, { x, y }) {
    return { x, y: y0 };
});

function startResize(resize, diagram) {
    const selectedIndex = getSelectedIndex(diagram);
    return diagram.setIn(["components", selectedIndex, "resize"], resize);
}

function resize(dragPosition, diagram) {
    const selectedIndex = getSelectedIndex(diagram);
    const start = diagram.getIn(["components", selectedIndex, "resize"]);
    const deltas = getResizeDelta(dragPosition, start);
    return resizeShape(dragPosition, deltas, diagram);
}

const getResizeDelta = function({ x, y }, start) {
    return {
        dx: x - start.x,
        dy: y - start.y
    };
};

function resizeShape(dragPosition, deltas, diagram) {
    const resizeMap = {
        ellipse: resizeEllipse
    };
    const selectedIndex = getSelectedIndex(diagram);
    const selectedShapeType = diagram.getIn(["components", selectedIndex, "type"]);
    return resizeMap[selectedShapeType] ?
        resizeMap[selectedShapeType](dragPosition, deltas, diagram) :
        diagram;
}

function resizeEllipse(dragPosition, { dx, dy }, diagram) {
    const selectedIndex = getSelectedIndex(diagram);
    const ellipse = diagram.getIn(["components", selectedIndex, "properties"]);
    const { x, y, scaleX, scaleY } = diagram.getIn(["components", selectedIndex, "resize"]);
    const cx = scaleX(dragPosition.x, dx, ellipse.get("x"));
    const cy = scaleY(dragPosition.y, dy, ellipse.get("y"));
    const rx = Math.abs(scaleX(dragPosition.x, dx, ellipse.get("x") + ellipse.get("rx")) - cx);
    console.log(cx, rx, dragPosition);
    const ry = scaleY(dragPosition.y, dy, ellipse.get("y") + ellipse.get("ry")) - cy;
    const updatedEllipseCoords = Immutable.fromJS({ x: cx, y: cy, rx, ry });
    const updatedEllipse = ellipse.merge(updatedEllipseCoords);
    return diagram
        .setIn(["components", selectedIndex, "properties"], updatedEllipse)
        .setIn(["components", selectedIndex, "resize"], {
            x: x + dx,
            y: y + dy,
            scaleX, scaleY
        });
}

function endResize(diagram) {
    const selectedIndex = getSelectedIndex(diagram);
    return diagram.deleteIn(["components", selectedIndex, "resize"]);
}

export {
    deselectAllExceptOne,
    toggleSelection,
    getSelectedIndex,
    dragShape,
    clearDragPosition,
    getSelectionHandlesCoords,
    startResize,
    resize,
    endResize
};
