import "./App.scss";

import { IModelBackendOptions, Viewer, ViewerExtension } from "@bentley/itwin-viewer-react";
import React, { useEffect, useState } from "react";
import { findAvailableUnattachedRealityModels, IModelApp, RemoteBriefcaseConnection, ScreenViewport } from "@bentley/imodeljs-frontend";
import { ContextRealityModelProps } from "@bentley/imodeljs-common";

import AuthorizationClient from "./AuthorizationClient";
import { Header } from "./Header";
import { AnimationTool } from "./animation/BladeAnimation";
// import { AnimationDebugPanel } from "./animation/AnimationUI";

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(
    AuthorizationClient.oidcClient
      ? AuthorizationClient.oidcClient.isAuthorized
      : false
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const initOidc = async () => {
      if (!AuthorizationClient.oidcClient) {
        await AuthorizationClient.initializeOidc();
      }

      try {
        // attempt silent signin
        await AuthorizationClient.signInSilent();
        setIsAuthorized(AuthorizationClient.oidcClient.isAuthorized);
      } catch (error) {
        // swallow the error. User can click the button to sign in
      }
    };
    initOidc().catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (!process.env.REACT_APP_TEST_CONTEXT_ID) {
      throw new Error(
        "Please add a valid context ID in the .env file and restart the application"
      );
    }
    if (!process.env.REACT_APP_TEST_IMODEL_ID) {
      throw new Error(
        "Please add a valid iModel ID in the .env file and restart the application"
      );
    }
  }, []);

  useEffect(() => {
    if (isLoggingIn && isAuthorized) {
      setIsLoggingIn(false);
    }
  }, [isAuthorized, isLoggingIn]);

  const onLoginClick = async () => {
    setIsLoggingIn(true);
    await AuthorizationClient.signIn();
  };

  const onLogoutClick = async () => {
    setIsLoggingIn(false);
    await AuthorizationClient.signOut();
    setIsAuthorized(false);
  };

  const onIModelConnection = async (imodel: RemoteBriefcaseConnection) => {

    // Add all unattached reality models to the viewport.
    await IModelApp.viewManager.onViewOpen.addOnce(async (vp: ScreenViewport) => {
      const i18n = IModelApp.i18n.registerNamespace("WindIotDemo");
      AnimationTool.register(i18n);

      const style = vp.displayStyle.clone();
      const availableModels: ContextRealityModelProps[] = await findAvailableUnattachedRealityModels(imodel.contextId, imodel);

      for (const crmProp of availableModels) {
        style.attachRealityModel(crmProp);
      }

      vp.displayStyle = style;
    });
  }

  const extensions: ViewerExtension[] = [
    {
      name: "machinelearning",
      url: "http://localhost:3000"
    }
  ]

  const backendOptions: IModelBackendOptions = {
    customBackend: {
      rpcParams: {
        info: {
          title: "general-purpose-imodeljs-backend", version: "v2.0"
        },
        uriPrefix: "http://localhost:3003"
      }

    }
  }

  const useCustomBackend = true;
  const useExtensions = true;

  return (
    <div>
      <Header
        handleLogin={onLoginClick}
        loggedIn={isAuthorized}
        handleLogout={onLogoutClick}
      />
      {isLoggingIn ? (
        <span>"Logging in...."</span>
      ) : (
        isAuthorized && (
          <div>
          <Viewer
            contextId={process.env.REACT_APP_TEST_CONTEXT_ID ?? ""}
            iModelId={process.env.REACT_APP_TEST_IMODEL_ID ?? ""}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            onIModelConnected={onIModelConnection}
            extensions={useExtensions? extensions : undefined}
            backend={useCustomBackend ? backendOptions : undefined}
          />
          </div>
        )
      )}
    </div>
  );
};

export default App;
