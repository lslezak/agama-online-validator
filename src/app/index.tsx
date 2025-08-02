import React from "react";
import "@patternfly/react-core/dist/styles/base.css";
import "@app/app.css";
import {
  Masthead,
  Page,
  PageSection,
  Title,
} from "@patternfly/react-core";

import { Validator } from "jsonschema";

import profileSchema from "../schema/profile.schema.json";
import storageSchema from "../schema/storage.schema.json";
import storageModelSchema from "../schema/storage.model.schema.json";
import iscsiSchema from "../schema/iscsi.schema.json";

import ProfileValidator from "./ProfileValidator";
import Notes from "./Notes";

const App: React.FunctionComponent = () => {
  const validator = new Validator();

  // TODO: get the URL from profileSchema.$id
  const baseUrl = "https://github.com/openSUSE/agama/blob/master/rust/agama-lib/share";
  // load the schema into the validator
  validator.addSchema(profileSchema);
  validator.addSchema(storageSchema, `${baseUrl}/storage.schema.json`);
  validator.addSchema(storageModelSchema, `${baseUrl}/storage.model.schema.json`);
  validator.addSchema(iscsiSchema, `${baseUrl}/iscsi.schema.json`);

  // resolve the references
  // FIXME: is this really needed? I'd expect that the references are evaluated automatically...
  for (const [name, def] of Object.entries(profileSchema.$defs)) {
    validator.addSchema(def, `${baseUrl}/profile.schema.json#/$defs/${name}`);
  }
  for (const [name, def] of Object.entries(storageSchema.$defs)) {
    validator.addSchema(def, `${baseUrl}/storage.schema.json#/$defs/${name}`);
  }
  for (const [name, def] of Object.entries(storageModelSchema.$defs)) {
    validator.addSchema(def, `${baseUrl}/storage.model.schema.json#/$defs/${name}`);
  }
  for (const [name, def] of Object.entries(iscsiSchema.$defs)) {
    validator.addSchema(def, `${baseUrl}/iscsi.schema.json#/$defs/${name}`);
  }
  // ugh, there is even a nested reference...
  validator.addSchema(storageModelSchema.$defs.drive, `${baseUrl}/storage.model.schema.json#/$defs/mdRaid`);

  if (validator.unresolvedRefs.length > 0) {
    // TODO: the validator should report an error on the page in that case...
    console.error("Unresolved references:", validator.unresolvedRefs);
  }

  const masthead = <Masthead></Masthead>;

  return (
    <Page masthead={masthead}>
      <PageSection>
        <Title headingLevel="h1">Online Agama autoinstallation profile validator</Title>
        <ProfileValidator schema={profileSchema} validator={validator} />
      </PageSection>
      <PageSection variant="secondary">
        <Notes />
      </PageSection>
    </Page>
  );
};

export default App;
