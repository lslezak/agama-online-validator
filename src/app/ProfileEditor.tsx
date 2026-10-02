import React, { RefObject, useCallback, useEffect, useRef, useState } from "react";
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
import Notes from "./Notes";
import { SchemaDefinition } from "./schemaFetcher";

// avoid downloading the monaco editor parts from the CDN
loader.config({ monaco });

const defaultEditorContent = "{\n  \n}";
const minHeight = 190;
const standaloneQuery = "(display-mode: standalone)";

// the notes are hidden in the installed app
const isStandalone = () => window.matchMedia(standaloneQuery).matches;

async function writeFile(handle: FileSystemFileHandle, content: string) {
  const writable = await handle.createWritable();
  await writable.write(new Blob([content], { type: "application/json" }));
  await writable.close();
}

interface ProfileEditorProps {
  isDarkTheme: boolean;
  schema: SchemaDefinition[];
  cardRef: RefObject<HTMLDivElement | null>;
  installPrompt?: Event;
}

export default function ProfileEditor({
  isDarkTheme,
  schema,
  cardRef,
  installPrompt,
}: ProfileEditorProps): React.ReactNode {
  const [value, setValue] = useState(defaultEditorContent);
  // keep the original value for detecting changes, the document is usually short so we can keep a copy
  const [originalValue, setOriginalValue] = useState(defaultEditorContent);
  const [filename, setFilename] = useState("");
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle>();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<monaco.editor.IMarker[]>([]);
  const [monacoEditor, setMonacoEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [height, setHeight] = useState(minHeight);
  const [showNotes, setShowNotes] = useState(!isStandalone());

  const fsRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const isModified = value !== originalValue;

  // load a new document into the editor
  const loadContent = (content: string, handle?: FileSystemFileHandle) => {
    setFileHandle(handle);
    setValue(content);
    setOriginalValue(content);
  };

  // resize the editor to fill the free space in the window
  const refreshSize = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor | undefined) => {
      if (!editor) return;

      const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
      const freeSpace = isFullScreen
        ? window.innerHeight - ((fsRef.current?.firstChild as HTMLElement)?.clientHeight || 0)
        : (document.getElementById("root")?.clientHeight || 0) - (cardRef.current?.clientHeight || 0);
      const editorHeight = editorRef.current?.clientHeight || 0;
      setHeight(Math.max(editorHeight + freeSpace - lineHeight, minHeight));
    },
    [cardRef, isFullScreen],
  );

  // register the global event handlers
  useEffect(() => {
    handleLaunchQueue((handle, name, content) => {
      setFileHandle(handle);
      setFilename(name);
      setValue(content);
      setOriginalValue(content);
    });

    // handle exiting full screen mode by pressing ESC
    const onFullScreenChange = () => setIsFullScreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", onFullScreenChange);

    const standaloneMedia = window.matchMedia(standaloneQuery);
    const updateNotes = () => setShowNotes(!standaloneMedia.matches);
    standaloneMedia.addEventListener("change", updateNotes);

    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      standaloneMedia.removeEventListener("change", updateNotes);
    };
  }, []);

  // confirm leaving the page after doing any change
  useEffect(() => {
    if (!isModified) return;

    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      // the standard way
      event.preventDefault();
      // legacy support, e.g. Chrome/Edge < 119
      event.returnValue = true;
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => window.removeEventListener("beforeunload", beforeUnloadHandler);
  }, [isModified]);

  useEffect(() => {
    const resize = () => {
      refreshSize(monacoEditor);
      monacoEditor?.layout();
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [monacoEditor, refreshSize]);

  // the page layout might change (displayed errors, notes, full screen...), adjust the editor size
  useEffect(() => {
    const timer = setTimeout(() => refreshSize(monacoEditor), 500);
    return () => clearTimeout(timer);
  }, [monacoEditor, refreshSize, showNotes, value, errors]);

  useEffect(() => {
    // uh, setting the same validation schema again causes strange validation error loop =:-o
    // set it only when it has been changed
    if (radashi.isEqual(monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas, schema)) return;

    console.log("Setting editor schema", schema[0]?.uri);
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      ...monaco.languages.json.jsonDefaults.diagnosticsOptions,
      validate: true,
      enableSchemaRequest: false,
      schemas: schema,
    });
  }, [schema]);

  const handleFileInputChange = (_event: DropEvent, file: File) => {
    setFileHandle(undefined);
    setFilename(file.name);
  };

  const handleTextChange = (_event: React.ChangeEvent<HTMLTextAreaElement>, value: string) => {
    setValue(value);
  };

  const handleDataChange = (_event: DropEvent, value: string) => {
    loadContent(value);
  };

  const handleClear = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setFilename("");
    loadContent(defaultEditorContent);
    monacoEditor?.layout();
    monacoEditor?.focus();
  };

  const onEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editor.layout();
    editor.focus();
    refreshSize(editor);

    // set default indentation and tab size
    editor.getModel()?.updateOptions({ tabSize: 2, indentSize: 2, insertSpaces: true });

    // this allows getting exact location of the validation errors
    editor.onDidChangeModelDecorations(() => {
      const model = editor.getModel();
      setErrors(model ? monaco.editor.getModelMarkers({ resource: model.uri }) : []);
    });

    setMonacoEditor(editor);
  };

  const toggleFullScreen = async () => {
    if (isFullScreen) {
      await document.exitFullscreen();
      setIsFullScreen(false);
    } else if (fsRef.current) {
      await fsRef.current.requestFullscreen();
      setIsFullScreen(true);
      monacoEditor?.focus();
    }
  };

  const save = async () => {
    if (!fileHandle) return;

    try {
      await writeFile(fileHandle, value);
      setOriginalValue(value);
    } catch (err) {
      console.error("Cannot save the file: ", err);
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
      await writeFile(handle, value);
      setFileHandle(handle);
      setFilename(handle.name);
      setOriginalValue(value);
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
        onReadStarted={() => setIsLoading(true)}
        onReadFinished={() => setIsLoading(false)}
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
        <div ref={editorRef}>
          <CodeEditor
            isLineNumbersVisible={true}
            isReadOnly={false}
            isMinimapVisible={false}
            code={value}
            isDarkTheme={isDarkTheme}
            onChange={setValue}
            language={Language.json}
            onEditorDidMount={onEditorDidMount}
            options={{ scrollBeyondLastLine: false }}
            height={`${height}px`}
          />
        </div>
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
                <Button variant="plain" icon={<FullScreenIcon />} onClick={toggleFullScreen} />
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

      {/* hide notes in installed app */}
      {showNotes && !isFullScreen && (
        <>
          <br />
          <Notes webAppAvailable={!!installPrompt} onClose={() => setShowNotes(false)} />
        </>
      )}
    </div>
  );
}
