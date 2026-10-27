# Project policy starters

Use these starter documents for projects that use Accessible Ecosystem Core. They keep Core's shared expectations for accessibility, readable code, contributor responsibility, and human review of AI-assisted contributions.

The [project folder](project/) mirrors a repository. It includes the contribution, AI, accessibility, security, commit, and conduct policies, GitHub issue and pull request templates, `AGENTS.md`, and the required Unslop skill.

## Set up a project

1. Copy the contents of `project/` into your repository root, including `.github/`. Review and merge existing files rather than overwriting project-specific policies.
2. Replace the placeholders listed below. Do not publish documents with unfinished placeholders.
3. Check setup and test commands against your package scripts. The defaults use Core's Node.js 24, npm, ESLint, Prettier, JSDoc, Commitizen, and `.unit.test.js` conventions. Update them wherever your project differs.
4. Review the accessibility commitment, reporting process, enforcement responsibilities, and all other promises with the people who will maintain them.
5. Check the copied links in their destination. The contribution guide expects the project's license at `LICENSE`; adjust that link if needed. Confirm that issue labels exist. The accessibility template uses the existing `bug` label.
6. Keep the Core attribution and the original source credits. Review future Core policy changes and decide which apply to your project.

These are starter copies. They do not update automatically when Core changes. The source links point to Core's `1.x` branch.

## Project details

Replace every occurrence of the following placeholders:

| Placeholder                           | What to provide                                                                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{PROJECT_NAME}}`                    | The project's name.                                                                                                                                  |
| `{{REPOSITORY_URL}}`                  | The repository's full GitHub URL, without a trailing slash.                                                                                          |
| `{{BASE_BRANCH}}`                     | The branch contributors should start from.                                                                                                           |
| `{{LICENSE_NAME}}`                    | The project's license name.                                                                                                                          |
| `{{LICENSE_ID}}`                      | The license identifier declared in `package.json`.                                                                                                   |
| `{{CONDUCT_REPORTING_EMAIL}}`         | The address monitored by the people handling conduct reports.                                                                                        |
| `{{SUPPORTED_VERSION}}`               | A release or version range covered by the security policy. Add rows as needed.                                                                       |
| `{{SUPPORT_STATUS}}`                  | Whether that version receives security fixes.                                                                                                        |
| `{{SECURITY_REPORTING_INSTRUCTIONS}}` | The vulnerability reporting channel and how to use it.                                                                                               |
| `{{SECURITY_RESPONSE_EXPECTATIONS}}`  | Response and review expectations maintainers can meet.                                                                                               |
| `{{DEPENDENCY_SECURITY_POLICY}}`      | How the project handles vulnerable dependencies and related releases.                                                                                |
| `{{PROJECT_DESCRIPTION}}`             | What the project provides and how integration affects accessibility.                                                                                 |
| `{{SUPPORTED_ENVIRONMENTS}}`          | Browser and assistive-technology support, distinguishing intended support from recorded testing. If no support matrix exists, say so.                |
| `{{KNOWN_LIMITATIONS}}`               | Confirmed accessibility limitations, relevant versions, and available workarounds. State any testing gaps rather than claiming that no issues exist. |

`[Brief description]` in issue titles is a prompt for reporters, not a project setup placeholder.

## Attribution and licenses

Each starter credits the corresponding Accessible Ecosystem Core document. The code of conduct also retains Contributor Covenant 3.0 attribution and its CC BY-SA 4.0 license. Keep that license and credit when adapting it. The accessibility policy retains Accessibility Toolkit credit, the contribution guide retains its Draft.js credit, and Unslop retains its Cursor credit.

Refer to [Core's license](../LICENSE) for the other Core material. A project's own contribution license does not replace the separate license stated in its code of conduct.
