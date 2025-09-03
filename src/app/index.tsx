import React, { useState } from "react";
import "@patternfly/react-core/dist/styles/base.css";
import "@app/app.css";
import {
  Masthead,
  MastheadContent,
  Page,
  PageSection,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";

import ProfileEditor from "./ProfileEditor";
import Notes from "./Notes";
import ThemeSwitcher from "./ThemeSwitcher";
import { THEME_TYPES, useTheme } from "./useTheme";

const App: React.FunctionComponent = () => {
  const theme = useTheme(THEME_TYPES.COLOR);

  const [isDarkTheme, setIsDarktheme] = useState(
    theme.mode === theme.modes.DARK || (theme.mode === theme.modes.SYSTEM && theme.resolvedTheme === theme.modes.DARK),
  );

  const themeChanged = (newTheme) => {
    setIsDarktheme(newTheme === theme.modes.DARK);
  };

  const masthead = (
    <Masthead>
      <MastheadContent>
        <Toolbar>
          <ToolbarGroup align={{ default: "alignEnd" }}>
            <ToolbarContent>
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
        <ProfileEditor isDarkTheme={isDarkTheme} />
      </PageSection>
      <PageSection variant="secondary">
        <PageSection>
          <Notes />
        </PageSection>
      </PageSection>
    </Page>
  );
};

export default App;
