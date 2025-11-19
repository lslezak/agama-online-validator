export interface SchemaLocation {
  label: string;
  description: string;
  url: string;
}

export const ONLINE_SCHEMA: SchemaLocation[] = [
  {
    label: "SUSE SLE-16 / openSUSE Leap 16.0",
    description: "The latest stable version",
    url: "https://raw.githubusercontent.com/agama-project/agama/refs/heads/SLE-16/rust/agama-lib/share/profile.schema.json",
  },
  {
    label: "Latest development version (unstable)",
    description: "The latest version from Git or OBS development project",
    url: "https://raw.githubusercontent.com/agama-project/agama/refs/heads/master/rust/agama-lib/share/profile.schema.json",
  },
];
