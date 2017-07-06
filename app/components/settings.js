import { flattenProps, compose } from "incompose";
import EllipseSettings from "./ellipse-settings.js";
import LineSettings from "./line-settings.js";

export default compose(
    flattenProps("diagram")
)(Settings);

const settingsMap = {
    ellipse: EllipseSettings,
    line: LineSettings
};

function Settings( diagram ) {
    const selectedComponent = diagram.components.find(component => component.properties.selected);
    return selectedComponent ? getSettingsComponent(selectedComponent, diagram.dispatch) : null;
}

function getSettingsComponent(component, dispatch) {
    const ComponentSettings = settingsMap[component.type];
    return component ?
            <div className={ "settings"}>
                <ComponentSettings attributes={ component.properties } dispatch={ dispatch } />
            </div> :
            null;
}
