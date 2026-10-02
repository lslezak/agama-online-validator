import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AlertActionLink,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import { SchemaDefinition, fetchSchema } from "./schemaFetcher";
import { ONLINE_SCHEMA } from "./onlineSchema";

const defaultSchema = ONLINE_SCHEMA[0].label;

interface ProfileSelectorProps {
  onSchemaLoad(arg: SchemaDefinition[]): void;
}

export const ProfileSelector: React.FunctionComponent<ProfileSelectorProps> = ({ onSchemaLoad }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>(defaultSchema);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  // ID of the latest request, used for ignoring outdated responses
  const requestId = useRef(0);

  const loadSchema = useCallback(
    async (label: string) => {
      const location = ONLINE_SCHEMA.find((schema) => schema.label === label);
      if (!location) return;

      const id = ++requestId.current;
      // display the progress only for slow downloads to avoid flickering
      const timer = setTimeout(() => setIsLoading(true), 500);

      try {
        const [main, ...nested] = await fetchSchema(location.url);
        if (id !== requestId.current) return;
        // validate any file with the main schema
        onSchemaLoad([{ ...main, fileMatch: ["*"] }, ...nested]);
        setIsError(false);
      } catch (error) {
        if (id !== requestId.current) return;
        console.error("Cannot load the schema:", error);
        onSchemaLoad([]);
        setIsError(true);
      } finally {
        clearTimeout(timer);
        if (id === requestId.current) setIsLoading(false);
      }
    },
    [onSchemaLoad],
  );

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setSelected(value as string);
    setIsOpen(false);
    loadSchema(value as string);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={() => setIsOpen(!isOpen)} isExpanded={isOpen} isDisabled={isLoading}>
      {selected}
    </MenuToggle>
  );

  // load the schema for the initial value
  useEffect(() => {
    loadSchema(defaultSchema);
  }, [loadSchema]);

  return (
    <>
      <Select
        isOpen={isOpen}
        selected={selected}
        onSelect={onSelect}
        onOpenChange={setIsOpen}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>
          {ONLINE_SCHEMA.map((schema) => (
            <SelectOption key={schema.label} value={schema.label} description={schema.description}>
              {schema.label}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
      {isLoading && " Loading..."}
      {isError && (
        <Alert
          variant="danger"
          title="Download error"
          style={{ marginTop: "20px" }}
          actionLinks={<AlertActionLink onClick={() => loadSchema(selected)}>Try again</AlertActionLink>}
        >
          <p>
            The schema definition could not be downloaded. The profile cannot be validated without the schema
            definition.
          </p>
        </Alert>
      )}
    </>
  );
};
