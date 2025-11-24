import React, { useCallback, useEffect, useRef, useState } from "react";
import "@patternfly/react-core/dist/styles/base.css";
import "@app/app.css";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  FormGroup,
  Tooltip,
} from "@patternfly/react-core";

import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";

import ProfileEditor from "./ProfileEditor";
import ThemeSwitcher from "./ThemeSwitcher";
import { THEME_TYPES, useTheme } from "./useTheme";
import { ProfileSelector } from "./ProfileSelector";
import { SchemaDefinition } from "./schemaFetcher";

// the BeforeInstallPromptEvent is non-standard and not defined in the Typescript DOM library
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const App: React.FunctionComponent = () => {
  const theme = useTheme(THEME_TYPES.COLOR);
  const [isDarkTheme, setIsDarkTheme] = useState(
    theme.mode === theme.modes.DARK || (theme.mode === theme.modes.SYSTEM && theme.resolvedTheme === theme.modes.DARK),
  );
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent>();
  const [schema, setSchema] = useState<SchemaDefinition[]>([]);
  const cardRef = useRef(null as HTMLDivElement | null);

  const themeChanged = useCallback(
    (newTheme) => {
      setIsDarkTheme(newTheme === theme.modes.DARK);
    },
    [theme.modes.DARK],
  );

  const onSchemaLoad = useCallback((loadedSchema: SchemaDefinition[]) => {
    setSchema(loadedSchema);
  }, []);

  // handle events related to PWA installation
  useEffect(() => {
    const beforeInstall = function (event: BeforeInstallPromptEvent) {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", beforeInstall);

    const appInstalled = function () {
      setInstallPrompt(undefined);
    };
    window.addEventListener("appinstalled", appInstalled);

    // cleanup callback to unregister the event listeners
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", appInstalled);
    };
  });

  const installApp = function () {
    if (installPrompt) installPrompt.prompt();
  };

  return (
    <Card ref={cardRef}>
      <CardHeader
        actions={{
          hasNoOffset: true,
          actions: [
            installPrompt && (
              <Tooltip
                key="install-app-tooltip"
                content={
                  <div>
                    Install the editor as a local application. The application icon is placed on the desktop and the
                    JSON file extension is associated with the editor.
                  </div>
                }
              >
                <Button variant="control" icon={<DownloadIcon />} onClick={installApp} key="install-app-button">
                  Install app
                </Button>
              </Tooltip>
            ),
            <ThemeSwitcher theme={theme} themeChanged={themeChanged} key="theme-switcher" />,
          ],
        }}
      >
        <CardTitle>Agama autoinstallation profile editor and validator</CardTitle>
      </CardHeader>

      <CardBody>
        <Form>
          <FormGroup label="Version of the profile">
            <ProfileSelector onSchemaLoad={onSchemaLoad} />
          </FormGroup>
        </Form>
        <br/>
        <ProfileEditor isDarkTheme={isDarkTheme} schema={schema} cardRef={cardRef} installPrompt={installPrompt}/>
      </CardBody>
    </Card>
  );
};

export default App;
