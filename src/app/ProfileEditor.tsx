import React, { useState } from "react";
import {
  DropEvent,
  FileUpload,
  FileUploadHelperText,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";

import ValidatorResult from "./ValidatorResult";
import profileSchema from "../schema/profile.schema.json";
import storageSchema from "../schema/storage.schema.json";
import iscsiSchema from "../schema/iscsi.schema.json";

const defaultEditorContent = "{\n  \n}";

export default function ProfileEditor(): React.ReactNode {
  const [value, setValue] = useState(defaultEditorContent);
  const [filename, setFilename] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([] as string[]);

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
    // enable validation and import the schema
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      // enableSchemaRequest: true,
      schemas: [
        {
          uri: "https://raw.githubusercontent.com/agama-project/agama/refs/heads/master/rust/agama-lib/share/profile.schema.json",
          fileMatch: ["*"],
          schema: profileSchema,
        },
        {
          uri: "https://raw.githubusercontent.com/agama-project/agama/refs/heads/master/rust/agama-lib/share/storage.schema.json",
          schema: storageSchema,
        },
        {
          uri: "https://raw.githubusercontent.com/agama-project/agama/refs/heads/master/rust/agama-lib/share/iscsi.schema.json",
          schema: iscsiSchema,
        },
      ],
    });
  };

  const onChange = (value: string) => {
    setValue(value);
  };

  // avoid downloading the monaco editor parts from the CDN
  loader.config({ monaco });
  
  monaco.editor.onDidChangeMarkers(() => {
    const messages = monaco.editor.getModelMarkers({owner: "json"}).map((m) => m.message);
    setErrors(messages);
  });

  return (
    <>
      <FileUpload
        id="profile-upload"
        type="text"
        value={value}
        filename={filename}
        multiple={false}
        hideDefaultPreview
        filenamePlaceholder="Drag and drop a JSON file or upload one"
        onFileInputChange={handleFileInputChange}
        onDataChange={handleDataChange}
        onTextChange={handleTextChange}
        onReadStarted={handleFileReadStarted}
        onReadFinished={handleFileReadFinished}
        onClearClick={handleClear}
        isLoading={isLoading}
        allowEditingUploadedText={true}
        browseButtonText="Select file"
        dropzoneProps={{
          accept: {
            "application/json": [".json"],
          },
        }}
      >
        <CodeEditor
          isLineNumbersVisible={true}
          isReadOnly={false}
          isMinimapVisible={false}
          code={value}
          onChange={onChange}
          language={Language.json}
          onEditorDidMount={onEditorDidMount}
          height="50vh"
        />
        {value === "" && (
          <FileUploadHelperText>
            <HelperText>
              <HelperTextItem id="helper-text">Write or upload a JSON file</HelperTextItem>
            </HelperText>
          </FileUploadHelperText>
        )}
      </FileUpload>

      {value !== "" && <ValidatorResult errors={errors} />}
    </>
  );
}
