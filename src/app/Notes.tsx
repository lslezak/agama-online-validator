import React from "react";
import { Content, ContentVariants, Icon, Title } from "@patternfly/react-core";
import BugIcon from "@patternfly/react-icons/dist/esm/icons/bug-icon";

export default function Notes(): React.ReactNode {
  return (
    <>
      <Title headingLevel="h2">Notes</Title>
      <Content component={ContentVariants.ul}>
        <Content component={ContentVariants.li}>
          This validator is just an experimental proof of concept, there might be bugs!{" "}
          <Icon>
            <BugIcon />
          </Icon>
        </Content>
        <Content component={ContentVariants.li}>
          The profile is validated directly in your browser, no data is sent outside of your machine. It is safe to
          include passwords, registration keys or similar sensitive data in the validated profile.
        </Content>
        <Content component={ContentVariants.li}>
          The editor is quite powerful, it supports highlighting and code completion (Ctrl+Space), it uses the schema
          definition to offer the possible values. The attribute description is displayed on mouse hover. To navigate
          between the found problems press F8. More actions can be found in the context menu (right mouse click) or in
          the command pallette (F1 key).
        </Content>
        {
          // do not display when running locally, the link only works from the GitHub pages build
          new URL(document.URL).hostname.endsWith(".github.io") && (
            <Content component={ContentVariants.li}>
              You can download the <a href="./agama-validator.zip">validator ZIP archive</a> and deploy the validator
              locally.
            </Content>
          )
        }
      </Content>
    </>
  );
}
