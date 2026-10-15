/**
 * Getter/Setter tests for the ResponsiveComponent class.
 */

import { describe, it, expect } from "vitest";
import { createResponsive } from "../helpers.js";

describe("ResponsiveComponent getter/setters", () => {
  describe("breakpoint", () => {
    it("should return the configured breakpoint", () => {
      const component = createResponsive({ breakpoint: "768px" });

      expect(component.breakpoint).toBe("768px");
    });

    it("should update the breakpoint", () => {
      const component = createResponsive({ breakpoint: "768px" });

      component.breakpoint = "1024px";

      expect(component.breakpoint).toBe("1024px");
    });
  });

  describe("mediaQuery", () => {
    it("should derive the query from the configured breakpoint", () => {
      const component = createResponsive({ breakpoint: "768px" });

      expect(component.mediaQuery).toBe("(width <= 768px)");
    });

    it("should derive the query from an updated breakpoint", () => {
      const component = createResponsive({ breakpoint: "768px" });
      component.breakpoint = "1024px";

      expect(component.mediaQuery).toBe("(width <= 1024px)");
    });

    it("should prefer an explicit query over the breakpoint", () => {
      const component = createResponsive({
        breakpoint: "768px",
        mediaQuery: "(min-width: 1024px)",
      });

      expect(component.mediaQuery).toBe("(min-width: 1024px)");
    });

    it("should update an explicit query", () => {
      const component = createResponsive();

      component.mediaQuery = "(orientation: portrait)";

      expect(component.mediaQuery).toBe("(orientation: portrait)");
    });

    it("should fall back to the breakpoint when the explicit query is cleared", () => {
      const component = createResponsive({
        breakpoint: "768px",
        mediaQuery: "(orientation: portrait)",
      });

      component.mediaQuery = "";

      expect(component.mediaQuery).toBe("(width <= 768px)");
    });

    it("should return an empty query when no breakpoint or query is configured", () => {
      expect(createResponsive().mediaQuery).toBe("");
    });
  });
  for (const name of ["breakpoint", "mediaQuery"])
    describe(name, () => {
      it("should retain its value when assigned again", () => {
        const component = createResponsive();

        component[name] = "768px";
        const original = component[name];
        component[name] = "768px";

        expect(component[name]).toBe(original);
      });

      it.each([123, null, {}, []])(
        "should reject %j without changing its value",
        (value) => {
          const component = createResponsive({ breakpoint: "768px" });
          const original = component[name];

          expect(() => {
            component[name] = value;
          }).toThrow(TypeError);
          expect(component[name]).toBe(original);
        }
      );
    });
});
