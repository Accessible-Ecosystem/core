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
  _name = "ResponsiveComponent";

  /**
   * The breakpoint used to generate the component's media query.
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
   * The MediaQueryList for the component.
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
   * @param {?string}            [options.breakpoint = ""]                - The breakpoint used to generate the component's media query.
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

      // Register the validation listener.
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

      // Register the initialization listener.
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
   * The breakpoint used to generate the component's media query.
   *
   * Changing this value after initialization replaces the media query listener.
   * An explicit mediaQuery still takes priority over the breakpoint.
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

      if (this.isInitialized) this._handleMediaMatch();
    }
  }

  /**
   * The media query to use to trigger media query list events.
   *
   * Changing this value after initialization replaces the media query listener.
   * An empty string uses the breakpoint, or removes the listener if neither is set.
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

      if (this.isInitialized) this._handleMediaMatch();
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
      // Handle a matching media query.
    } else {
      // Handle a media query that does not match.
    }
  }

  /**
   * Handles media match events throughout the component.
   *
   * Removes the old listener and cancels its pending callback first.
   * If the query is empty, leaves the component without a media query listener.
   *
   * @protected
   */
  _handleMediaMatch() {
    this._cancelAnimationFrame("mediaMatch");

    if (this._mediaQueryList) {
      this._removeEventListeners({
        type: "change",
        element: this._mediaQueryList,
      });
      this._mediaQueryList = null;
    }

    if (this.mediaQuery === "") {
      return;
    }

    this._mediaQueryList = window.matchMedia(this.mediaQuery);
    this._addEventListener("change", this._mediaQueryList, (event) =>
      this._mediaQueryListEventCallback(event)
    );

    this._requestAnimationFrame(() => {
      this._mediaQueryListEventCallback(this._mediaQueryList);
    }, "mediaMatch");
  }
}

export default ResponsiveComponent;
