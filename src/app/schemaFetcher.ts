// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Schema = any;

export interface SchemaDefinition {
  uri: string;
  schema: Schema;
  fileMatch?: string[];
}

export async function fetchSchema(url: string): Promise<SchemaDefinition[]> {
  console.log("Downloading schema", url);

  const response = await fetch(url);
  const json = await response.json();

  const result: SchemaDefinition[] = [
    {
      uri: url,
      schema: json,
    },
  ];

  async function findReferences(data: Schema) {
    if (data && typeof data === "object") {
      for (const [key, value] of Object.entries(data)) {
        // ignore relative references, process only JSON references
        if (key === "$ref" && typeof value === "string" && !value.startsWith("#") && value.endsWith(".json")) {
          // replace the base filename in the URL path
          const schemaUrl = new URL(url);
          const pathParts = schemaUrl.pathname.split("/");
          pathParts[pathParts.length - 1] = value;
          schemaUrl.pathname = pathParts.join("/");

          const nestedData = await fetchSchema(schemaUrl.toString());

          result.push(...nestedData);
        }
        findReferences(value);
      }
    }
  }

  await findReferences(json);

  return result;
}
