/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

  module.exports = (() => {
    if (!window.__IMODELJS_INTERNALS_DO_NOT_USE || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS)
      throw new Error("Expected globals are missing!");
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS["react"] >= "16.13.1")
      return window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["react"];
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["react"])
      throw new Error("iModel.js Shared Library " + "react" + " is loaded, but is an incompatible version." )
    throw new Error("iModel.js Shared Library " + "react" + " is not yet loaded." )
  })();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const imodeljs_frontend_1 = __webpack_require__(3);
const ui_abstract_1 = __webpack_require__(4);
const imodeljs_markup_1 = __webpack_require__(5);
const MLButton_1 = __webpack_require__(6);
const ReactDOM = __webpack_require__(9);
const React = __webpack_require__(0);
class MachineLearningUiItemsProvider {
    constructor(i18n) {
        this.id = "MachineLearningProvider";
        MachineLearningUiItemsProvider.i18n = i18n;
    }
    provideToolbarButtonItems(_stageId, stageUsage, toolbarUsage, toolbarOrientation) {
        if (stageUsage !== ui_abstract_1.StageUsage.General ||
            toolbarUsage !== ui_abstract_1.ToolbarUsage.ContentManipulation ||
            toolbarOrientation !== ui_abstract_1.ToolbarOrientation.Vertical)
            return [];
        return [
            ui_abstract_1.ToolbarItemUtilities.createActionButton("machinelearningextension-button", 200, "icon-lightbulb", "Machine Learning", () => {
                imodeljs_frontend_1.IModelApp.notifications.outputMessage(new imodeljs_frontend_1.NotifyMessageDetails(imodeljs_frontend_1.OutputMessagePriority.Info, "Machine learning button"));
            })
        ];
    }
}
exports.MachineLearningUiItemsProvider = MachineLearningUiItemsProvider;
class MachineLearningExtension extends imodeljs_frontend_1.Extension {
    constructor() {
        super(...arguments);
        // Override the _defaultNs to setup a namespace.
        this._defaultNs = "machinelearning";
    }
    /** Invoked the first time this extension is loaded. */
    async onLoad() {
        // Wait for the localization to be loaded
        await this.i18n.getNamespace(this._defaultNs).readFinished;
        await imodeljs_markup_1.MarkupApp.initialize();
        ui_abstract_1.UiItemsManager.register(new MachineLearningUiItemsProvider(this.i18n));
        // Add your initialization code here
    }
    /** Invoked each time this extension is loaded. */
    async onExecute() {
        ReactDOM.render(React.createElement(MLButton_1.default, null), document.getElementById("machine-learning-panel"));
    }
}
exports.MachineLearningExtension = MachineLearningExtension;
imodeljs_frontend_1.IModelApp.extensionAdmin.register(new MachineLearningExtension("machinelearning"));


/***/ }),
/* 3 */
/***/ (function(module, exports) {

  module.exports = (() => {
    if (!window.__IMODELJS_INTERNALS_DO_NOT_USE || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS)
      throw new Error("Expected globals are missing!");
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS["@bentley/imodeljs-frontend"] >= "2.7.0")
      return window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["@bentley/imodeljs-frontend"];
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["@bentley/imodeljs-frontend"])
      throw new Error("iModel.js Shared Library " + "@bentley/imodeljs-frontend" + " is loaded, but is an incompatible version." )
    throw new Error("iModel.js Shared Library " + "@bentley/imodeljs-frontend" + " is not yet loaded." )
  })();

/***/ }),
/* 4 */
/***/ (function(module, exports) {

  module.exports = (() => {
    if (!window.__IMODELJS_INTERNALS_DO_NOT_USE || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS)
      throw new Error("Expected globals are missing!");
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS["@bentley/ui-abstract"] >= "2.7.0")
      return window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["@bentley/ui-abstract"];
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["@bentley/ui-abstract"])
      throw new Error("iModel.js Shared Library " + "@bentley/ui-abstract" + " is loaded, but is an incompatible version." )
    throw new Error("iModel.js Shared Library " + "@bentley/ui-abstract" + " is not yet loaded." )
  })();

