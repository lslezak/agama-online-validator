import React from "react";
import { Content, ContentVariants, Icon, Title } from "@patternfly/react-core";

import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import TimesCircleIcon from '@patternfly/react-icons/dist/esm/icons/times-circle-icon';

export default function ValidatorResult({ errors }): React.ReactNode {
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
        The profile is invalid
      </Title>
      <Title headingLevel="h3">Found errors:</Title>
      <Content component={ContentVariants.ul}>
        {errors?.map((e) => (
          <Content component={ContentVariants.li} key={e}>
            {e}
          </Content>
        ))}
      </Content>
    </>
  );
}
