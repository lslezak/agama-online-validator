# Online Agama autoinstallation profile validator

> [!NOTE]  
> This is an experimental project! There might be bugs and the UI is not perfect!

Here are the sources for the [Agama](https://agama-project.github.io/) autoinstallation profile
validator.

## Online version

The validator is available online at https://lslezak.github.io/agama-online-validator/.

## Offline version

The validator can be also used offline, without any internet access. The page
and the JSON validation schema files are cached in the browser. If network is
not available these cached files are used to provide the functionality.

Press the "Install app" button in the top right corner to install it as a web
application. This adds creates a shortcut on the desktop and associates the
`*.json` extension with the web application. See more details about the web
applications in the [Mozilla
documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing).

_Note: This is supported only in some browsers. Not all browsers support
installing web applications (PWA). It should work in all Chrome based browsers.
Firefox requires a [PWA
extension](https://addons.mozilla.org/en-US/firefox/addon/pwas-for-firefox/).
See more details about the web apps in the [Chrome
documentation](https://support.google.com/chrome/answer/9658361?hl=en&ref_topic=7439636)._

You can download the [ZIP
archive](https://lslezak.github.io/agama-online-validator/agama-validator.zip)
with the built validator and deploy it on a local HTTP server or directly in
your machine.

## PWA documentation links

- https://docs.pwabuilder.com/
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- https://github.com/mdn/pwa-examples
- https://support.google.com/chrome/answer/9658361?hl=en&ref_topic=7439636

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

The repository structure was based on the [patternfly-react-seed](https://github.com/patternfly/patternfly-react-seed) repository.
