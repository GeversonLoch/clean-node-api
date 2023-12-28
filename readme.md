## Environment Setup
NodeJS version used: `16.14.2`

## Libs
    $ npm i -D git-commit-msg-linter
    $ npm i -D typescript @types/node
    $ npm install -D eslint@^7.12.1 eslint-plugin-promise@^5.0.0 eslint-plugin-import@^2.22.1 eslint-plugin-node@^11.1.0 @typescript-eslint/eslint-plugin@^4.0.1 eslint-config-standard eslint-config-standard-with-typescript@latest
    $ npm i -D husky
    $ npm i -D lint-staged
    $ npm i -D jest @types/jest ts-jest
    $ npm i @types/validator validator

## Run
The `test` script runs the Jest test runner in watch mode, which means that Jest will automatically re-run the tests whenever a file changes. This is a useful feature during development, as it allows developers to quickly iterate on their code and see the results of their changes.

    $ npm run test

The `test:staged` script, on the other hand, runs Jest without the watch mode. This script is typically used in a Continuous Integration (CI) environment, where the tests are run automatically whenever changes are pushed to the repository. By running the tests only on the staged files, this script can help ensure that only the changes that have been tested are pushed to the repository.

    $ npm run test:staged

## Additional Commands

To selectively update libs on NPM:

`-s, --skip-unused`: Skip check for unused packages, because there are libraries without reference in any import in the project. But because they are useful to the project.

`-u, --update`: Interactive update.

        $ npm-check --skip-unused --update
        $ npm-check -s -u

