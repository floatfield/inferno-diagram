import {
    withHandlers
} from "incompose";

export default withHandlers({
    select: props => e => {
        const { dispatch } = props;
        dispatch({
            type: "SELECT_SHAPE",
            payload: {
                index: props.index
            }
        });
    },
    dragStart: props => e => {
        const { dispatch } = props;
        const { offsetX, offsetY } = e;
        if (props.selected) {
            dispatch({
                type: "DRAG_START",
                payload: {
                    dragStartPosition: {
                        x: offsetX,
                        y: offsetY
                    }
                }
            });
        }
    },
    dragEnd: props => e => {
        const { dispatch } = props;
        dispatch({
            type: "DRAG_END",
            payload: {}
        });
    }
});
