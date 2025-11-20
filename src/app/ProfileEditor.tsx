import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  DropEvent,
  FileUpload,
  FileUploadHelperText,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
  Tooltip,
} from "@patternfly/react-core";

import { CodeEditor, Language } from "@patternfly/react-code-editor";
import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import * as radashi from "radashi";
import FullScreenIcon from "@mui/icons-material/Fullscreen";

import ValidatorResult from "./ValidatorResult";
import { handleLaunchQueue } from "./launchQueue";

const defaultEditorContent = "{\n  \n}";

export default function ProfileEditor({ isDarkTheme, schema }): React.ReactNode {
  const [value, setValue] = useState(defaultEditorContent);
  const [filename, setFilename] = useState("");
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([] as string[]);
  const [monacoEditor, setMonacoEditor] = useState(undefined as monaco.editor.IStandaloneCodeEditor | undefined);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fsRef = useRef(null as HTMLDivElement | null);

  useEffect(() => {
    handleLaunchQueue(setValue, setFilename, setFileHandle);

    // handle exiting full screen mode by pressing ESC
    const onFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener("fullscreenchange", onFullScreenChange);

    const layout = () => monacoEditor?.layout();
    window.addEventListener("resize", layout);

    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      window.removeEventListener("resize", layout);
    };
  }, [monacoEditor]);

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
    setFileHandle(undefined);
    setFilename(file.name);
  };

  const handleTextChange = (_event: React.ChangeEvent<HTMLTextAreaElement>, value: string) => {
    setValue(value);
  };

  const handleDataChange = (_event: DropEvent, value: string) => {
    setFileHandle(undefined);
    setValue(value);
  };

  const handleClear = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setFilename("");
    setFileHandle(undefined);
    setValue(defaultEditorContent);
    monacoEditor?.layout();
    monacoEditor?.focus();
  };

  const handleFileReadStarted = (_event: DropEvent, _fileHandle: File) => {
    setIsLoading(true);
  };

  const handleFileReadFinished = (_event: DropEvent, _fileHandle: File) => {
    setIsLoading(false);
  };

  const onEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco) => {
    editor.layout();
    editor.focus();
    // set default indentation and tab size
    monaco.editor.getModels()[0].updateOptions({ tabSize: 2, indentSize: 2, insertSpaces: true });

    // this allows getting exact location of the validation errors
    editor.onDidChangeModelDecorations(() => {
      const model = editor.getModel();
      const modelMarkers = monaco.editor.getModelMarkers(model);
      setErrors(modelMarkers);
    });

    setMonacoEditor(editor);
  };

  const onChange = (val: string) => {
    setValue(val);
  };

  // avoid downloading the monaco editor parts from the CDN
  loader.config({ monaco });

  const save = async () => {
    if (fileHandle) {
      const blob = new Blob([value], { type: "application/json" });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    }
  };

  const saveAs = async () => {
    try {
      const handle = await window.showSaveFilePicker({
        types: [
          {
            description: "Agama autoinstallation profile",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
      });
      const blob = new Blob([value], { type: "application/json" });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      setFileHandle(handle);
      setFilename(handle.name);
    } catch (err) {
      console.error("Cannot save the file: ", err);
    }
  };

  return (
    <div ref={fsRef}>
      <FileUpload
        id="profile-upload"
        type="text"
        value={value}
        filename={filename}
        multiple={false}
        hideDefaultPreview={true}
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
        <CodeEditor
          isLineNumbersVisible={true}
          isReadOnly={false}
          isMinimapVisible={false}
          code={value}
          isDarkTheme={isDarkTheme}
          onChange={onChange}
          language={Language.json}
          onEditorDidMount={onEditorDidMount}
          height="sizeToFit"
          isFullHeight={true}
        />
        {value === "" ? (
          <FileUploadHelperText>
            <HelperText>
              <HelperTextItem id="helper-text">Write or upload a JSON file</HelperTextItem>
            </HelperText>
          </FileUploadHelperText>
        ) : (
          <Split>
            <SplitItem>
              <ValidatorResult errors={errors} hasSchema={schema.length > 0} editor={monacoEditor} />
            </SplitItem>
            <SplitItem isFilled />
            <SplitItem>
              <Tooltip content={isFullScreen ? "Exit full screen" : "Switch to full screen mode"} position="bottom">
                <Button
                  variant="plain"
                  icon={<FullScreenIcon />}
                  onClick={() => {
                    if (isFullScreen) {
                      document.exitFullscreen().then(() => {
                        setIsFullScreen(false);
                      });
                    } else if (fsRef?.current) {
                      fsRef.current.requestFullscreen().then(() => {
                        setIsFullScreen(true);
                        if (monacoEditor) monacoEditor.focus();
                      });
                    }
                  }}
                />
              </Tooltip>
              {fileHandle && (
                <Button variant="control" onClick={save}>
                  Save
                </Button>
              )}{" "}
              <Button variant="control" onClick={saveAs}>
                Save as...
              </Button>
            </SplitItem>
          </Split>
        )}
      </FileUpload>
    </div>
  );
}
