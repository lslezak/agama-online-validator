# Online Agama autoinstallation profile validator

> [!NOTE]  
> This is an experimental project! There might be bugs and the UI is not perfect!

Here are the sources for the [Agama](https://agama-project.github.io/) autoinstallation profile
validator.

## Online version

The validator is available online at https://lslezak.github.io/agama-online-validator/.

## Offline version

You can download the [offline ZIP
archive](https://lslezak.github.io/agama-online-validator/agama-validator.zip)
with the validator. The offline validator runs completely locally and does not
need internet connection at all.

Just unpack the `agama-validator.zip` archive and open the
`agama-validator/index.html` file in your browser.

## Defined scripts

```sh
# Install dependencies
npm install

# Start the development server
npm run start:dev

# Create production build (saved to ./dist subdirectory)
npm run build

# Run the linter
npm run lint

# Run the code formatter
npm run format

# Inspect the bundle size
npm run bundle-profile:analyze

# Build and serve the production build
npm run build && npm run start
```

The repository structure was based on the [patternfly-react-seed](
https://github.com/patternfly/patternfly-react-seed) repository.
