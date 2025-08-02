import React from "react";
import { Content, ContentVariants, Icon, Title } from "@patternfly/react-core";
import BugIcon from '@patternfly/react-icons/dist/esm/icons/bug-icon';

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
      </Content>
    </>
  );
}
