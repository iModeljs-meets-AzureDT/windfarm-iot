/*global log*/
/*global updateState*/
/*global updateProperty*/
/*global sleep*/
/*jslint node: true*/

"use strict";

// Default properties
var properties = {
    gearbox: "normal",
    generator: "normal",
    converter: "normal"
};

/**
 * Entry point function called by the simulation engine.
 *
 * @param context        The context contains current time, device model and id
 * @param previousState  The device state since the last iteration
 * @param previousProperties  The device properties since the last iteration
 */
/*jslint unparam: true*/
function main(context, previousState, previousProperties) {


    if (previousProperties.converter == "normal") properties.converter = "temp-error";
    else properties.converter = "normal";
    
    updateProperty("converter", properties.converter);
}