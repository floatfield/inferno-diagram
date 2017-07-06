import {
    flattenProps,
    compose
} from "incompose";

import withShapeSelection from "./shape-selection-helper.js";

export default compose(
    flattenProps("attributes")
)(LineSettings);

function LineSettings ( props ) {
    const strokes = ["solid", "dotted", "dashed"];
    const strokeOptions = strokes.map(stroke => {
        return  <option value={ stroke } selected={ stroke === props["stroke-style"] }>
                    { stroke }
                </option>
    });
    return  <form>
                <p className={ "heading" }>{"Properties (line)"}</p>
                <div className={ "row-wrap" }>
                    <p>{"Start"}</p>
                    <div className={ "column-controls row-wrap" }>
                        <div className={ "column-wrap" }>
                            <input type="number" id={ "x1" } name={ "x1" } value={ props.start.x }/>
                            <label for={ "x1" }> {"x"} </label>
                        </div>
                        <div className={ "column-wrap" }>
                            <input type="number" id={ "y1" } name={ "y1" } value={ props.start.y }/>
                            <label for={ "y1" }> {"y"} </label>
                        </div>
                    </div>
                </div>
                <div className={ "row-wrap" }>
                    <p>{"End"}</p>
                    <div className={ "column-controls row-wrap" }>
                        <div className={ "column-wrap" }>
                            <input type="number" id={ "x2" } name={ "x2" } value={ props.end.x }/>
                            <label for={ "x2" }> {"x"} </label>
                        </div>
                        <div className={ "column-wrap" }>
                            <input type="number" id={ "y2" } name={ "y2" } value={ props.end.y}/>
                            <label for={ "y2" }> {"y"} </label>
                        </div>
                    </div>
                </div>
                <div className={ "controls" }>
                    <div className={ "row-wrap" }>
                        <label for={ "stroke" }> {"Color"} </label>
                        <input id={ "stroke" } name={ "stroke" } type="color" value={ props["stroke-color"] }/>
                    </div>
                    <div className={ "row-wrap" }>
                        <label for={ "stroke-width" }> {"Width"} </label>
                        <input type="number" id={ "stroke-width" } name={ "stroke-width" } value={ props["stroke-width"] }/>
                    </div>
                    <div className={ "row-wrap" }>
                        <label for={ "stroke-dasharray" }> {"Style"} </label>
                        <select name={ "stroke-dasharray" }>
                            { strokeOptions }
                        </select>
                    </div>
                </div>
            </form>;
}
