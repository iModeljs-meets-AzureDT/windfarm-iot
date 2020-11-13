/*---------------------------------------------------------------------------------------------
* Copyright (c) 2020 Bentley Systems, Incorporated. All rights reserved.
*--------------------------------------------------------------------------------------------*/
import { loadBackendConfig } from "./BackendConfig";
import { createLoggerFunctions, initializeLogging } from "./BackendLogging";
import { GeneralPurposeIModeljsBackend } from "./GeneralPurposeImodeljsBackend";

const config = loadBackendConfig();
initializeLogging(config);

const { logInfo, logException } = createLoggerFunctions("main");
logInfo("GENERAL PURPOSE IMODELJS BACKEND STARTED", { nodeVersions: process.versions });

// tslint:disable-next-line:no-floating-promises
(async () => {
  try {
    const appVersion = require("../package.json").version;
    const backend = new GeneralPurposeIModeljsBackend(config, appVersion);
    await backend.initialize();
    await backend.startServer();
    logInfo(`GENERAL PURPOSE IMODELJS BACKEND READY`);
  } catch (error) {
    logException(error, "Unhandled exception thrown in general-purpose-imodeljs-backend");
    process.exitCode = 1;
  }
})();