/***/ }),
/* 5 */
/***/ (function(module, exports) {

  module.exports = (() => {
    if (!window.__IMODELJS_INTERNALS_DO_NOT_USE || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS)
      throw new Error("Expected globals are missing!");
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS["@bentley/imodeljs-markup"] >= "2.7.0")
      return window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["@bentley/imodeljs-markup"];
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["@bentley/imodeljs-markup"])
      throw new Error("iModel.js Shared Library " + "@bentley/imodeljs-markup" + " is loaded, but is an incompatible version." )
    throw new Error("iModel.js Shared Library " + "@bentley/imodeljs-markup" + " is not yet loaded." )
  })();

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const ui_core_1 = __webpack_require__(7);
const MLClient_1 = __webpack_require__(8);
class MachineLearningPanel extends React.Component {
    componentDidMount() {
        this.setState({ collapsed: true });
    }
    switchCollapse() {
        const collapsed = !this.state.collapsed;
        this.setState({ collapsed });
    }
    render() {
        if (this.state && this.state.collapsed) {
            return (React.createElement(React.Fragment, null,
                React.createElement(ui_core_1.Button, { size: ui_core_1.ButtonSize.Large, buttonType: ui_core_1.ButtonType.Blue, className: "show-control-pane-button", onClick: this.switchCollapse.bind(this) }, "Power Prediction")));
        }
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "sample-ui" },
                React.createElement("div", { className: "control-pane-header" },
                    React.createElement("div", { className: "sample-instructions" },
                        React.createElement("span", null, "Input Parameters")),
                    React.createElement("svg", { className: "minimize-button control-pane-minimize", onClick: this.switchCollapse.bind(this) },
                        React.createElement("use", { href: "icons.svg#minimize" }),
                        React.createElement("title", null, "Minimize"))),
                React.createElement(MachineLearningForm, null))));
    }
}
exports.default = MachineLearningPanel;
class MachineLearningForm extends React.Component {
    async alertData(e) {
        e.preventDefault();
        const messageBody = {};
        try {
            [...document.getElementsByClassName("ml-input")].forEach((mlInput) => {
                let inputElement = mlInput;
                if (inputElement.name === "originSysTime") {
                    messageBody[inputElement.name] = inputElement.value;
                }
                else {
                    messageBody[inputElement.name] = parseFloat(inputElement.value);
                }
            });
            const response = await MLClient_1.default.getPredictedMLPower(JSON.stringify(messageBody));
            console.log(response);
        }
        catch (error) {
            console.error(error);
        }
    }
    render() {
        return (React.createElement("div", null,
            React.createElement("hr", null),
            React.createElement("form", { id: "ml-form" },
                React.createElement("p", { className: "ml-p" },
                    React.createElement("label", { className: "ml-label" }, "Blade 1 Pitch Angle: "),
                    React.createElement("input", { type: "text", name: "pitchAngle1", className: "ml-input", defaultValue: "1.99" }),
                    " ",
                    React.createElement("br", null)),
                React.createElement("p", { className: "ml-p" },
                    React.createElement("label", { className: "ml-label" }, "Blade 1 Pitch Angle: "),
                    React.createElement("input", { type: "text", name: "pitchAngle2", className: "ml-input", defaultValue: "2.02" }),
                    " ",
                    React.createElement("br", null)),
                React.createElement("p", { className: "ml-p" },
                    React.createElement("label", { className: "ml-label" }, "Blade 2 Pitch Angle: "),
                    React.createElement("input", { type: "text", name: "pitchAngle3", className: "ml-input", defaultValue: "1.92" }),
                    " ",
                    React.createElement("br", null)),
                React.createElement("p", { className: "ml-p" },
                    React.createElement("label", { className: "ml-label" }, "Generator Speed: "),
                    React.createElement("input", { type: "text", name: "genSpeed", className: "ml-input", defaultValue: "1212.28" }),
                    " ",
                    React.createElement("br", null)),
                React.createElement("p", { className: "ml-p" },
                    React.createElement("label", { className: "ml-label" }, "Generator Torque: "),
                    React.createElement("input", { type: "text", name: "genTorque", className: "ml-input", defaultValue: "6824.49" }),
                    " ",
                    React.createElement("br", null)),
                React.createElement("p", { className: "ml-p" },
                    React.createElement("label", { className: "ml-label" }, "Time: "),
                    React.createElement("input", { type: "text", name: "originSysTime", className: "ml-input", defaultValue: "7/29/2018 11:43:03" }),
                    " ",
                    React.createElement("br", null)),
                React.createElement("p", { className: "ml-p" },
                    React.createElement("label", { className: "ml-label" }, "Wind Direction: "),
                    React.createElement("input", { type: "text", name: "windDirection", className: "ml-input", defaultValue: "-8.6" }),
                    " ",
                    React.createElement("br", null)),
                React.createElement("p", { className: "ml-p" },
                    React.createElement("label", { className: "ml-label" }, "Wind Speed: "),
                    React.createElement("input", { type: "text", name: "windSpeed", className: "ml-input", defaultValue: "6.66" }),
                    " ",
                    React.createElement("br", null)),
                React.createElement("p", { className: "ml-p" },
                    React.createElement("label", { className: "ml-label" }, "Yaw Position: "),
                    React.createElement("input", { type: "text", name: "yawPosition", className: "ml-input", defaultValue: "5.05" }),
                    " ",
                    React.createElement("br", null)),
                React.createElement("label", { className: "ml-label" }),
                React.createElement(ui_core_1.Button, { className: "ml-submit", size: ui_core_1.ButtonSize.Large, buttonType: ui_core_1.ButtonType.Blue, onClick: this.alertData.bind(this) }, "Submit"))));
    }
}
exports.MachineLearningForm = MachineLearningForm;


/***/ }),
/* 7 */
/***/ (function(module, exports) {

  module.exports = (() => {
    if (!window.__IMODELJS_INTERNALS_DO_NOT_USE || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS)
      throw new Error("Expected globals are missing!");
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS["@bentley/ui-core"] >= "2.7.0")
      return window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["@bentley/ui-core"];
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["@bentley/ui-core"])
      throw new Error("iModel.js Shared Library " + "@bentley/ui-core" + " is loaded, but is an incompatible version." )
    throw new Error("iModel.js Shared Library " + "@bentley/ui-core" + " is not yet loaded." )
  })();

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class MLClient {
    static async getPredictedMLPower(inputParams) {
        const response = await fetch(this.url, {
            method: "POST",
            body: inputParams,
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                throw response.statusText;
            }
        })
            .then((data) => {
            return data;
        });
        return response;
    }
}
exports.default = MLClient;
MLClient.url = "http://localhost:7071/api/triggerml";


/***/ }),
/* 9 */
/***/ (function(module, exports) {

  module.exports = (() => {
    if (!window.__IMODELJS_INTERNALS_DO_NOT_USE || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS || !window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS)
      throw new Error("Expected globals are missing!");
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS_VERS["react-dom"] >= "16.13.1")
      return window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["react-dom"];
    if (window.__IMODELJS_INTERNALS_DO_NOT_USE.SHARED_LIBS["react-dom"])
      throw new Error("iModel.js Shared Library " + "react-dom" + " is loaded, but is an incompatible version." )
    throw new Error("iModel.js Shared Library " + "react-dom" + " is not yet loaded." )
  })();

/***/ })
/******/ ]);