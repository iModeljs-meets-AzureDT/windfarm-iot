/*---------------------------------------------------------------------------------------------
* Copyright (c) 2020 Bentley Systems, Incorporated. All rights reserved.
*--------------------------------------------------------------------------------------------*/
import { loadConfig, optional, required } from "@bentley/env-config-loader";

export function loadBackendConfig() {
  return loadConfig({
    DEPLOYMENT_ENV: required,
    BACKEND_PORT: required,
    BACKEND_BRIEFCASE_CACHE_DIR: required,
    SEQ_URL: optional,
    SEQ_PORT: optional,
    SEQ_KEY: optional,
  });
}

export type BackendConfig = ReturnType<typeof loadBackendConfig>;
