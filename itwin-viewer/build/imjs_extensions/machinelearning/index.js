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
__webpack_require__(10);
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
        var _a;
        // We need a location to bind the component to.
        const MLNode = document.createElement("div");
        MLNode.id = "machine-learning-panel";
        (_a = document.getElementById("root")) === null || _a === void 0 ? void 0 : _a.appendChild(MLNode);
        await imodeljs_frontend_1.IModelApp.viewManager.onViewOpen.addOnce(async () => {
            ReactDOM.render(React.createElement(MLButton_1.default, null), document.getElementById("machine-learning-panel"));
        });
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
                        React.createElement("use", { href: "/imjs_extensions/machinelearning/icons.svg#minimize" }),
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
            document.getElementById("ml-power-result").value = response["power_ML"];
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
                React.createElement("p", { className: "ml-p" },
                    React.createElement(ui_core_1.Button, { className: "ml-submit", size: ui_core_1.ButtonSize.Large, buttonType: ui_core_1.ButtonType.Blue, onClick: this.alertData.bind(this) }, "Submit"),
                    React.createElement("div", { className: "ml-label" },
                        React.createElement("label", null, "Predicted Power: "),
                        React.createElement("textarea", { readOnly: true, id: "ml-power-result" })),
                    " ",
                    React.createElement("br", null)))));
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

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var api = __webpack_require__(11);
            var content = __webpack_require__(12);

            content = content.__esModule ? content.default : content;

            if (typeof content === 'string') {
              content = [[module.i, content, '']];
            }

var options = {};

options.insert = "head";
options.singleton = false;

var update = api(content, options);



module.exports = content.locals || {};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : undefined;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(13);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.i, ".show-control-pane-button{position:absolute;bottom:10%;left:2%;box-shadow:1px 5px 0px rgba(0,0,0,0.25);z-index:1}.sample-ui{position:absolute;display:block;float:right;background-origin:border-box;background-color:#333;color:white;bottom:10%;left:2%;transition:all 500ms ease;cursor:default;border-radius:5px;border-color:var(--buic-foreground-body);padding:10px;border-style:solid;z-index:1}.control-pane-header{display:flex;flex-direction:row}.control-pane-header .control-pane-minimize{padding:0}.control-pane-header .sample-instructions{display:flex;flex-grow:1}.control-pane-header .sample-instructions>span{flex-grow:1;min-width:100px;width:300px}.control-pane-header .control-pane-close-button{float:right;padding-top:4px}.minimize-button{cursor:pointer;height:16px;width:16px;fill:white;padding:10px 16px 10px 16px}.minimize-button:hover{fill:#fff}#ml-form{display:table}.ml-p{display:table-row}.ml-label{display:table-cell}.ml-input{display:table-cell;margin-left:10px;width:92%}.ml-submit{display:table-cell !important;width:80% !important;margin-top:5px !important}#ml-power-result{vertical-align:middle;height:19px;resize:none}\n", ""]);
// Exports
module.exports = exports;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ })
/******/ ]);