# Firefly Services Proxy

Welcome to my Adobe Firefly Services Proxy build on Adobe Runtime.

## Setup

- rename the `example.env` file to `.env`
- Populate the `.env` file in the project root and fill with your own values

## Local Dev

- `yarn run` to start your local Dev server
- App will run on `localhost:9080` by default

By the actions will be deployed and served from Adobe I/O Runtime. To start a
local serverless stack and also run your actions locally use the `yarn local`.

## Test & Coverage

- Run `yarn test` to run unit tests all actions

## Deploy & Cleanup

- `yarn deploy` to build and deploy all actions on Runtime and static files to CDN
- `yarn undeploy` to undeploy the app

### `app.config.yaml`

- Main configuration file that defines an application's implementation.
- More information on this file, application configuration, and extension configuration
  can be found [here](https://developer.adobe.com/app-builder/docs/guides/appbuilder-configuration/#appconfigyaml)

#### Action Dependencies

**Packaged action file**: Install all dependencies using `yarn install`
