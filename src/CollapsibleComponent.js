/**
 * @file
 * A generic component class that provides collapsible functionality.
 */

import ResponsiveComponent from "./ResponsiveComponent.js";
import TransactionalValue from "./TransactionalValue.js";
import { isValidClassList, isValidType } from "./validate.js";
import { addClass, removeClass } from "./domHelpers.js";

/**
 * A generic collapsible component class.
 *
 * @abstract
 *
 * @extends ResponsiveComponent
 */
class CollapsibleComponent extends ResponsiveComponent {
  _name = "CollapsibleComponent";

  /**
   * Whether the component is expanded or collapsed.
   *
   * @protected
   *
   * @type {TransactionalValue<boolean>}
   */
  _expanded = new TransactionalValue(false);

  /**
   * Whether the component is locked or unlocked.
   *
   * @protected
   *
   * @type {TransactionalValue<boolean>}
   */
  _locked = new TransactionalValue(false);

  /**
   * Whether the component should expand inside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _expandInsideBreakpoint = false;

  /**
   * Whether the component should expand outside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _expandOutsideBreakpoint = false;

  /**
   * Whether the component should collapse inside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _collapseInsideBreakpoint = false;

  /**
   * Whether the component should collapse outside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _collapseOutsideBreakpoint = false;

  /**
   * Whether the component should lock inside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _lockInsideBreakpoint = false;

  /**
   * Whether the component should lock outside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _lockOutsideBreakpoint = false;

  /**
   * Whether the component should unlock inside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _unlockInsideBreakpoint = false;

  /**
   * Whether the component should unlock outside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _unlockOutsideBreakpoint = false;

  /**
   * Constructs a collapsible component.
   *
   * @param {object}             [options = {}]                              - The options for generating the component.
   * @param {HTMLElement}        options.controllerElement                   - The element controlling expansion.
   * @param {HTMLElement}        options.controlledElement                   - The element to expand or collapse.
   * @param {?HTMLElement}       [options.triggerElement = null]             - The element receiving expansion clicks. If null, the controller element is used.
   * @param {?(string|string[])} [options.lockClass = locked]                - The class(es) to apply when the component is in the locked state.
   * @param {?(string|string[])} [options.unlockClass = unlocked]            - The class(es) to apply when the component is in the unlocked state.
   * @param {?(string|string[])} [options.expandClass = show]                - The class(es) to apply when the component is in the expanded state.
   * @param {?(string|string[])} [options.collapseClass = hide]              - The class(es) to apply when the component is in the collapsed state.
   * @param {?(string|string[])} [options.transitionClass = transitioning]   - The class(es) to apply when the component is transitioning between expanded and collapsed states.
   * @param {number}             [options.transitionDelay = 250]             - The transition delay in milliseconds.
   * @param {number}             [options.transitionDuration = 150]          - The transition duration in milliseconds.
   * @param {number}             [options.expandDuration = -1]               - The transition duration for expanding in milliseconds.
   * @param {number}             [options.collapseDuration = -1]             - The transition duration for collapsing in milliseconds.
   * @param {boolean}            [options.expandInsideBreakpoint = fal se]   - Whether to expand inside the breakpoint.
   * @param {boolean}            [options.expandOutsideBreakpoint = false]   - Whether to expand outside the breakpoint.
   * @param {boolean}            [options.collapseInsideBreakpoint = false]  - Whether to collapse inside the breakpoint.
   * @param {boolean}            [options.collapseOutsideBreakpoint = false] - Whether to collapse outside the breakpoint.
   * @param {boolean}            [options.lockInsideBreakpoint = false]      - Whether to lock inside the breakpoint.
   * @param {boolean}            [options.lockOutsideBreakpoint = false]     - Whether to lock outside the breakpoint.
   * @param {boolean}            [options.unlockInsideBreakpoint = false]    - Whether to unlock inside the breakpoint.
   * @param {boolean}            [options.unlockOutsideBreakpoint = false]   - Whether to unlock outside the breakpoint.
   * @param {boolean}            [options.locked = false]                    - The initial locked state.
   * @param {?string}            [options.breakpoint = ""]                   - The breakpoint used to generate the component's media query.
   * @param {?string}            [options.mediaQuery = ""]                   - An explicit media query to use to trigger media query list events.
   * @param {?string}            [options.prefix = ae-]                      - The prefix for CSS properties and attributes.
   * @param {?string}            [options.key = null]                        - The key for generated IDs.
   * @param {?(string|string[])} [options.initializeClass = initializing]    - The class(es) to apply when the component is in the initialization state.
   * @param {boolean}            [options.bootstrap = true]                  - Whether to bootstrap the component.
   */
  constructor({
    controllerElement,
    controlledElement,
    triggerElement = null,
    lockClass = "locked",
    unlockClass = "unlocked",
    expandClass = "show",
    collapseClass = "hide",
    transitionClass = "transitioning",
    transitionDelay = 250,
    transitionDuration = 150,
    expandDuration = -1,
    collapseDuration = -1,
    expandInsideBreakpoint = false,
    expandOutsideBreakpoint = false,
    collapseInsideBreakpoint = false,
    collapseOutsideBreakpoint = false,
    lockInsideBreakpoint = false,
    lockOutsideBreakpoint = false,
    unlockInsideBreakpoint = false,
    unlockOutsideBreakpoint = false,
    locked = false,
    breakpoint = "",
    mediaQuery = "",
    prefix = "ae-",
    key = null,
    initializeClass = "initializing",
    bootstrap = true,
  } = {}) {
    super({
      breakpoint,
      mediaQuery,
      prefix,
      key,
      initializeClass,
      bootstrap: false,
    });

    // Set the DOM elements.
    this._dom.controller = controllerElement;
    this._dom.trigger = triggerElement ?? controllerElement;
    this._dom.controlled = controlledElement;

    // Set the protected elements.
    this._protectedDOMElements.push("controller", "trigger", "controlled");

    // Set the classes for the component.
    this._classes.locked = lockClass || "";
    this._classes.unlocked = unlockClass || "";
    this._classes.expand = expandClass || "";
    this._classes.collapse = collapseClass || "";
    this._classes.transition = transitionClass || "";

    // Set the delays for the component.
    this._delays.transition = transitionDelay;

    // Set the durations for the component.
    this._durations.transition = transitionDuration;
    this._durations.expand = expandDuration;
    this._durations.collapse = collapseDuration;

    // Set the expand/collapse/lock/unlock flags for the component.
    this._expandInsideBreakpoint = expandInsideBreakpoint;
    this._expandOutsideBreakpoint = expandOutsideBreakpoint;
    this._collapseInsideBreakpoint = collapseInsideBreakpoint;
    this._collapseOutsideBreakpoint = collapseOutsideBreakpoint;
    this._lockInsideBreakpoint = lockInsideBreakpoint;
    this._lockOutsideBreakpoint = lockOutsideBreakpoint;
    this._unlockInsideBreakpoint = unlockInsideBreakpoint;
    this._unlockOutsideBreakpoint = unlockOutsideBreakpoint;

    // Set the initial locked state for the component.
    this._locked.value = locked;
    this._locked.commit();

    if (bootstrap) {
      this._bootstrap();
    }
  }

