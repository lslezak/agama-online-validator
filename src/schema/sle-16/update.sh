#! /bin/bash

set -e

prefix="https://raw.githubusercontent.com/agama-project/agama/refs/heads/SLE-16/rust/agama-lib/share"
files=(profile.schema.json storage.schema.json iscsi.schema.json)

for file in "${files[@]}"; do
  echo "Downloading $file..."
  curl -L -o "$file" "$prefix/$file"
done
