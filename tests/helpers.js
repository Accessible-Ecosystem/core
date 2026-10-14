import { afterEach, vi } from "vitest";
import Component from "../src/Component.js";
import ResponsiveComponent from "../src/ResponsiveComponent.js";
import CollapsableComponent from "../src/CollapsableComponent.js";

const components = [];

/**
 * Creates a bootstrapped abstract component with a real root element.
 *
 * @param  {object}           [options = {}]     - Constructor options.
 * @param  {typeof Component} [Type = Component] - Component class.
 * @return {Component}                           - The component.
 */
export function createComponent(options = {}, Type = Component) {
  const component = new Type({ ...options, bootstrap: false });
  const root =
    Type === CollapsableComponent
      ? options.controllerElement
      : document.createElement("button");
  component._dom.root = root;
  component._rootDOMElement = "root";
  document.body.appendChild(root);
  components.push(component);
  component._bootstrap();
  return component;
}

/**
 * Creates a responsive component.
 *
 * @param  {object}              [options = {}] - Constructor options.
 * @return {ResponsiveComponent}                - The component.
 */
export function createResponsive(options = {}) {
  return createComponent(options, ResponsiveComponent);
}

/**
 * Creates a collapsable component with controller and controlled elements.
 *
 * @param  {object}               [options = {}] - Constructor options.
 * @return {CollapsableComponent}                - The component.
 */
export function createCollapsable(options = {}) {
  return createComponent(
    {
      controllerElement: document.createElement("button"),
      controlledElement: document.createElement("div"),
      ...options,
    },
    CollapsableComponent
  );
}

/**
 * Stubs matchMedia with a real EventTarget for change-event tests.
 *
 * @param  {boolean} [matches = false] - The initial match state.
 * @return {object}                    - The media query list and matchMedia mock.
 */
export function setupMatchMedia(matches = false) {
  const list = new EventTarget();
  Object.assign(list, { matches, media: "(width <= 768px)" });
  const matchMedia = vi.fn(() => list);
  vi.stubGlobal("matchMedia", matchMedia);
  return { list, matchMedia };
}

afterEach(() => {
  for (const component of components.splice(0)) component.dispose();
  document.body.innerHTML = "";
  delete window.AccessibleEcosystemStorage;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
