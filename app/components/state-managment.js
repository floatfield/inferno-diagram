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
    return [
        {
            point: "top-left",
            basePoint: {
                x: x + width,
                y: y + height
            },
            basicVectors: {
                i: [-width, 0],
                j: [0, -height]
            }
        },
        {
            point: "top",
            basePoint: {
                x: x + width / 2,
                y: y + height
            },
            basicVectors: {
                i: [1, 0],
                j: [0, -height]
            }
        },
        {
            point: "top-right",
            basePoint: {
                x: x,
                y: y + height
            },
            basicVectors: {
                i: [width, 0],
                j: [0, -height]
            }
        },
        {
            point: "right",
            basePoint: {
                x: x,
                y: y + height / 2
            },
            basicVectors: {
                i: [width, 0],
                j: [0, 1]
            }
        },
        {
            point: "bootom-right",
            basePoint: {
                x: x,
                y: y
            },
            basicVectors: {
                i: [width, 0],
                j: [0, height]
            },
        },
        {
            point: "bottom",
            basePoint: {
                x: x + width / 2,
                y: y
            },
            basicVectors: {
                i: [1, 0],
                j: [0, height]
            },
        },
        {
            point: "bottom-left",
            basePoint: {
                x: x + width,
                y: y
            },
            basicVectors: {
                i: [-width, 0],
                j: [0, height]
            },
        },
        {
            point: "left",
            basePoint: {
                x: x + width,
                y: y + height / 2
            },
            basicVectors: {
                i: [-width, 0],
                j: [0, 1]
            },
        }
    ];
}

function startResize(resize, diagram) {
    const selectedIndex = getSelectedIndex(diagram);
    const type = diagram.getIn(["components", selectedIndex, "type"]);
    const mappedPoints = {
        ellipse: getEllipseStoredPoints(resize, selectedIndex, diagram),
        line: getLineStoredPoints(resize, selectedIndex, diagram)
    };
    return mappedPoints[type] ?
        diagram.setIn(["components", selectedIndex, "resize"],
            R.assoc("points", mappedPoints[type], resize)):
        diagram;
    return diagram.setIn(["components", selectedIndex, "resize"], resize);
}

function getEllipseStoredPoints(resize, selectedIndex, diagram) {
    const cx = diagram.getIn(["components", selectedIndex, "properties", "x"]);
    const cy = diagram.getIn(["components", selectedIndex, "properties", "y"]);
    const rx = diagram.getIn(["components", selectedIndex, "properties", "rx"]);
    const ry = diagram.getIn(["components", selectedIndex, "properties", "ry"]);
    return {
        center: calculatePointCoordinates(resize, cx, cy),
        rightEdge: calculatePointCoordinates(resize, cx + rx, cy),
        bottomEdge: calculatePointCoordinates(resize, cx, cy + ry)
    };
}

function getLineStoredPoints(resize, selectedIndex, diagram) {
    const startX = diagram.getIn(["components", selectedIndex, "properties", "start", "x"]);
    const startY = diagram.getIn(["components", selectedIndex, "properties", "start", "y"]);
    const endX = diagram.getIn(["components", selectedIndex, "properties", "end", "x"]);
    const endY = diagram.getIn(["components", selectedIndex, "properties", "end", "y"]);
    return {
        start: calculatePointCoordinates(resize, startX, startY),
        end: calculatePointCoordinates(resize, endX, endY)
    };
}

function calculatePointCoordinates(resize, x, y) {
    const { basePoint, basicVectors } = resize;
    const { i, j } = basicVectors;
    const d = determinant([
        [ i[0], i[1] ],
        [ j[0], j[1] ]
    ]);
    const dx = determinant([
        [ x - basePoint.x, i[1] ],
        [ y - basePoint.y, j[1] ]
    ]);
    const dy = determinant([
        [ i[0], x - basePoint.x ],
        [ j[0], y - basePoint.y ]
    ]);
    return {
        x: dx / d,
        y: dy / d
    };
}

function determinant([[a, b], [c, d]]) {
    return a * d - c * b;
}

function resize(dragPosition, diagram) {
    return resizeShape(dragPosition, diagram);
}

function resizeShape(dragPosition, diagram) {
    const resizeMap = {
        ellipse: resizeEllipse
    };
    const selectedIndex = getSelectedIndex(diagram);
    const type = diagram.getIn(["components", selectedIndex, "type"]);
    const restricedDragPosition = getRestricedDragPosition(dragPosition, selectedIndex, diagram);
    return resizeMap[type] ?
        resizeMap[type](restricedDragPosition, selectedIndex, diagram) :
        diagram;
}

function resizeEllipse(dragPosition, selectedIndex, diagram) {
    const resize = diagram.getIn(["components", selectedIndex, "resize"]);
    const { basePoint, basicVectors, points } = resize;
    const { center, rightEdge, bottomEdge } = points;
    const i1 = [dragPosition.x - basePoint.x, 0];
    const j1 = [0, dragPosition.y - basePoint.y];
    const newCenter = getPointCoordinates([i1, j1], basePoint, center);
    const newRightEdge = getPointCoordinates([i1, j1], basePoint, rightEdge);
    const newBottomEdge = getPointCoordinates([i1, j1], basePoint, bottomEdge);
    const rx = Math.abs(newRightEdge.x - newCenter.x);
    const ry = Math.abs(newBottomEdge.y - newCenter.y);
    const updatedEllipseCoords = Immutable.fromJS({ x: newCenter.x, y: newCenter.y, rx, ry });
    // console.log({ x: newCenter.x, y: newCenter.y, rx, ry });
    const ellipse = diagram.getIn(["components", selectedIndex, "properties"]);
    const updatedEllipse = ellipse.merge(updatedEllipseCoords);
    return diagram
        .setIn(["components", selectedIndex, "properties"], updatedEllipse);
    // const start = diagram.getIn(["components", selectedIndex, "resize"]);
    // const selectedIndex = getSelectedIndex(diagram);
    // const { x, y, scaleX, scaleY } = diagram.getIn(["components", selectedIndex, "resize"]);
    // const cx = scaleX(dragPosition.x, dx, ellipse.get("x"));
    // const cy = scaleY(dragPosition.y, dy, ellipse.get("y"));
    // const rx = scaleX(dragPosition.x, dx, ellipse.get("x") + ellipse.get("rx")) - cx;
    // const ry = scaleY(dragPosition.y, dy, ellipse.get("y") + ellipse.get("ry")) - cy;
    //     .setIn(["components", selectedIndex, "resize"], {
    //         x: x + dx,
    //         y: y + dy,
    //         scaleX, scaleY
    //     });
}

function getPointCoordinates([i, j], basePoint, { x, y }) {
    return {
        x: i[0] * x + basePoint.x,
        y: j[1] * y + basePoint.y
    };
}

function getRestricedDragPosition(dragPosition, selectedIndex, diagram) {
    const point = diagram.getIn(["components", selectedIndex, "resize"]).point;
    return R.evolve({
        x: x => ["top", "bottom"].includes(point) ? 0 : x,
        y: y => ["left", "right"].includes(point) ? 0 : y
    }, dragPosition);
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
