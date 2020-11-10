/*---------------------------------------------------------------------------------------------
* Copyright (c) 2020 Bentley Systems, Incorporated. All rights reserved.
*--------------------------------------------------------------------------------------------*/
import { setBuddiRegion } from "@bentley/buddi-utils";
import { IModelJsExpressServer } from "@bentley/express-server";
import { IModelHost, IModelHostConfiguration } from "@bentley/imodeljs-backend";
import { BentleyCloudRpcManager, IModelReadRpcInterface, IModelTileRpcInterface } from "@bentley/imodeljs-common";
import { Presentation } from "@bentley/presentation-backend";
import { PresentationRpcInterface } from "@bentley/presentation-common";
import { SchemaRpcInterface } from "@bentley/schema-rpcinterface-common";
import { SchemaRpcInterfaceImpl } from "@bentley/schema-rpcinterface-impl";
import * as path from "path";
import { BackendConfig } from "./BackendConfig";
import { createLoggerFunctions } from "./BackendLogging";

export class GeneralPurposeIModeljsBackend {
  private readonly _appVersion: string;
  private readonly _config: BackendConfig;

  constructor(config: BackendConfig, appVersion: string) {
    this._config = config;
    this._appVersion = appVersion;
  }

  public async initialize(): Promise<void> {
    const logger = createLoggerFunctions("initialization");
    setBuddiRegion(this._config.DEPLOYMENT_ENV);

    const hostConfig = new IModelHostConfiguration();
    hostConfig.cacheDir = this._config.BACKEND_BRIEFCASE_CACHE_DIR;
    logger.logInfo(`briefcaseCacheDir: ${hostConfig.cacheDir}`);

    logger.logInfo("Starting IModelHost", { hostConfig });
    IModelHost.applicationVersion = this._appVersion;
    // IModelHost.applicationId = this._config.GPRID;
    await IModelHost.startup(hostConfig);
    logger.logInfo("IModelHost started");

    Presentation.initialize({
      rulesetDirectories: [path.join("assets", "presentation_rules")],
      localeDirectories: [path.join("assets", "locales")],
      enableSchemasPreload: true,
    });

    logger.logInfo("Finished Backend Initialization");
  }

  public async startServer() {
    const logger = createLoggerFunctions("webserver");
    const rpcInterfaces = [
      IModelReadRpcInterface,
      IModelTileRpcInterface,
      PresentationRpcInterface,
      SchemaRpcInterface,
    ];

    // Initialize Schema RPC interface
    try {
      SchemaRpcInterfaceImpl.register();
    } catch (ex) {
      logger.logError("Error! Exception thrown while initializing Schema RPC Interface");
      throw ex;
    }

    // NB: Together, these must match `metadata.name` in your k8s ReleaseDefinition.
    const title = "general-purpose-imodeljs-backend";
    const version = "v2.0";

    // Set up to serve out RPC interfaces via the Web.
    const rpcConfiguration = BentleyCloudRpcManager.initializeImpl({ info: { title, version } }, rpcInterfaces);

    const port = parseInt(this._config.BACKEND_PORT, 10);
    const server = new IModelJsExpressServer(rpcConfiguration.protocol);
    await server.initialize(port);
    logger.logInfo(`Now listening on port ${port}`);
  }
}
