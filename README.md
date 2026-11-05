[![Build Status](https://travis-ci.org/RedHatInsights/frontend-starter-app.svg?branch=master)](https://travis-ci.org/RedHatInsights/frontend-starter-app)

# Service accounts

React.js starter app for Red Hat Insights products that includes Patternfly 4 and shared Red Hat cloud service frontend components.

## Alternative

Before using this template, please check the [create-crc-app](https://github.com/RedHatInsights/frontend-components/blob/master/packages/docs/pages/ui-onboarding/create-crc-app.mdx). It has some extra setup you may like.

## Initial etc/hosts setup

In order to access the https://[env].foo.redhat.com in your browser, you have to add entries to your `/etc/hosts` file. This is a **one-time** setup that has to be done only once (unless you modify hosts) on each devel machine.

Best way is to edit manually `/etc/hosts` on your localhost line:

```
127.0.0.1 <your-fqdn> localhost prod.foo.redhat.com stage.foo.redhat.com
```

Alternatively you can do this by running following command:
```bash
npm run patch:hosts
```

If this command throws an error run it as a `sudo`:
```bash
sudo npm run patch:hosts
```

## Getting started

1. ```npm install```

2. ```npm run start```

3. Open browser in URL listed in the terminal output

Update `appUrl` string inside `fec.config.js` according to your application URL. [Read more](http://front-end-docs-insights.apps.ocp4.prod.psi.redhat.com/ui-onboarding/fec-binary#TODO:documentalloptions).

### Testing

`npm run verify` will run `npm run lint` (eslint) and `npm test` (Jest)

## Local i18n validation

The locale-validation workflow builds the i18n CLI, but `npm ci` in this repository does not
install it. Until `@redhat-cloud-services/i18n-pipeline` is published, build the exact tooling
revision pinned by `.github/workflows/locale-validation.yml` (currently
`7228d32f08872f97c8de8d255b5690e77f484f1f`):

```bash
git clone https://github.com/RedHatInsights/i18n-tooling.git
cd i18n-tooling
git checkout 7228d32f08872f97c8de8d255b5690e77f484f1f
npm ci
npm run build
```

Then, from this repository, add that checkout's CLI to `PATH` for the validation command:

```bash
PATH="/path/to/i18n-tooling/node_modules/.bin:$PATH" npm run translations:validate
```

This CLI currently requires Node.js 22.14 or newer. If the workflow pin changes, use the new SHA in both the checkout and this instruction.

## Deploying

- The starter repo uses Travis to deploy the webpack build to another Github repo defined in `.travis.yml`
  - That Github repo has the following branches:
    - `ci-beta` (deployed by pushing to `master` or `main` on this repo)
    - `ci-stable` (deployed by pushing to `ci-stable` on this repo)
    - `qa-beta` (deployed by pushing to `qa-beta` on this repo)
    - `qa-stable` (deployed by pushing to `qa-stable` on this repo)
    - `prod-beta` (deployed by pushing to `prod-beta` on this repo)
    - `prod-stable` (deployed by pushing to `prod-stable` on this repo)
- Travis uploads results to RedHatInsight's [codecov](https://codecov.io) account. To change the account, modify CODECOV_TOKEN on https://travis-ci.com/.


### Openapi spec

we are pulling data from back office and openapi spec for it can be found at https://sso.redhat.com/auth/realms/redhat-external/apis/openapi.yaml
