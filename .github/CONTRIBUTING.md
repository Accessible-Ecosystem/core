# Contributing to Accessible Ecosystem

Whether you want to add a feature or simply report a bug or issue, please have a quick read through these guidelines before contributing.

## Developed with Github

We use github to host code, to track issues and feature requests, as well as accept pull requests. All other forms of communication with maintainers is not considered "official".

## [Github Flow](https://guides.github.com/introduction/flow/index.html) is the Way to Go

All code changes happen through pull requests.

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from 4.x.
2. Link your pull request to any relevant open issues.
3. If you've added or changed functionality update the documentation.
4. Make sure your code functions.
5. Update existing tests or write a new test to ensure your code will _continue_ to function regardless of future changes.
6. Make sure your code lints.
7. Issue the pull request!

## Any contribution you make will be under the ISC License

In short, when you submit code changes, your submissions are understood to be under the same ISC License that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issues](https://github.com/Accessible-Ecosystem/core/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/Accessible-Ecosystem/core/issues/new).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes
  - why you think this might be happening
  - stuff you tried that didn't work

Everybody loves a thorough bug report!

## Keep Your Code Consistent

- Run `npm install` to ensure you have all the tools needed.
- Keep all functional code inside of the `src/` directory.
- Keep all test code inside of the `tests/` directory.
- Use the coding standards provided.

This project follows a set of coding standards combining [StandardJS](https://standardjs.com/), [Prettier](https://prettier.io/), and [JSDoc](https://jsdoc.app/) for JavaScript and [Standard SCSS](https://github.com/stylelint-scss/stylelint-config-standard-scss#readme), [Sass Guidelines](https://github.com/bjankord/stylelint-config-sass-guidelines#readme), Prettier, and [SMACSS](https://smacss.com/) for Sass.

To check your code, you can use [ESLint](https://eslint.org/)/[Stylelint](https://stylelint.io/)/Prettier with the provided script:

```shell
npm run lint
```

Code that does not follow the linting standards _will not_ be merged.

## Test projects that depend on Core

The `Dependent project tests` workflow runs on pushes and pull requests to `*.x` branches. You can also run it manually from GitHub Actions.

The workflow packs the checked-out Core changes with `npm pack`, installs each dependent project's locked dependencies with `npm ci`, and replaces its Core dependency with that tarball before running its tests. This checks the files Core would publish without publishing a release or changing the dependent project's package files.

To add a project, add an entry to `strategy.matrix.project` in `.github/workflows/dependents.yml` with its GitHub `repository`, branch or tag in `ref`, and npm `test-script`. Choose a ref that depends on Core and a test script that exits after running. Each project must have a committed `package-lock.json`.

Each project runs in a separate job, and a failure does not cancel the other projects. The workflow supports public repositories with read-only repository permissions. Private repositories need a separate checkout credential with access to that repository.

## Commit Guidelines

This project uses the conventional commit standard, which means your commits should follow a basic template of:

> \<type>[optional scope]: \<description>
>
> [optional body]
>
> [optional footer(s)]

For more detailed information about available types, scopes, breaking changes, etc. please see the [official documentation](https://www.conventionalcommits.org/en/v1.0.0/).

This project also provides a command to assist you in formatting commit messages using [commitizen](https://commitizen.github.io/cz-cli/):

```shell
npm run commit
```

Commits that do not follow this format _will not_ be merged.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md)
