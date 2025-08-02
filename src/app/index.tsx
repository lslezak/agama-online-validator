import React from "react";
import "@patternfly/react-core/dist/styles/base.css";
import "@app/app.css";
import {
  Masthead,
  Page,
  PageSection,
  Title,
} from "@patternfly/react-core";

import ProfileEditor from "./ProfileEditor";
import Notes from "./Notes";

const App: React.FunctionComponent = () => {
  const masthead = <Masthead></Masthead>;

  return (
    <Page masthead={masthead}>
      <PageSection>
        <Title headingLevel="h1">Agama autoinstallation profile editor and validator</Title>
        <ProfileEditor/>
      </PageSection>
      <PageSection variant="secondary">
        <Notes />
      </PageSection>
    </Page>
  );
};

export default App;
