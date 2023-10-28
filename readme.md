## Environment Setup
NodeJS version used: 16.14.2

## Libs
    $ npm i -D git-commit-msg-linter
    $ npm i -D typescript @types/node
    $ npm install -D eslint@^7.12.1 eslint-plugin-promise@^5.0.0 eslint-plugin-import@^2.22.1 eslint-plugin-node@^11.1.0 @typescript-eslint/eslint-plugin@^4.0.1 eslint-config-standard eslint-config-standard-with-typescript@latest
    $ npm i -D husky
    $ npm i -D lint-staged
    $ npm i -D jest @types/jest ts-jest

## Commands

-   To selectively update libs on NPM:

    -s, --skip-unused: Skip check for unused packages, because there are libraries without reference in any import in the project. But because they are useful to the project.

    -u, --update: Interactive update.

        $ npm-check --skip-unused --update
        $ npm-check -s -u

