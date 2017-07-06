import {
    deselectAllExceptOne,
    toggleSelection,
    getSelectedIndex,
    dragShape,
    clearDragPosition,
    getSelectionHandlesCoords,
    startResize,
    resize,
    endResize
} from './state-managment.js';
import Immutable from 'immutable';
import R from 'ramda';

function mapComponentStrokes(components) {
    return components.map(R.evolve({
        properties: {
            "stroke-style": mapStroke
        }
    }));
}

function mapStroke(strokeStyle) {
    const strokes = {
        "dashed": "8, 10",
        "dotted": "1, 4",
        "solid": "0"
    };
    return strokes[strokeStyle] || strokes.solid;
}

const mapStrokes = R.evolve({
    components: mapComponentStrokes
});

function getNewDiagram(props, action) {
    const actions = {
        "SELECT_SHAPE": selectShape,
        "DRAG_START": dragStart,
        "DRAG": drag,
        "DRAG_END": dragEnd,
        "CHANGE_SETTING": changeSetting,
        "RESIZE_START": startResize,
        "RESIZE_END": resizeEnd,
        "RESIZE": resize
    };
    const handler = actions[action.type];
    return handler ?
        handler(action.payload, props.diagram) :
        props.diagram;
}

function selectShape({ index }, diagram) {
    return R.compose(
        toggleSelection(index),
        deselectAllExceptOne(index)
    )(diagram);
}

function dragStart({ dragStartPosition }, diagram) {
    const selectedIndex = getSelectedIndex(diagram);
    return diagram.setIn(["components", selectedIndex, "dragPosition"],
        Immutable.fromJS(dragStartPosition));
}

function drag({ dragPosition }, diagram) {
    const selectedIndex = getSelectedIndex(diagram);
    const isDragging = diagram.hasIn(["components", selectedIndex, "dragPosition"]);
    return isDragging ? dragShape(dragPosition, diagram) : diagram;
}

function dragEnd({}, diagram) {
    return clearDragPosition(diagram);
}

function changeSetting({ name, value }, diagram) {
    const selectedIndex = getSelectedIndex(diagram);
    const type = diagram.getIn(["components", selectedIndex, "type"]);
    const propsMap = {
        x1: ["start", "x"],
        y1: ["start", "y"],
        x2: ["end", "x"],
        y2: ["end", "y"],
    };
    const propertyPath = propsMap[name] || [name];
    return diagram.setIn(["components", selectedIndex, "properties"].concat(propertyPath),
        value);
}

function resizeEnd({}, diagram) {
    return endResize(diagram);
}

let immutableDiagram;

export default function(diagramConfig) {
    immutableDiagram = Immutable.fromJS(diagramConfig);
    return { getNewDiagram, immutableDiagram, mapStrokes };
};
