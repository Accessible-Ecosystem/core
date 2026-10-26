# Security policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |

## Report a vulnerability

To report a vulnerability in Core, [open an issue](https://github.com/Accessible-Ecosystem/core/issues/new) with the `security` label.

Maintainers check issues at least two or three times a week. You can expect a response within a few days.

If you submit a pull request with a fix, maintainers will review it within the same time frame. Otherwise, the time needed to develop a fix depends on the severity of the vulnerability.

## Vulnerabilities in dependencies

Core has no production dependencies. Maintainers will update vulnerable development dependencies when possible. Maintainers may not publish a Core release immediately after these updates.

Maintainers prioritize vulnerabilities in tools that compile project code, including [Vite](https://github.com/vitejs/vite) and its plugins. When a vulnerability in one of these dependencies is resolved, maintainers will publish a new Core release.
