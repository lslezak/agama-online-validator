import React, { useCallback, useState } from "react";
import "@patternfly/react-core/dist/styles/base.css";
import "@app/app.css";
import {
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
} from "@patternfly/react-core";

import ProfileEditor from "./ProfileEditor";
import Notes from "./Notes";
import ThemeSwitcher from "./ThemeSwitcher";
import { THEME_TYPES, useTheme } from "./useTheme";
import { ProfileSelector } from "./ProfileSelector";
import { SchemaDefinition } from "./schemaFetcher";

const App: React.FunctionComponent = () => {
  const theme = useTheme(THEME_TYPES.COLOR);
  const [isDarkTheme, setIsDarkTheme] = useState(
    theme.mode === theme.modes.DARK || (theme.mode === theme.modes.SYSTEM && theme.resolvedTheme === theme.modes.DARK),
  );

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
          <Notes />
        </PageSection>
      </PageSection>
    </Page>
  );
};

export default App;