  /**
   * Bootstraps the component.
   *
   * @protected
   */
  _bootstrap() {
    super._bootstrap();

    // Register the base component events.
    this._registerEvent("preexpand");
    this._registerEvent("expand");
    this._registerEvent("postexpand");
    this._registerEvent("precollapse");
    this._registerEvent("collapse");
    this._registerEvent("postcollapse");
    this._registerEvent("prelock");
    this._registerEvent("lock");
    this._registerEvent("postlock");
    this._registerEvent("preunlock");
    this._registerEvent("unlock");
    this._registerEvent("postunlock");

    // Register the validation listener.
    this._addEventListener(
      this.getEventName("validate"),
      this.rootDOMElement,
      (event) => {
        if (event.detail.component !== this) return;
        // Boolean checks.
        const booleans = {
          locked: this._locked.value,
          _expandInsideBreakpoint: this._expandInsideBreakpoint,
          _expandOutsideBreakpoint: this._expandOutsideBreakpoint,
          _collapseInsideBreakpoint: this._collapseInsideBreakpoint,
          _collapseOutsideBreakpoint: this._collapseOutsideBreakpoint,
          _lockInsideBreakpoint: this._lockInsideBreakpoint,
          _lockOutsideBreakpoint: this._lockOutsideBreakpoint,
          _unlockInsideBreakpoint: this._unlockInsideBreakpoint,
          _unlockOutsideBreakpoint: this._unlockOutsideBreakpoint,
        };

        // Check the booleans.
        const booleanChecks = isValidType("boolean", booleans, {
          shouldThrow: false,
        });

        // Handle boolean check failure.
        if (!booleanChecks.status) {
          this._errors = [...this._errors, ...booleanChecks.errors];
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
        if (this.dom.controller.getAttribute("aria-expanded") === "true") {
          this.expand();
        } else {
          this.collapse();
        }

        if (this.isLocked) {
          this.lock();
        } else {
          this.unlock();
        }
      }
    );
  }

  /**
   * The class(es) to apply when the component is in the locked state.
   *
   * @type {string|string[]}
   *
   * @see _classes.locked
   */
  get lockedClass() {
    return this._classes.locked;
  }

  set lockedClass(value) {
    isValidClassList({ lockedClass: value });

    if (this._classes.locked !== value) {
      this._classes.locked = value;
    }
  }

  /**
   * The class(es) to apply when the component is in the unlocked state.
   *
   * @type {string|string[]}
   *
   * @see _classes.unlocked
   */
  get unlockedClass() {
    return this._classes.unlocked;
  }

  set unlockedClass(value) {
    isValidClassList({ unlockedClass: value });

    if (this._classes.unlocked !== value) {
      this._classes.unlocked = value;
    }
  }

  /**
   * The class(es) to apply when the component is in the expanded state.
   *
   * @type {string|string[]}
   *
   * @see _classes.expand
   */
  get expandClass() {
    return this._classes.expand;
  }

  set expandClass(value) {
    isValidClassList({ expandClass: value });

    if (this._classes.expand !== value) {
      this._classes.expand = value;
    }
  }

  /**
   * The class(es) to apply when the component is in the collapsed state.
   *
   * @type {string|string[]}
   *
   * @see _classes.collapse
   */
  get collapseClass() {
    return this._classes.collapse;
  }

  set collapseClass(value) {
    isValidClassList({ collapseClass: value });

    if (this._classes.collapse !== value) {
      this._classes.collapse = value;
    }
  }

  /**
   * The class(es) to apply when the component is transitioning between expanded and collapsed states.
   *
   * @type {string|string[]}
   *
   * @see _classes.transition
   */
  get transitionClass() {
    return this._classes.transition;
  }

  set transitionClass(value) {
    isValidClassList({ transitionClass: value });

    if (this._classes.transition !== value) {
      this._classes.transition = value;
    }
  }

  /**
   * The duration time (in milliseconds) for the transition between expanded and collapsed states.
   *
   * Setting this value will also set the --ae-transition-duration CSS custom property on the component.
   *
   * @type {number}
   *
   * @see _durations.transition
   */
  get transitionDuration() {
    return this._durations.transition;
  }

  set transitionDuration(value) {
    isValidType("number", { transitionDuration: value });

    if (this._durations.transition !== value) {
      this._durations.transition = value;
      this._setCustomProps();
    }
  }

  /**
   * The duration time (in milliseconds) for the transition from collapsed to expanded states.
   *
   * If expandDuration is set to -1, the transitionDuration value will be used instead.
   *
   * Setting this value will also set the --ae-expand-transition-duration CSS custom property on the component.
   *
   * @type {number}
   *
   * @see _durations.expand
   */
  get expandDuration() {
    if (this._durations.expand === -1) return this.transitionDuration;

    return this._durations.expand;
  }

  set expandDuration(value) {
    isValidType("number", { expandDuration: value });

    if (this._durations.expand !== value) {
      this._durations.expand = value;
      this._setCustomProps();
    }
  }

  /**
   * The duration time (in milliseconds) for the transition from expanded to collapsed states.
   *
   * If collapseDuration is set to -1, the transitionDuration value will be used instead.
   *
   * Setting this value will also set the --ae-collapse-transition-duration CSS custom property on the component.
   *
   * @type {number}
   *
   * @see _durations.collapse
   */
  get collapseDuration() {
    if (this._durations.collapse === -1) return this.transitionDuration;

    return this._durations.collapse;
  }

  set collapseDuration(value) {
    isValidType("number", { collapseDuration: value });

    if (this._durations.collapse !== value) {
      this._durations.collapse = value;
      this._setCustomProps();
    }
  }

  /**
   * Whether to expand the component when it gains focus in the DOM.
   *
   * @type {boolean}
   *
   * @see _expandOnFocus
   */
  get expandOnFocus() {
    return this._expandOnFocus;
  }

  set expandOnFocus(value) {
    isValidType("boolean", { expandOnFocus: value });

    if (this._expandOnFocus !== value) {
      this._expandOnFocus = value;
    }
  }

  /**
   * Whether to collapse the component when it loses focus in the DOM.
   *
   * @type {boolean}
   *
   * @see _collapseOnBlur
   */
  get collapseOnBlur() {
    return this._collapseOnBlur;
  }

  set collapseOnBlur(value) {
    isValidType("boolean", { collapseOnBlur: value });

    if (this._collapseOnBlur !== value) {
      this._collapseOnBlur = value;
    }
  }

  /**
   * The expanded state of the component.
   *
   * @readonly
   *
   * @type {boolean}
   *
   * @see _expand
   */
  get isExpanded() {
    return false;
  }

  /**
   * The committed expanded state of the component.
   *
   * @readonly
   *
   * @type {boolean}
   *
   * @see _expand
   */
  get shouldBeExpanded() {
    return this._expanded.committed;
  }

  /**
   * A flag to expand the component when inside the breakpoint.
   *
   * @type {boolean}
   *
   * @see _expandInsideBreakpoint
   */
  get expandInsideBreakpoint() {
    return this._expandInsideBreakpoint;
  }

  set expandInsideBreakpoint(value) {
    isValidType("boolean", { expandInsideBreakpoint: value });

    if (this._expandInsideBreakpoint !== value) {
      this._expandInsideBreakpoint = value;
    }
  }

  /**
   * A flag to expand the component when outside the breakpoint.
   *
   * @type {boolean}
   *
   * @see _expandOutsideBreakpoint
   */
  get expandOutsideBreakpoint() {
    return this._expandOutsideBreakpoint;
  }

  set expandOutsideBreakpoint(value) {
    isValidType("boolean", { expandOutsideBreakpoint: value });

    if (this._expandOutsideBreakpoint !== value) {
      this._expandOutsideBreakpoint = value;
    }
  }

  /**
   * A flag to collapse the component when inside the breakpoint.
   *
   * @type {boolean}
   *
   * @see _collapseInsideBreakpoint
   */
  get collapseInsideBreakpoint() {
    return this._collapseInsideBreakpoint;
  }

  set collapseInsideBreakpoint(value) {
    isValidType("boolean", { collapseInsideBreakpoint: value });

    if (this._collapseInsideBreakpoint !== value) {
      this._collapseInsideBreakpoint = value;
    }
  }

  /**
   * A flag to collapse the component when outside the breakpoint.
   *
   * @type {boolean}
   *
   * @see _collapseOutsideBreakpoint
   */
  get collapseOutsideBreakpoint() {
    return this._collapseOutsideBreakpoint;
  }

  set collapseOutsideBreakpoint(value) {
    isValidType("boolean", { collapseOutsideBreakpoint: value });

    if (this._collapseOutsideBreakpoint !== value) {
      this._collapseOutsideBreakpoint = value;
    }
  }

  /**
   * A flag to lock the component in its current state when inside the breakpoint.
   *
   * @type {boolean}
   *
   * @see _lockInsideBreakpoint
   */
  get lockInsideBreakpoint() {
    return this._lockInsideBreakpoint;
  }

  set lockInsideBreakpoint(value) {
    isValidType("boolean", { lockInsideBreakpoint: value });

    if (this._lockInsideBreakpoint !== value) {
      this._lockInsideBreakpoint = value;
    }
  }

  /**
   * A flag to lock the component in its current state when outside the breakpoint.
   *
   * @type {boolean}
   *
   * @see _lockOutsideBreakpoint
   */
  get lockOutsideBreakpoint() {
    return this._lockOutsideBreakpoint;
  }

  set lockOutsideBreakpoint(value) {
    isValidType("boolean", { lockOutsideBreakpoint: value });

    if (this._lockOutsideBreakpoint !== value) {
      this._lockOutsideBreakpoint = value;
    }
  }

  /**
   * A flag to unlock the component when inside the breakpoint.
   *
   * @type {boolean}
   */
  get unlockInsideBreakpoint() {
    return this._unlockInsideBreakpoint;
  }

  set unlockInsideBreakpoint(value) {
    isValidType("boolean", { unlockInsideBreakpoint: value });
    this._unlockInsideBreakpoint = value;
  }

  /**
   * A flag to unlock the component when outside the breakpoint.
   *
   * @type {boolean}
   */
  get unlockOutsideBreakpoint() {
    return this._unlockOutsideBreakpoint;
  }

  set unlockOutsideBreakpoint(value) {
    isValidType("boolean", { unlockOutsideBreakpoint: value });
    this._unlockOutsideBreakpoint = value;
  }

  /**
   * The locked state of the component.
   *
   * @readonly
   *
   * @type {boolean}
   *
   * @see _locked
   */
  get isLocked() {
    return this._locked.value;
  }

  /**
   * The committed lock state of the component.
   *
   * @readonly
   *
   * @type {boolean}
   *
   * @see _locked
   */
  get shouldBeLocked() {
    return this._locked.committed;
  }

  /**
   * A callback for media query list events.
   *
   * @protected
   *
   * @param {MediaQueryListEvent} event - The event.
   */
  _mediaQueryListEventCallback(event) {
    if (event.matches) {
      if (this.unlockInsideBreakpoint) {
        this.unlock();
      }

      if (this.isExpanded && this.collapseInsideBreakpoint) {
        if (this.isLocked) {
          this.unlock();
        }
        this.collapse({ preserveState: true });
      } else if (!this.isExpanded && this.expandInsideBreakpoint) {
        if (this.isLocked) {
          this.unlock();
        }
        this.expand();
      }

      if (this.lockInsideBreakpoint) {
        this.lock();
      }
    } else {
      if (this.unlockOutsideBreakpoint) {
        this.unlock();
      }

      if (this.isExpanded && this.collapseOutsideBreakpoint) {
        if (this.isLocked) {
          this.unlock();
        }
        this.collapse({ preserveState: true });
      } else if (!this.isExpanded && this.expandOutsideBreakpoint) {
        if (this.isLocked) {
          this.unlock();
        }
        this.expand();
      }

      if (this.lockOutsideBreakpoint) {
        this.lock();
      }
    }
  }

  /**
   * Applies the required attributes and classes for the component's expanded state.
   *
   * Sets the controller's `aria-expanded` to "true", adds the expand class(es) to
   * the controlled element, and removes the collapse class(es) from the controlled element.
   *
   * @protected
   *
   * @fires this._events.preexpand
   *
   * @fires this._events.expand
   *
   * @fires this._events.postexpand
   *
   * @param {Object<boolean>} [options = {}]                            - Options for expanding the component.
   * @param {boolean}         [options.emit = this.isInitialized]       - Emit the expand events.
   * @param {boolean}         [options.transition = this.isInitialized] - A flag to use transitions when changing the expanded state.
   */
  _expand({ emit = this.isInitialized, transition = this.isInitialized } = {}) {
    if (emit) {
      this._dispatchEvent("preexpand");
    }

    this.dom.controller.setAttribute("aria-expanded", "true");

    // Use animation frames to remove the collapse class and add the expand class.
    // Remove the transition class after the expand duration.
    if (transition && this.transitionClass !== "") {
      addClass(this.transitionClass, this.dom.controlled);

      this._requestAnimationFrame(() => {
        removeClass(this.collapseClass, this.dom.controlled);

        this._requestAnimationFrame(() => {
          addClass(this.expandClass, this.dom.controlled);

          this._requestAnimationFrame(() => {
            setTimeout(() => {
              removeClass(this.transitionClass, this.dom.controlled);
            }, this.expandDuration);
          }, "expandTransition");
        }, "expandTransition");
      }, "expandTransition");
    } else {
      // Add the expand class.
      addClass(this.expandClass, this.dom.controlled);

      // Remove the collapse class.
      removeClass(this.collapseClass, this.dom.controlled);
    }

    if (emit) {
      this._dispatchEvent("expand");
      this._dispatchEvent("postexpand");
    }
  }

  /**
   * Applies the required attributes and classes for the component's collapsed state.
   *
   * Sets the controller's `aria-expanded` to "false", adds the collapse class(es) to
   * the controlled element, and removes the expand class(es) from the controlled element.
   *
   * @protected
   *
   * @fires this._events.precollapse
   *
   * @fires this._events.collapse
   *
   * @fires this._events.postcollapse
   *
   * @param {Object<boolean>} [options = {}]                            - Options for collapsing the component.
   * @param {boolean}         [options.emit = this.isInitialized]       - Emit the collapse events.
   * @param {boolean}         [options.transition = this.isInitialized] - A flag to use transitions when changing the expanded state.
   */
  _collapse({
    emit = this.isInitialized,
    transition = this.isInitialized,
  } = {}) {
    if (emit) {
      this._dispatchEvent("precollapse");
    }

    this.dom.controller.setAttribute("aria-expanded", "false");

    // Use animation frames to remove the expand class and add the collapse class.
    // Remove the transition class after the collapse duration.
    if (transition && this.transitionClass !== "") {
      addClass(this.transitionClass, this.dom.controlled);

      this._requestAnimationFrame(() => {
        removeClass(this.expandClass, this.dom.controlled);

        this._requestAnimationFrame(() => {
          addClass(this.collapseClass, this.dom.controlled);

          this._requestAnimationFrame(() => {
            setTimeout(() => {
              removeClass(this.transitionClass, this.dom.controlled);
            }, this.collapseDuration);
          }, "collapseTransition");
        }, "collapseTransition");
      }, "collapseTransition");
    } else {
      // Add the collapse class.
      addClass(this.collapseClass, this.dom.controlled);

      // Remove the expand class.
      removeClass(this.expandClass, this.dom.controlled);
    }

    if (emit) {
      this._dispatchEvent("collapse");
      this._dispatchEvent("postcollapse");
    }
  }

  /**
   * Applies the required attributes and classes for the component's locked state.
   *
   * @protected
   *
   * @param {Object<boolean>} [options = {}]                      - Options for locking the component.
   * @param {boolean}         [options.emit = this.isInitialized] - Emit the lock events.
   */
  _lock({ emit = this.isInitialized } = {}) {
    if (emit) {
      this._dispatchEvent("prelock");
    }

    // Add the locked class.
    addClass(this.lockedClass, this.dom.controlled);

    // Remove the unlocked class.
    removeClass(this.unlockedClass, this.dom.controlled);

    this.dom.controller.setAttribute("disabled", "true");

    if (emit) {
      this._dispatchEvent("lock");
      this._dispatchEvent("postlock");
    }
  }

  /**
   * Applies the required attributes and classes for the component's unlocked state.
   *
   * @protected
   *
   * @param {Object<boolean>} [options = {}]                      - Options for unlocking the component.
   * @param {boolean}         [options.emit = this.isInitialized] - Emit the unlock events.
   */
  _unlock({ emit = this.isInitialized } = {}) {
    if (emit) {
      this._dispatchEvent("preunlock");
    }

    // Add the unlocked class.
    addClass(this.unlockedClass, this.dom.controlled);

    // Remove the locked class.
    removeClass(this.lockedClass, this.dom.controlled);

    this.dom.controller.removeAttribute("disabled");

    if (emit) {
      this._dispatchEvent("unlock");
      this._dispatchEvent("postunlock");
    }
  }

  /**
   * Expands the component.
   *
   * Sets the component's focus state to "self", calls _expand, and sets isExpanded to `true`.
   *
   * @param {Object<boolean>} [options = {}]                            - Options for expanding the component.
   * @param {boolean}         [options.force = !this.isInitialized]     - Force the expand action.
   * @param {boolean}         [options.emit = this.isInitialized]       - Emit the expand events.
   * @param {boolean}         [options.transition = this.isInitialized] - A flag to use transitions when changing the expanded state.
   * @param {boolean}         [options.preserveState = false]           - Preserve the expanded state.
   */
  expand({
    force = !this.isInitialized,
    emit = this.isInitialized,
    transition = this.isInitialized,
    preserveState = false,
  } = {}) {
    if (this.isExpanded && !force) return;
    if (this.isLocked && !force) return;

    // Set the focus state.
    this.focusState = "self";

    // Expand the component.
    this._expand({ emit, transition });

    // Set the expanded state.
    this._expanded.value = true;

    if (!preserveState) {
      // Commit the expanded state.
      this._expanded.commit();
    }
  }

  /**
   * Previews the component.
   *
   * Sets the component's focus state to "none", calls _expand, and sets isExpanded to `true`.
   *
   * @param {Object<boolean>} [options = {}]                            - Options for previewing the component.
   * @param {boolean}         [options.force = !this.isInitialized]     - Force the preview action.
   * @param {boolean}         [options.emit = this.isInitialized]       - Emit the expand events.
   * @param {boolean}         [options.transition = this.isInitialized] - A flag to use transitions when changing the expanded state.
   * @param {boolean}         [options.preserveState = false]           - Preserve the expanded state.
   */
  preview({
    force = !this.isInitialized,
    emit = this.isInitialized,
    transition = this.isInitialized,
    preserveState = false,
  } = {}) {
    if (this.isExpanded && !force) return;
    if (this.isLocked && !force) return;

    // Set the focus state.
    this.focusState = "none";

    // Expand the component.
    this._expand({ emit, transition });

    // Set the expanded state.
    this._expanded.value = true;

    if (!preserveState) {
      // Commit the expanded state.
      this._expanded.commit();
    }
  }

  /**
   * Collapses the component.
   *
   * Sets the component's focus state to "none", calls _collapse, and sets isExpanded to `false`.
   *
   * @param {Object<boolean>} [options = {}]                            - Options for closing the component.
   * @param {boolean}         [options.force = !this.isInitialized]     - Force the collapse action.
   * @param {boolean}         [options.emit = this.isInitialized]       - Emit the collapse events.
   * @param {boolean}         [options.transition = this.isInitialized] - A flag to use transitions when changing the expanded state.
   * @param {boolean}         [options.preserveState = false]           - Preserve the expanded state.
   */
  collapse({
    force = !this.isInitialized,
    emit = this.isInitialized,
    transition = this.isInitialized,
    preserveState = false,
  } = {}) {
    if (!this.isExpanded && !force) return;
    if (this.isLocked && !force) return;

    // Set the focus state.
    this.focusState = "none";

    // Collapse the component.
    this._collapse({ emit, transition });

    // Set the expanded state.
    this._expanded.value = false;

    if (!preserveState) {
      // Commit the expanded state.
      this._expanded.commit();
    }
  }

  /**
   * Toggles expanding and collapsing the component.
   *
   * @param {Object<boolean>} [options = {}]                            - Options for expanding/collapsing the component.
   * @param {boolean}         [options.force = !this.isInitialized]     - Force the expand or collapse action.
   * @param {boolean}         [options.emit = this.isInitialized]       - Emit the expand/collapse events.
   * @param {boolean}         [options.transition = this.isInitialized] - A flag to use transitions when changing the expanded state.
   * @param {boolean}         [options.preserveState = false]           - Preserve the expanded state.
   */
  toggle({
    force = !this.isInitialized,
    emit = this.isInitialized,
    transition = this.isInitialized,
    preserveState = false,
  } = {}) {
    if (this.isExpanded) {
      this.collapse({ force, emit, transition, preserveState });
    } else {
      this.expand({ force, emit, transition, preserveState });
    }
  }

  /**
   * Locks the component.
   *
   * @param {Object<boolean>} [options = {}]                        - Options for locking the component.
   * @param {boolean}         [options.force = !this.isInitialized] - Force the lock action.
   * @param {boolean}         [options.emit = this.isInitialized]   - Emit the lock events.
   * @param {boolean}         [options.preserveState = false]       - Preserve the locked state.
   */
  lock({
    force = !this.isInitialized,
    emit = this.isInitialized,
    preserveState = false,
  } = {}) {
    // Only lock if the component is unlocked.
    if (this.isLocked && !force) return;

    this._locked.value = true;
    this._lock({ emit });

    if (!preserveState) {
      // Commit the locked state.
      this._locked.commit();
    }
  }

  /**
   * Unlocks the component.
   *
   * @param {Object<boolean>} [options = {}]                        - Options for unlocking the component.
   * @param {boolean}         [options.force = !this.isInitialized] - Force the unlock action.
   * @param {boolean}         [options.emit = this.isInitialized]   - Emit the unlock event.
   * @param {boolean}         [options.preserveState = false]       - Preserve the unlocked state.
   */
  unlock({
    force = !this.isInitialized,
    emit = this.isInitialized,
    preserveState = false,
  } = {}) {
    // Only unlock if the component is locked.
    if (!this.isLocked && !force) return;

    this._locked.value = false;
    this._unlock({ emit });

    if (!preserveState) {
      // Commit the locked state.
      this._locked.commit();
    }
  }

  /**
   * Toggles locking and unlocking the component.
   *
   * @param {Object<boolean>} [options = {}]                        - Options for locking/unlocking the component.
   * @param {boolean}         [options.force = !this.isInitialized] - Force the toggle action.
   * @param {boolean}         [options.emit = this.isInitialized]   - Emit the lock/unlock events.
   * @param {boolean}         [options.preserveState = false]       - Preserve the locked state.
   */
  toggleLock({
    force = !this.isInitialized,
    emit = this.isInitialized,
    preserveState = false,
  } = {}) {
    if (this.isLocked) {
      this.unlock({ force, emit, preserveState });
    } else {
      this.lock({ force, emit, preserveState });
    }
  }
}

export default CollapsibleComponent;
