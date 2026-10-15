import { afterEach, vi } from "vitest";
import Component from "../src/Component.js";
import ResponsiveComponent from "../src/ResponsiveComponent.js";
import CollapsibleComponent from "../src/CollapsibleComponent.js";

const components = [];

/**
 * Creates a component with a root DOM element and registers its base events.
 *
 * @param  {object}           [options = {}]     - The options for generating the component.
 * @param  {typeof Component} [Type = Component] - The class to use when generating the component.
 * @return {Component}                           - The component.
 */
export function createComponent(options = {}, Type = Component) {
  const component = new Type({ ...options, bootstrap: false });
  const root =
    Type === CollapsibleComponent
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
 * @param  {object}              [options = {}] - The options for generating the component.
 * @return {ResponsiveComponent}                - The component.
 */
export function createResponsive(options = {}) {
  return createComponent(options, ResponsiveComponent);
}

/**
 * Creates a collapsible component with controller and controlled elements.
 *
 * @param  {object}               [options = {}] - The options for generating the component.
 * @return {CollapsibleComponent}                - The component.
 */
export function createCollapsible(options = {}) {
  return createComponent(
    {
      controllerElement: document.createElement("button"),
      controlledElement: document.createElement("div"),
      ...options,
    },
    CollapsibleComponent
  );
}

/**
 * Stubs matchMedia with an EventTarget that can dispatch change events.
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
