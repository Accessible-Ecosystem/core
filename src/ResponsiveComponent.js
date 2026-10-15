/**
 * @file
 * A generic component class that provides responsive functionality.
 */

import Component from "./Component.js";
import { isValidType } from "./validate.js";

/**
 * A generic responsive component class.
 *
 * @abstract
 */
class ResponsiveComponent extends Component {
  /**
   * The component name of the component.
   *
   * @protected
   *
   * @type {string}
   */
  _name = "ResponsiveComponent";

  /**
   * The breakpoint that the component will call media query list events.
   *
   * @protected
   *
   * @type {string}
   */
  _breakpoint = "";

  /**
   * The media query to use to trigger media query list events.
   *
   * @type {string}
   */
  _mediaQueryString = "";

  /**
   * This MediaQueryList for the component.
   *
   * @protected
   *
   * @type {MediaQueryList|null}
   */
  _mediaQueryList = null;

  /**
   * Constructs a new component.
   *
   * @param {object}             [options = {}]                           - The options for generating the component.
   * @param {?string}            [options.breakpoint = ""]                - The breakpoint at which the component will call media query list events.
   * @param {?string}            [options.mediaQuery = ""]                - An explicit media query to use to trigger media query list events.
   * @param {?string}            [options.prefix = ae-]                   - The prefix used for CSS custom properties and attributes.
   * @param {?string}            [options.key = null]                     - The key used to generate IDs throughout the component.
   * @param {?(string|string[])} [options.initializeClass = initializing] - The class(es) to apply when the component is in the initialization state.
   * @param {boolean}            [options.bootstrap = true]               - A flag to determine if the component should bootstrap itself.
   */
  constructor({
    breakpoint = "",
    mediaQuery = "",
    prefix = "ae-",
    key = null,
    initializeClass = "initializing",
    bootstrap = true,
  } = {}) {
    super({ prefix, key, initializeClass, bootstrap: false });

    // Set the breakpoint and media query.
    this._breakpoint = breakpoint || "";
    this._mediaQueryString = mediaQuery || "";

    if (bootstrap) {
      this._bootstrap();
    }
  }

  /**
   * Bootstraps the component by registering the base events.
   *
   * @protected
   */
  _bootstrap() {
    try {
      super._bootstrap();

      // Integrate new validation functionality.
      this._addEventListener(
        this.getEventName("validate"),
        this.rootDOMElement,
        (event) => {
          if (event.detail.component !== this) return;
          // String checks.
          const strings = {
            mediaQuery: this._mediaQueryString,
            breakpoint: this._breakpoint,
          };

          // Check the strings.
          const stringChecks = isValidType("string", strings, {
            shouldThrow: false,
          });

          // Handle string check failure.
          if (!stringChecks.status) {
            this._errors = [...this._errors, ...stringChecks.errors];
            this._valid = false;
          }
        }
      );

      // Integrate new initialization functionality.
      this._addEventListener(
        this.getEventName("initialize"),
        this.rootDOMElement,
        (event) => {
          if (event.detail.component !== this) return;
          this._handleMediaMatch();
        }
      );
    } catch (error) {
      this._valid = false;
      console.error(error);
    }
  }

  /**
   * The breakpoint that the component will call media query list events.
   *
   * @type {string}
   *
   * @see _breakpoint
   */
  get breakpoint() {
    return this._breakpoint;
  }

  set breakpoint(value) {
    isValidType("string", { breakpoint: value });

    if (this._breakpoint !== value) {
      this._breakpoint = value;
    }
  }

  /**
   * The media query to use to trigger media query list events.
   *
   * @type {string}
   *
   * @see _mediaQueryString
   */
  get mediaQuery() {
    if (this._mediaQueryString !== "") {
      return this._mediaQueryString;
    }

    if (this._breakpoint === "") {
      return "";
    }

    return `(width <= ${this._breakpoint})`;
  }

  set mediaQuery(value) {
    isValidType("string", { mediaQuery: value });

    if (this._mediaQueryString !== value) {
      this._mediaQueryString = value;
    }
  }

  /**
   * A callback for media query list events.
   *
   * @protected
   *
   * @abstract
   *
   * @param {MediaQueryListEvent} event - The event.
   */
  _mediaQueryListEventCallback(event) {
    // Add functionality to handle media matches.
    if (event.matches) {
      // Do something.
    } else {
      // Do something else.
    }
  }

  /**
   * Handles media match events throughout the component.
   *
   * @protected
   */
  _handleMediaMatch() {
    if (this.mediaQuery === "") {
      return;
    }

    this._mediaQueryList = window.matchMedia(this.mediaQuery);
    this._addEventListener("change", this._mediaQueryList, (event) =>
      this._mediaQueryListEventCallback(event)
    );

    requestAnimationFrame(() => {
      this._mediaQueryListEventCallback(this._mediaQueryList);
    });
  }
}

export default ResponsiveComponent;
