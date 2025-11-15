import React, { useCallback, useEffect, useState } from "react";
import "@patternfly/react-core/dist/styles/base.css";
import "@app/app.css";
import {
  Button,
  Form,
  FormGroup,
  Masthead,
  MastheadContent,
  Page,
  PageSection,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";

import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";

import ProfileEditor from "./ProfileEditor";
import Notes from "./Notes";
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

  const masthead = (
    <Masthead>
      <MastheadContent>
        <Toolbar>
          <ToolbarGroup align={{ default: "alignEnd" }}>
            <ToolbarContent>
              {installPrompt && (
                <ToolbarItem>
                  <Tooltip
                    content={
                      <div>
                        Install the editor as a local application. The application icon is placed on the desktop and the
                        JSON file extension is associated with the editor.
                      </div>
                    }
                  >
                    <Button variant="control" icon={<DownloadIcon />} onClick={installApp}>
                      Install app
                    </Button>
                  </Tooltip>
                </ToolbarItem>
              )}
              <ToolbarItem>
                <ThemeSwitcher theme={theme} themeChanged={themeChanged} />
              </ToolbarItem>
            </ToolbarContent>
          </ToolbarGroup>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );

  return (
    <Page masthead={masthead}>
      <PageSection>
        <Title headingLevel="h1">Agama autoinstallation profile editor and validator</Title>
      </PageSection>
      <PageSection>
        <Form>
          <FormGroup label="Version of the profile">
            <ProfileSelector onSchemaLoad={onSchemaLoad} />
          </FormGroup>
        </Form>
      </PageSection>
      <ProfileEditor isDarkTheme={isDarkTheme} schema={schema} />
      <PageSection variant="secondary">
        <PageSection>
          <Notes webAppAvailable={!!installPrompt}/>
        </PageSection>
      </PageSection>
    </Page>
  );
};

export default App;
