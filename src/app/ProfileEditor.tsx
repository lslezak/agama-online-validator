import React, { useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import {
  Alert,
  AlertActionCloseButton,
  Button,
  DropEvent,
  FileUpload,
  FileUploadHelperText,
  HelperText,
  HelperTextItem,
  PageSection,
  Split,
  SplitItem,
} from "@patternfly/react-core";

import { CodeEditor, Language } from "@patternfly/react-code-editor";
import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import * as radashi from "radashi";

import Ajv2019 from "ajv/dist/2019";

import ValidatorResult from "./ValidatorResult";
// import the JSON schema definition
import profileSchema from "../schema/sle-16/profile.schema.json";
import storageSchema from "../schema/sle-16/storage.schema.json";
import iScsiSchema from "../schema/sle-16/iscsi.schema.json";

// allow not perfectly valid JSON schema definition, report all errors (not just the first found)
const ajv = new Ajv2019({ strict: false, allErrors: true });

const defaultEditorContent = "{\n  \n}";

// the monaco web editor does not work correctly when running from file:// URL
// in that case use a simple textarea and use the Ajv library for validation
const validator =
  new URL(document.URL).protocol !== "file:"
    ? undefined
    : ajv.addSchema(storageSchema).addSchema(iScsiSchema).compile(profileSchema);

// height of a single line
const lineHeight = 19;

export default function ProfileEditor({ isDarkTheme, schema }): React.ReactNode {
  const [value, setValue] = useState(defaultEditorContent);
  const [filename, setFilename] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([] as string[]);
  const [showAlert, setShowAlert] = useState(true);
  const [height, setHeight] = useState(30 * lineHeight);

  // uh, setting the same validation schema again causes strange validation error loop =:-o
  // set it only when it has been changed
  if (!radashi.isEqual(monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas, schema)) {
    console.log("Setting editor schema", schema[0] && schema[0].uri);

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      ...monaco.languages.json.jsonDefaults.diagnosticsOptions,
      validate: true,
      enableSchemaRequest: false,
      schemas: schema,
    });
  }

  const handleFileInputChange = (_, file: File) => {
    setFilename(file.name);
  };

  const handleTextChange = (_event: React.ChangeEvent<HTMLTextAreaElement>, value: string) => {
    setValue(value);
  };

  const handleDataChange = (_event: DropEvent, value: string) => {
    setValue(value);
  };

  const handleClear = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setFilename("");
    setValue(defaultEditorContent);
  };

  const handleFileReadStarted = (_event: DropEvent, _fileHandle: File) => {
    setIsLoading(true);
  };

  const handleFileReadFinished = (_event: DropEvent, _fileHandle: File) => {
    setIsLoading(false);
  };

  const onEditorDidMount = (editor, monaco) => {
    editor.layout();
    editor.focus();
    // set default indentation and tab size
    monaco.editor.getModels()[0].updateOptions({ tabSize: 2, indentSize: 2, insertSpaces: true });

    // // this allows getting exact location of the validation errors
    // editor.onDidChangeModelDecorations(() => {
    //   const model = editor.getModel();
    //   const modelMarkers = monaco.editor.getModelMarkers(model);
    //   console.log("changed markers:", { modelMarkers });
    // });

    monaco.editor.onDidChangeMarkers(() => {
      const messages = monaco.editor.getModelMarkers({ owner: "json" }).map((m) => m.message);
      setErrors(messages);
    });
  };

  const onChange = (val: string) => {
    setValue(val);
  };

  if (validator) {
    try {
      validator(JSON.parse(value));
      const messages = validator.errors?.map((e) => `${e.instancePath} ${e.message}`) || [];
      // remove duplicates
      const uniqMessages = messages.reduce(function (a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
      }, [] as string[]);

      if (uniqMessages.length !== errors.length || uniqMessages.toString() !== errors.toString())
        setErrors(uniqMessages);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (errors.length !== 1 || errors[0] !== message) setErrors([message]);
    }
  } else {
    // avoid downloading the monaco editor parts from the CDN
    loader.config({ monaco });
  }

  const onResize = (_event, data) => {
    setHeight(data.size.height);
  };

  const download = () => {
    const blob = new Blob([value], { type: "application/json" });
    const a = document.createElement("a");
    a.download = filename || "profile.json";
    a.href = window.URL.createObjectURL(blob);
    a.target = "_blank";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  };

  return (
    <>
      {showAlert && validator && (
        <PageSection>
          <Alert
            variant="warning"
            title="Simple editor"
            isInline
            actionClose={<AlertActionCloseButton onClose={() => setShowAlert(false)} />}
          >
            When running the editor without any web server (just loaded from a file) then a simplified version of the
            editor is used. It also runs a different validator which can produce different error messages. For a better
            user experience it is recommended to use the editor served from a web server.
          </Alert>
        </PageSection>
      )}
      <PageSection>
        <FileUpload
          id="profile-upload"
          type="text"
          value={value}
          filename={filename}
          multiple={false}
          hideDefaultPreview={!validator}
          filenamePlaceholder="Drag and drop a JSON file or upload one"
          onFileInputChange={handleFileInputChange}
          onDataChange={handleDataChange}
          onTextChange={handleTextChange}
          onReadStarted={handleFileReadStarted}
          onReadFinished={handleFileReadFinished}
          onClearClick={handleClear}
          isLoading={isLoading}
          allowEditingUploadedText={true}
          validated={value.length === 0 ? undefined : errors.length === 0 ? "success" : "error"}
          browseButtonText="Select file"
          dropzoneProps={{
            accept: {
              "application/json": [".json"],
            },
          }}
        >
          {!validator && (
            <ResizableBox
              axis="y"
              minConstraints={[undefined, 10 * lineHeight]}
              height={height}
              onResize={onResize}
              draggableOpts={{ grid: [lineHeight, lineHeight] }}
            >
              <CodeEditor
                isLineNumbersVisible={true}
                isReadOnly={false}
                isMinimapVisible={false}
                code={value}
                isDarkTheme={isDarkTheme}
                onChange={onChange}
                language={Language.json}
                onEditorDidMount={onEditorDidMount}
                height={`${height - lineHeight}px`}
              />
            </ResizableBox>
          )}
          {value === "" ? (
            <FileUploadHelperText>
              <HelperText>
                <HelperTextItem id="helper-text">Write or upload a JSON file</HelperTextItem>
              </HelperText>
            </FileUploadHelperText>
          ) : (
            <Split>
              <SplitItem>
                <ValidatorResult errors={errors} hasSchema={schema.length > 0} />
              </SplitItem>
              <SplitItem isFilled />
              <SplitItem>
                <Button variant="control" onClick={download}>
                  Save file
                </Button>
              </SplitItem>
            </Split>
          )}
        </FileUpload>
      </PageSection>
    </>
  );
}
