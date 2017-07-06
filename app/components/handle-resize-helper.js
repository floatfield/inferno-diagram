import {
    withHandlers
} from "incompose";

export default withHandlers({
    dragStart: ({ scaleX, scaleY }, props) => e => {
        console.log(props);
        const { dispatch } = props;
        const { offsetX, offsetY } = e;
        dispatch({
            type: "RESIZE_START",
            payload: {
                x: offsetX,
                y: offsetY,
                scaleX, scaleY
            }
        });
    },
    dragEnd: props => e => {
        const { dispatch } = props;
        dispatch({
            type: "RESIZE_END",
            payload: {}
        });
    }
});
