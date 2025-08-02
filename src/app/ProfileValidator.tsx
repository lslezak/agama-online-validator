import React, { useState } from "react";
import {
  DropEvent,
  FileUpload,
  FileUploadHelperText,
  FileUploadProps,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import ValidatorResult from "./ValidatorResult";

export default function ProfileValidator({ schema, validator }): React.ReactNode {
  const [value, setValue] = useState("");
  const [filename, setFilename] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    setValue("");
  };

  const handleFileReadStarted = (_event: DropEvent, _fileHandle: File) => {
    setIsLoading(true);
  };

  const handleFileReadFinished = (_event: DropEvent, _fileHandle: File) => {
    setIsLoading(false);
  };

  let validated: FileUploadProps["validated"];
  let errors: string[] = [];

  if (value !== "") {
    try {
      const profile = JSON.parse(value);
      const result = validator.validate(profile, schema);
      validated = result.valid ? "success" : "error";
      errors = result.errors.map((e) => e.toString());
    } catch (error) {
      validated = "error";
      if (error instanceof Error) {
        errors = [error.message];
      } else {
        errors = ["Unknown error"];
      }
    }
  }

  return (
    <>
      <FileUpload
        id="profile-upload"
        type="text"
        value={value}
        filename={filename}
        multiple={false}
        filenamePlaceholder="Drag and drop a file or upload one"
        onFileInputChange={handleFileInputChange}
        onDataChange={handleDataChange}
        onTextChange={handleTextChange}
        onReadStarted={handleFileReadStarted}
        onReadFinished={handleFileReadFinished}
        onClearClick={handleClear}
        isLoading={isLoading}
        allowEditingUploadedText={true}
        browseButtonText="Select file"
        validated={validated}
        dropzoneProps={{
          accept: {
            "application/json": [".json"],
          },
        }}
      >
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
