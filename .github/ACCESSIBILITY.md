# Accessibility policy

## Our commitment

Accessible Ecosystem projects help people who may use the web differently than we do. We want people with disabilities, including people who use assistive technology, to be able to use our components, read our documentation, and contribute to our projects.

Accessibility is our highest priority. That includes the people reading our code. We aim to write plainly enough for someone entering the field to follow, with the detail experienced developers need to understand and maintain the work.

We work toward [Web Content Accessibility Guidelines 2.2 Level AA](https://www.w3.org/TR/WCAG22/) for our web content and examples. Components that implement an interaction pattern are designed to follow the relevant [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) pattern and [WAI-ARIA](https://www.w3.org/TR/wai-aria/) requirements.

These are our accessibility goals. They are not a claim of verified conformance across every project or example. We use automated checks and human review to assess our work. Contributors remain responsible for what they submit, including work created with AI assistance.

## Supported environments

Core provides shared JavaScript classes and utilities for browser-based components. The complete interaction, and its behavior with assistive technology, also depend on the component built with Core and the website that uses it.

Core does not currently publish a browser-version or assistive-technology support matrix. We cannot claim verified compatibility with a particular combination without testing it. Projects that use Core may document their own supported environments and test results.

If you encounter an issue in your browser or assistive technology, please report it. You do not need to establish that your environment is officially supported before asking for help.

## Known limitations

- Core provides the foundations for components, rather than a complete user interface. A website's markup, styling, content, and integration affect the accessibility of the result.
- Automated tests cannot establish that an interaction works for every person or assistive technology. A passing test suite is not a guarantee of accessibility.
- We do not currently publish a comprehensive record of browser and assistive-technology testing. Compatibility beyond recorded checks remains unverified.

Confirmed issues and available workarounds are tracked in [Core's issues](https://github.com/Accessible-Ecosystem/core/issues). A limitation that has not been reported or documented may still exist.

## Report an accessibility issue

[Open an accessibility issue](https://github.com/Accessible-Ecosystem/core/issues/new?template=accessibility.md) to report an issue in Core or its documentation. For another Accessible Ecosystem project, use that project's issue tracker.

Tell us what you were trying to do and what made it difficult or prevented you from continuing. The following details can help, if you have them:

- A link to the affected page, component, or example.
- What happened and what you expected instead.
- Steps to reproduce the problem.
- Your package version, browser, operating system, and assistive technology, including versions where available.
- Any workaround you found.

You do not need to provide a diagnosis, identify a standard, write code, or propose a fix. An incomplete technical report is still useful. Screenshots and recordings are optional.

GitHub issues are public. Share only information you are comfortable making public.

## How we respond

Project maintainers are responsible for reviewing accessibility reports and keeping this policy current. We treat reports as evidence of a person's experience and an opportunity to improve the project.

We prioritize issues that prevent people from completing tasks, while considering impact and available workarounds. We explain relevant dependencies and limitations, share workarounds when available, and update the issue as work progresses. We may ask whether a proposed fix resolves the issue you reported.

Resolution time depends on the problem and maintainer availability. When we can provide an expected timeline, we share it in the issue and update it if circumstances change.

## Attribution

This policy is based on the [Accessibility Toolkit accessibility policy](https://github.com/open-source-accessibility/accessibility-toolkit/blob/main/ACCESSIBILITY.md) by Open Source Accessibility, adapted for Accessible Ecosystem.
