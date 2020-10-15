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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const imodeljs_frontend_1 = __webpack_require__(2);
const ui_abstract_1 = __webpack_require__(3);
const imodeljs_markup_1 = __webpack_require__(4);
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
    }
}
exports.MachineLearningExtension = MachineLearningExtension;
imodeljs_frontend_1.IModelApp.extensionAdmin.register(new MachineLearningExtension("machinelearning"));


/***/ }),
/* 2 */
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
/* 3 */
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
/* 4 */
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

/***/ })
/******/ ]);