# Contributing to Accessible Ecosystem

Read these guidelines before contributing code, documentation, bug reports, or feature requests.

## Write for the people who use and maintain this project

Accessible Ecosystem projects help people who may use the web differently than we do. Contributions should reflect the same care we put into making the web more accessible and friendly for everyone.

Accessibility also includes the people reading our code and documentation. Write plainly so someone just entering the field can follow your work, while giving experienced developers the detail they need to understand and maintain it.

- Use descriptive names, clear steps, and straightforward conditions. Avoid clever shortcuts that make the code harder to understand.
- Follow the project's existing structure and conventions. Introduce shared code when it makes the behavior easier to follow, rather than simply reducing the number of lines.
- Explain decisions and behavior that are not obvious. Keep comments useful, and update affected documentation when behavior changes.
- Keep contributions focused on the problem they address. Avoid unrelated cleanup or refactoring.
- Preserve existing behavior unless the contribution intentionally changes it. Consider keyboard interactions, focus, events, and compatibility.
- Use the relevant accessibility standards and ARIA Authoring Practices Guide patterns when changing accessibility behavior. Check HTML examples and generated markup for validity.
- Test the behavior your contribution affects. Passing automated checks alone does not establish that an interaction is accessible.

By submitting any contribution, you take responsibility for its contents, whether you wrote it yourself or used assistance. Submit work you understand, have reviewed, and can explain.

Read the [project instructions](../AGENTS.md) and [accessibility policy](ACCESSIBILITY.md) before contributing. AI-assisted contributions must also follow the [AI contribution policy](AI_CONTRIBUTIONS.md).

## Where to contribute

We use GitHub to host code, track bugs and feature requests, and review pull requests. Use GitHub issues and pull requests so project discussions and decisions are available to contributors.

## Submit a pull request

All code changes happen through pull requests.

1. Fork the repository and create your branch from `1.x`.
2. Make your changes and update any affected documentation.
3. Add or update tests that demonstrate the intended behavior where the change needs test coverage.
4. Run the relevant tests and code checks described below. Verify the affected behavior yourself.
5. Open your pull request and link any relevant issues. Describe the change, how you verified it, and any remaining limitations.

## Contribution license

Contributions must use the same license as the project, [GNU General Public License version 3 or later](../LICENSE), identified as `GPL-3.0-or-later` in `package.json`.

## Report a bug

Report bugs by [opening a GitHub issue](https://github.com/Accessible-Ecosystem/core/issues/new).

Include the following in your bug report:

- A summary of the problem.
- Steps to reproduce it, with a small code example if possible.
- What you expected to happen.
- What actually happened.
- Any relevant background, such as your browser, package version, and anything you have already tried.

## Set up and check your changes

Use Node.js 24, which is also used by the project workflows. Run `npm install` to install the development tools.

Keep component code in `src/` and tests in `tests/`. Name unit test files `.unit.test.js`. Follow the existing code structure and conventions.

The project uses [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), and [JSDoc](https://jsdoc.app/) to keep code and comments consistent.

Check your code without changing files:

```shell
npm run eslint
npm run prettier -- --check
```

To apply automatic fixes and formatting, run:

```shell
npm run lint
```

Review the resulting changes. Automatic fixes do not resolve every issue. Code must pass the project's linting and formatting checks before it can be merged.

Run the unit tests:

```shell
npm run test:unit
```

Also verify the behavior your change affects. Automated tests alone do not establish that an interaction is accessible.

## Test projects that depend on Core

Core changes can affect projects that use it. The `Dependent project tests` workflow runs those projects' tests against your Core changes.

The workflow runs on pushes and pull requests to `*.x` branches. You can also run it manually from GitHub Actions.

The workflow packs the checked-out Core changes with `npm pack`, installs each dependent project's locked dependencies with `npm ci`, and replaces its Core dependency with that tarball before running its tests. This checks the files Core would publish without publishing a release or changing the dependent project's package files.

To add a project, add an entry to `strategy.matrix.project` in `.github/workflows/dependents.yml` with its GitHub `repository`, branch or tag in `ref`, and npm `test-script`. Choose a ref that depends on Core and a test script that exits after running. Each project must have a committed `package-lock.json`.

Each project runs in a separate job, and a failure does not cancel the other projects. The workflow supports public repositories with read-only repository permissions. Private repositories need a separate checkout credential with access to that repository.

## Commit guidelines

Write commit messages using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). For example:

```text
fix: cancel pending callbacks when disposing a component
```

The format is:

> \<type>[optional scope]: \<description>
>
> [optional body]
>
> [optional footer(s)]

See the specification for commit types, optional scopes, and how to describe breaking changes.

You can use [Commitizen](https://commitizen.github.io/cz-cli/) to write a commit message through guided prompts:

```shell
npm run commit
```

Commit messages must follow this format before a contribution can be merged.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md)
