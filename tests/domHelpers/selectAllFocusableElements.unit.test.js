/**
 * Tests for the selectAllFocusableElements() function.
 */

import { describe, it, expect, afterEach } from "vitest";
import { selectAllFocusableElements } from "../../src/domHelpers.js";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("selectAllFocusableElements", () => {
  it.each([
    '<a href="#one">One</a>',
    '<area href="#two" />',
    "<input />",
    "<select></select>",
    "<textarea></textarea>",
    "<button>Button</button>",
    '<div tabindex="0"></div>',
  ])("should select supported element %s", (markup) => {
    const context = document.createElement("div");
    context.innerHTML = markup;

    expect(selectAllFocusableElements(context)).toEqual([
      context.firstElementChild,
    ]);
  });

  it("should preserve DOM order", () => {
    const context = document.createElement("div");
    context.innerHTML = '<button>First</button><a href="#">Second</a><input />';

    expect(selectAllFocusableElements(context)).toEqual(
      Array.from(context.children)
    );
  });

  it.each([
    "<input disabled />",
    "<select disabled></select>",
    "<textarea disabled></textarea>",
    "<button disabled>Button</button>",
  ])("should exclude disabled controls %s", (markup) => {
    const context = document.createElement("div");
    context.innerHTML = markup;

    expect(selectAllFocusableElements(context)).toEqual([]);
  });

  it("should exclude tabindex -1", () => {
    const context = document.createElement("div");
    context.innerHTML = '<div tabindex="-1">Skip</div>';

    expect(selectAllFocusableElements(context)).toEqual([]);
  });

  it("should exclude links without href", () => {
    const context = document.createElement("div");
    context.innerHTML = "<a>No href</a>";

    expect(selectAllFocusableElements(context)).toEqual([]);
  });

  it("should use the document by default", () => {
    document.body.innerHTML = "<button>One</button>";

    expect(selectAllFocusableElements()).toEqual([
      document.querySelector("button"),
    ]);
  });

  it("should apply the filter function", () => {
    const context = document.createElement("div");
    context.innerHTML =
      '<button data-kind="primary">Primary</button><button>Secondary</button>';

    expect(
      selectAllFocusableElements(
        context,
        (element) => element.dataset.kind === "primary"
      )
    ).toEqual([context.firstElementChild]);
  });

  it("should return an empty array when the filter excludes all elements", () => {
    const context = document.createElement("div");
    context.innerHTML = "<button>One</button>";

    expect(selectAllFocusableElements(context, () => false)).toEqual([]);
  });

  it("should return an empty array when no focusable elements exist", () => {
    expect(selectAllFocusableElements(document.createElement("div"))).toEqual(
      []
    );
  });
});
