import React from "react";
import { Button, Content, ContentVariants, Icon, Title } from "@patternfly/react-core";

import CheckCircleIcon from "@patternfly/react-icons/dist/esm/icons/check-circle-icon";
import TimesCircleIcon from "@patternfly/react-icons/dist/esm/icons/times-circle-icon";
import WarningTriangleIcon from "@patternfly/react-icons/dist/esm/icons/warning-triangle-icon";

export default function ValidatorResult({ editor, errors, hasSchema }): React.ReactNode {
  if (!hasSchema) {
    return (
      <Title headingLevel="h2">
        <Icon status="warning" size="headingXl">
          <WarningTriangleIcon />
        </Icon>{" "}
        Missing schema, the profile is not validated
      </Title>
    );
  }

  if (errors.length === 0) {
    return (
      <Title headingLevel="h2">
        <Icon status="success" size="headingXl">
          <CheckCircleIcon />
        </Icon>{" "}
        The profile is valid
      </Title>
    );
  }

  return (
    <>
      <Title headingLevel="h2">
        {" "}
        <Icon status="danger" size="headingXl">
          <TimesCircleIcon />
        </Icon>{" "}
        The profile is invalid, {errors.length === 1 ? "found error:" : `found ${errors.length} errors:`}
      </Title>
      <Content component={ContentVariants.ul}>
        {errors?.map((e) => (
          <Content component={ContentVariants.li} key={e.message}>
            {e.message} (
            <Button
              variant="link"
              isInline
              onClick={() => {
                // move the cursor
                editor.setPosition({ lineNumber: e.startLineNumber, column: e.startColumn });
                // scroll if needed
                editor.revealLineInCenter(e.startLineNumber);
                // focus back to the editor
                editor.focus();
              }}
            >
              line {e.startLineNumber}
            </Button>
            )
          </Content>
        ))}
      </Content>
    </>
  );
}
