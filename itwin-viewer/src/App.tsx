import "./App.scss";

import { IModelBackendOptions, Viewer, ViewerExtension } from "@bentley/itwin-viewer-react";
import React, { useEffect, useState } from "react";
import { findAvailableUnattachedRealityModels, IModelApp, RemoteBriefcaseConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import { ContextRealityModelProps, DisplayStyle3dSettingsProps, RenderMode } from "@bentley/imodeljs-common";
import { AdtDataLink } from "./AdtDataLink";
import 'tsiclient/tsiclient.css';

import AuthorizationClient from "./AuthorizationClient";
import { Header } from "./Header";
import { AnimationTool } from "./animation/BladeAnimation";

import { EventEmitter } from "events";


const ViewStyle: DisplayStyle3dSettingsProps = {
    backgroundMap: { applyTerrain: true },
    environment: {
      sky: { display: true, twoColor: false, groundColor: 9741199, nadirColor: 5464143, skyColor: 16764303, zenithColor: 16741686 },
      ground: { display: false },
    },
    viewflags: {
      noConstruct: true,
      noCameraLights: false,
      noSourceLights: false,
      noSolarLight: false,
      visEdges: false,
      hidEdges: false,
      shadows: true,
      monochrome: false,
      ambientOcclusion: false,
      thematicDisplay: false,
      renderMode: RenderMode.SmoothShade,
      backgroundMap: true,
      noTexture: false,
    },
    solarShadows: { color: 0x524f44 },
    lights: {
      solar: { direction: [-0.7391245716329828, 0.30165764029437066, -0.3281931795832247] },
      hemisphere: { intensity: 0.2 },
      portrait: { intensity: 0 },
  }
};

// I use a global emitter here to communicate to the extension.
(window as any).adtEmitter = new EventEmitter();
(window as any).adtEmitter.setMaxListeners(50);

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

      vp.overrideDisplayStyle(ViewStyle);
      const settings = vp.backgroundMapSettings.clone( { useDepthBuffer: true } );
      vp.backgroundMapSettings = settings;
      if (vp.displayStyle.scheduleScript !== undefined)
        vp.timePoint = vp.displayStyle.scheduleScript.computeDuration().high;
      const style = vp.displayStyle.clone();
      const availableModels: ContextRealityModelProps[] = await findAvailableUnattachedRealityModels(imodel.contextId, imodel);

      for (const crmProp of availableModels) {
        style.attachRealityModel(crmProp);
      }

      vp.displayStyle = style;
    });

    // Only start the fetching when imodel has connected.
    setInterval(async () => {
      for (let turbineIndex = 1; turbineIndex <= 10; ++turbineIndex) {
        // Small hack to cover 10.
        let prefix = "WTG00";
        if (turbineIndex >= 10) prefix = "WTG0";

        // powerEvent
        AdtDataLink.fetchDataForNode(prefix + turbineIndex).then((data) => {
          (window as any).adtEmitter.emit('powerevent', data);
        }).catch(() => {});

        const suffix = "-S";
        // sensorEvent
        AdtDataLink.fetchDataForNode(prefix + turbineIndex + suffix).then((data) => {
          (window as any).adtEmitter.emit('sensorevent', data);
        }).catch(() => {});
      }

      // console.log(await TimeSeries.showTsiDataForNode("WTG001"));
    }, 5000);

  }

  const extensions: ViewerExtension[] = [
    {
      name: "windfarm",
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
            defaultUiConfig={{hideDefaultStatusBar: true, hideToolSettings: true}}
          />
          </div>
        )
      )}
    </div>
  );
};

export default App;
