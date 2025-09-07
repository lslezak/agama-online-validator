
// import the JSON schema definition
// the schema files are quite small, let's embed them directly to make the code simple
// if the schema definition grows too much it could be loaded dynamically using import() function
import profileSchema from "../schema/sle-16/profile.schema.json";
import storageSchema from "../schema/sle-16/storage.schema.json";
import iScsiSchema from "../schema/sle-16/iscsi.schema.json";

export interface LocalSchema {
  label: string;
  description: string;
  schema: any[];
}

export const OFFLINE_SCHEMA: LocalSchema[] = [
  {
    label: "SUSE SLE-16 / openSUSE Leap 16.0 (Embedded)",
    description: "Embedded copy of the schema for offline validations",
    schema: [
      {
        uri: "https://raw.githubusercontent.com/agama-project/agama/refs/heads/SLE-16/rust/agama-lib/share/profile.schema.json",
        fileMatch: ["*"],
        schema: profileSchema,
      },
      {
        uri: "https://raw.githubusercontent.com/agama-project/agama/refs/heads/SLE-16/rust/agama-lib/share/storage.schema.json",
        schema: storageSchema,
      },
      {
        uri: "https://raw.githubusercontent.com/agama-project/agama/refs/heads/SLE-16/rust/agama-lib/share/iscsi.schema.json",
        schema: iScsiSchema,
      },
    ],
  },
];
