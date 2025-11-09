import React, { useEffect, useRef, useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import {
  Button,
  DropEvent,
  FileUpload,
  FileUploadHelperText,
  HelperText,
  HelperTextItem,
  PageSection,
  Split,
  SplitItem,
  Tooltip,
} from "@patternfly/react-core";

import { CodeEditor, Language } from "@patternfly/react-code-editor";
import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import * as radashi from "radashi";
import FullScreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

import ValidatorResult from "./ValidatorResult";
import { handleLaunchQueue } from "./launchQueue";

const defaultEditorContent = "{\n  \n}";
// height of a single line
const lineHeight = 19;

export default function ProfileEditor({ isDarkTheme, schema }): React.ReactNode {
  const [value, setValue] = useState(defaultEditorContent);
  const [filename, setFilename] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([] as string[]);
  const [height, setHeight] = useState(30 * lineHeight);
  const [heightNormal, setHeightNormal] = useState(height);
  const [heightFull, setHeightFull] = useState(undefined as number | undefined);
  const [monacoEditor, setMonacoEditor] = useState(undefined as monaco.editor.IStandaloneCodeEditor | undefined);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fsRef = useRef(null as HTMLDivElement | null);

  useEffect(() => {
    handleLaunchQueue(setValue);

    // handle exiting full screen mode by pressing ESC
    const onFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        setHeight(heightNormal);
      }
    };

    document.addEventListener("fullscreenchange", onFullScreenChange);

    if (isFullScreen) {
      if (heightFull) setHeight(heightFull);
      else {
        const defaultFullHeight = Math.floor((window.innerHeight * 0.9) / lineHeight) * lineHeight;
        setHeightFull(defaultFullHeight);
        setHeight(defaultFullHeight);
      }
    }

    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
    };
  }, [heightNormal, isFullScreen, heightFull]);

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
      <PageSection>
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
          <div ref={fsRef} style={{ height: isFullScreen ? "100vh" : "auto" }}>
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
                      icon={isFullScreen ? <FullscreenExitIcon /> : <FullScreenIcon />}
                      onClick={() => {
                        if (isFullScreen) {
                          document.exitFullscreen().then(() => {
                            setHeightFull(height);
                            setIsFullScreen(false);
                          });
                        } else if (fsRef?.current) {
                          fsRef.current.requestFullscreen().then(() => {
                            setHeightNormal(height);
                            setIsFullScreen(true);
                            if (monacoEditor) monacoEditor.focus();
                          });
                        }
                      }}
                    />
                  </Tooltip>
                  <Button variant="control" onClick={download}>
                    Save file
                  </Button>
                </SplitItem>
              </Split>
            )}
          </div>
        </FileUpload>
      </PageSection>
    </>
  );
}
