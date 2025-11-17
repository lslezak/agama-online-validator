import React from "react";
import { Content, ContentVariants, Icon, Title } from "@patternfly/react-core";
import BugIcon from "@patternfly/react-icons/dist/esm/icons/bug-icon";

export default function Notes({ webAppAvailable }): React.ReactNode {
  return (
    <>
      <Title headingLevel="h3">Notes</Title>
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
        {"serviceWorker" in navigator && (
          <Content component={ContentVariants.li}>
            <p>
              The validator can be also used offline, without any internet access. The page and the JSON validation
              schema files are cached in the browser. If network is not available these cached files are used to provide
              the functionality. In some browsers it can be installed as a web application.
            </p>

            {webAppAvailable && (
              <p>
                Press the &quot;Install app&quot; button in the top right corner to install it as a web application.
                This adds creates a shortcut on the desktop and associates the <code>*.json</code> extension with the
                web application. See more details about the web applications in the{" "}
                <a href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing">
                  Mozilla documentation
                </a>
                .
              </p>
            )}

            {webAppAvailable && (
              <p>
                <em>
                  Note: This is supported only in some browsers. Not all browsers support installing web applications
                  (PWA). It should work in all Chrome based browsers. Firefox in Linux requires a{" "}
                  <a href="https://addons.mozilla.org/en-US/firefox/addon/pwas-for-firefox/">PWA extension</a>.
                </em>
              </p>
            )}
          </Content>
        )}

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
