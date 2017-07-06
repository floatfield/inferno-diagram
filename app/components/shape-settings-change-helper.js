import {
    withHandlers
} from "incompose";

export default withHandlers({
    change: props => e => {
        const { dispatch } = props;
        const value = e.srcElement.type === "number" ?
            parseInt(e.srcElement.value, 10) :
            e.srcElement.value;
        dispatch({
            type: "CHANGE_SETTING",
            payload: {
                name: e.srcElement.id,
                value
            }
        });
    }
});
