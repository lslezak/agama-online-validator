import React, { useEffect } from "react";
import { Button, Content, ContentVariants, Icon, Title } from "@patternfly/react-core";
import * as monaco from "monaco-editor";

import CheckCircleIcon from "@patternfly/react-icons/dist/esm/icons/check-circle-icon";
import TimesCircleIcon from "@patternfly/react-icons/dist/esm/icons/times-circle-icon";
import WarningTriangleIcon from "@patternfly/react-icons/dist/esm/icons/warning-triangle-icon";

interface ValidatorResultProps {
  editor?: monaco.editor.IStandaloneCodeEditor;
  errors: monaco.editor.IMarker[];
  hasSchema: boolean;
}

export default function ValidatorResult({ editor, errors, hasSchema }: ValidatorResultProps): React.ReactNode {
  // Hack to recover from "No schema request service available" error
  const missingSchemaService =
    hasSchema && errors.length === 1 && errors[0].message.includes("No schema request service available");

  useEffect(() => {
    if (missingSchemaService) window.location.reload();
  }, [missingSchemaService]);

  const showError = (error: monaco.editor.IMarker) => {
    if (!editor) return;

    // move the cursor
    editor.setPosition({ lineNumber: error.startLineNumber, column: error.startColumn });
    // scroll if needed
    editor.revealLineInCenter(error.startLineNumber);
    // focus back to the editor
    editor.focus();
  };

  if (!hasSchema) {
    return (
      <Title headingLevel="h3">
        <Icon status="warning" size="headingXl">
          <WarningTriangleIcon />
        </Icon>{" "}
        Missing schema, the profile is not validated
      </Title>
    );
  }

  if (errors.length === 0) {
    return (
      <Title headingLevel="h3">
        <Icon status="success" size="headingXl">
          <CheckCircleIcon />
        </Icon>{" "}
        The profile is valid
      </Title>
    );
  }

  return (
    <>
      <Title headingLevel="h3">
        <Icon status="danger" size="headingXl">
          <TimesCircleIcon />
        </Icon>{" "}
        The profile is invalid, {errors.length === 1 ? "found error:" : `found ${errors.length} errors:`}
      </Title>
      <Content component={ContentVariants.ul}>
        {errors.map((error, index) => (
          // the same message might be reported at several places
          <Content component={ContentVariants.li} key={`${index}-${error.message}`}>
            {error.message} (
            <Button variant="link" isInline onClick={() => showError(error)}>
              line {error.startLineNumber}
            </Button>
            )
          </Content>
        ))}
      </Content>
    </>
  );
}
