/*---------------------------------------------------------------------------------------------
* Copyright (c) 2020 Bentley Systems, Incorporated. All rights reserved.
*--------------------------------------------------------------------------------------------*/
import { Logger, LogLevel } from "@bentley/bentleyjs-core";
import { createScopedLogger, initializeLogging as initializeDefaultLogging } from "@bentley/logging-defaults";
import { PresentationBackendNativeLoggerCategory } from "@bentley/presentation-backend";
import { BackendConfig } from "./BackendConfig";

const backendLoggingCategory = "general-purpose-imodeljs-backend";

/** Configure backend logging */
export function initializeLogging(config: BackendConfig): void {
  initializeDefaultLogging(backendLoggingCategory, config);

  // logger categories from imodeljs-presentation
  Logger.setLevel(PresentationBackendNativeLoggerCategory.ECPresentation, LogLevel.Info);
  Logger.setLevel(PresentationBackendNativeLoggerCategory.ECPresentation_Connections, LogLevel.Info);
  Logger.setLevel(PresentationBackendNativeLoggerCategory.ECPresentation_RulesEngine_Threads, LogLevel.Info);
  Logger.setLevel(PresentationBackendNativeLoggerCategory.ECPresentation_RulesEngine_Content, LogLevel.Info);
  Logger.setLevel(PresentationBackendNativeLoggerCategory.ECPresentation_RulesEngine_Navigation, LogLevel.Info);
  Logger.setLevel(PresentationBackendNativeLoggerCategory.ECPresentation_RulesEngine_Navigation_Cache, LogLevel.Warning);
}

export function createLoggerFunctions(subcategory: string) {
  return createScopedLogger(subcategory);
}
