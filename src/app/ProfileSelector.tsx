import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AlertActionLink,
  Divider,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import { SchemaDefinition, fetchSchema } from "./schemaFetcher";
import { ONLINE_SCHEMA } from "./onlineSchema";
import { OFFLINE_SCHEMA } from "./offlineSchema";

interface ProfileSelectorProps {
  onSchemaLoad(arg: SchemaDefinition[]): void;
}

export const ProfileSelector: React.FunctionComponent<ProfileSelectorProps> = ({ onSchemaLoad }) => {
  const defaultSchema = ONLINE_SCHEMA[0].label;
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>(defaultSchema);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const loadSchema = useCallback((selected: string) => {
    const schema = ONLINE_SCHEMA.find((schema) => schema.label === selected);
    if (schema) {
      setIsLoading(true);
      fetchSchema(schema.url)
        .then((res) => {
          if (onSchemaLoad) {
            if (res && res[0]) res[0]["fileMatch"] = ["*"];
            onSchemaLoad(res);
          }
          setIsError(false);
        })
        .catch(() => {
          setIsError(true);
          if (onSchemaLoad) {
            onSchemaLoad([]);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      const localSchema = OFFLINE_SCHEMA.find((schema) => schema.label === selected);
      if (localSchema) {
        onSchemaLoad(localSchema.schema);
      }
    }
  }, [onSchemaLoad]);

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setSelected(value as string);
    setIsOpen(false);

    loadSchema(value as string);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} isDisabled={isLoading}>
      {selected}
    </MenuToggle>
  );

  // load the schema for the initial value
  useEffect(() => {
    loadSchema(defaultSchema);
  }, [defaultSchema, loadSchema]);

  return (
    <>
      <Select
        isOpen={isOpen}
        selected={selected}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={toggle}
        shouldFocusToggleOnSelect
      >
        <SelectList>
          {ONLINE_SCHEMA.map((schema, index) => (
            <SelectOption key={index} value={schema.label} description={schema.description}>
              {schema.label}
            </SelectOption>
          ))}
        </SelectList>
        <Divider />
        <SelectList>
          {OFFLINE_SCHEMA.map((schema, index) => (
            <SelectOption key={index} value={schema.label} description={schema.description}>
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
          <p>Either try downloading the schema again or select an embedded offline schema.</p>
        </Alert>
      )}
    </>
  );
};
