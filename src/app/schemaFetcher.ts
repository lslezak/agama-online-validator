// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Schema = any;

export interface SchemaDefinition {
  uri: string;
  schema: Schema;
  fileMatch?: string[];
}

// is the value a reference to an external JSON file? (ignore the local "#/..." references)
function isExternalReference(key: string, value: unknown): value is string {
  return key === "$ref" && typeof value === "string" && !value.startsWith("#") && value.endsWith(".json");
}

// collect all external references found anywhere in the schema
function findReferences(data: Schema, refs: Set<string> = new Set()): Set<string> {
  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      if (isExternalReference(key, value)) refs.add(value);
      findReferences(value, refs);
    }
  }

  return refs;
}

/**
 * Download the schema and recursively all referenced schemas
 * @param url URL of the main schema
 * @returns list of the downloaded schemas, the main schema is the first item
 */
export async function fetchSchema(url: string): Promise<SchemaDefinition[]> {
  const result: SchemaDefinition[] = [];
  // the already processed URLs, avoids duplicate downloads and infinite loops for circular references
  const visited = new Set<string>();

  async function download(schemaUrl: string): Promise<void> {
    if (visited.has(schemaUrl)) return;
    visited.add(schemaUrl);

    console.log("Downloading schema", schemaUrl);
    const response = await fetch(schemaUrl);
    if (!response.ok) throw new Error(`Cannot download ${schemaUrl}: ${response.status} ${response.statusText}`);

    const schema = await response.json();
    result.push({ uri: schemaUrl, schema });

    // the references are relative to the current schema URL
    const nested = Array.from(findReferences(schema)).map((ref) => new URL(ref, schemaUrl).toString());
    for (const nestedUrl of nested) {
      await download(nestedUrl);
    }
  }

  await download(url);
  return result;
}
