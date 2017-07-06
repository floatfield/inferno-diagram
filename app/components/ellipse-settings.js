import {
    flattenProps,
    compose
} from "incompose";

import withSettingsChange from "./shape-settings-change-helper.js";

export default compose(
    flattenProps("attributes"),
    withSettingsChange
)(EllipseSettings);

function EllipseSettings ( props ) {
    const strokes = ["solid", "dotted", "dashed"];
    const strokeOptions = strokes.map(stroke => {
        return  <option value={ stroke } selected={ stroke === props["stroke-style"] }>
                    { stroke }
                </option>
    });
    return  <form>
                <p className={ "heading" }>{"Properties (ellipse)"}</p>
                <div className={ "row-wrap" }>
                    <p>{"Position"}</p>
                    <div className={ "column-controls row-wrap" }>
                        <div className={ "column-wrap" }>
                            <input type="number" id={ "x" } name={ "x" } value={props.x} onChange={props.change}/>
                            <label for={ "x" }> {"x"} </label>
                        </div>
                        <div className={ "column-wrap" }>
                            <input type="number" id={ "y" } name={ "y" } value={props.y} onChange={props.change}/>
                            <label for={ "y" }> {"y"} </label>
                        </div>
                    </div>
                </div>
                <div className={ "row-wrap" }>
                    <p>{"Size"}</p>
                    <div className={ "column-controls row-wrap" }>
                        <div className={ "column-wrap" }>
                            <input type="number" id={ "rx" } name={ "rx" } value={props.rx} onChange={props.change}/>
                            <label for={ "rx" }> {"rx"} </label>
                        </div>
                        <div className={ "column-wrap" }>
                            <input type="number" id={ "ry" } name={ "ry" } value={props.ry} onChange={props.change}/>
                            <label for={ "ry" }> {"ry"} </label>
                        </div>
                    </div>
                </div>
                <div className={ "background" }>
                    <div className={ "row-wrap" }>
                        <p> {"Background"} </p>
                        <input id={ "fill" } type="color" name={ "fill" } value={props.fill} onChange={props.change}/>
                    </div>
                </div>
                <div className={ "border controls" }>
                    <p>{"Border"}</p>
                    <div className={ "row-wrap" }>
                        <label for={ "stroke-color" }> {"Color"} </label>
                        <input id={ "stroke-color" } type="color" name={ "stroke-color" } value={props["stroke-color"]} onChange={props.change}/>
                    </div>
                    <div className={ "row-wrap" }>
                        <label for={ "stroke-width" }> {"Width"} </label>
                        <input type="number" id={ "stroke-width" } name={ "stroke-width" } value={props["stroke-width"]} onChange={props.change}/>
                    </div>
                    <div className={ "row-wrap" }>
                        <label for={ "stroke-style" }> {"Style"} </label>
                        <select id={ "stroke-style" } name={ "stroke-style" } onChange={props.change}>
                            { strokeOptions }
                        </select>
                    </div>
                </div>
            </form>;
}
