/**
 * @file
 * A generic component class that provides revealable/concealable functionality.
 */

import ResponsiveComponent from "./ResponsiveComponent.js";
import TransactionalValue from "./TransactionalValue.js";

/**
 * A generic revealable/concealable component class.
 *
 * @abstract
 *
 * @extends ResponsiveComponent
 */
class ConcealableComponent extends ResponsiveComponent {
  /**
   * The component name of the component.
   *
   * @protected
   *
   * @type {string}
   */
  _name = "ConcealableComponent";

  /**
   * A callback for media query list events.
   *
   * @protected
   *
   * @type {Function}
   *
   * @param {MediaQueryListEvent} event - The event.
   */
  _mediaQueryListEventCallback = (event) => {
    if (event.matches) {
      if (this.unlockInsideBreakpoint) {
        this.unlock();
      }

      if (this.isRevealed && this.concealInsideBreakpoint) {
        if (this.isLocked) {
          this.unlock();
        }
        this.conceal({ preserveState: true });
      } else if (!this.isRevealed && this.revealInsideBreakpoint) {
        if (this.isLocked) {
          this.unlock();
        }
        this.reveal();
      }

      if (this.lockInsideBreakpoint) {
        this.lock();
      }
    } else {
      if (this.unlockOutsideBreakpoint) {
        this.unlock();
      }

      if (this.isRevealed && this.concealOutsideBreakpoint) {
        if (this.isLocked) {
          this.unlock();
        }
        this.conceal({ preserveState: true });
      } else if (!this.isRevealed && this.revealOutsideBreakpoint) {
        if (this.isLocked) {
          this.unlock();
        }
        this.reveal();
      }

      if (this.lockOutsideBreakpoint) {
        this.lock();
      }
    }
  };

  /**
   * Whether the component is revealed or concealed.
   *
   * @protected
   *
   * @type {TransactionalValue<boolean>}
   */
  _revealed = new TransactionalValue(false);

  /**
   * Whether the component is locked or unlocked.
   *
   * @protected
   *
   * @type {TransactionalValue<boolean>}
   */
  _locked = new TransactionalValue(false);

  /**
   * Whether the component should reveal inside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _revealInsideBreakpoint = false;

  /**
   * Whether the component should reveal outside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _revealOutsideBreakpoint = false;

  /**
   * Whether the component should conceal inside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _concealInsideBreakpoint = false;

  /**
   * Whether the component should conceal outside the breakpoint.
   *
   * @protected
   *
   * @type {boolean}
   */
  _concealOutsideBreakpoint = false;

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
   * Whether the component should reveal on focus.
   *
   * @protected
   *
   * @type {boolean}
   */
  _revealOnFocus = false;

  /**
   * Whether the component should conceal on blur.
   *
   * @protected
   *
   * @type {boolean}
   */
  _concealOnBlur = false;

  constructor({
    lockClass = "locked",
    unlockClass = "unlocked",
    revealClass = "show",
    concealClass = "hide",
    transitionClass = "transitioning",
    transitionDelay = 250,
    transitionDuration = 150,
    showDuration = -1,
    hideDuration = -1,
    revealOnFocus = false,
    concealOnBlur = false,
    revealInsideBreakpoint = false,
    revealOutsideBreakpoint = false,
    concealInsideBreakpoint = false,
    concealOutsideBreakpoint = false,
    lockInsideBreakpoint = false,
    lockOutsideBreakpoint = false,
    unlockInsideBreakpoint = false,
    unlockOutsideBreakpoint = false,
    locked = false,
    prefix = "ae-",
    key = null,
    initializeClass = "initializing",
    bootstrap = true,
  } = {}) {
    super({
      prefix,
      key,
      initializeClass,
      bootstrap,
    });
  }

  /**
   * The class(es) to apply when the component is locked.
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
   * The class(es) to apply when the component is unlocked.
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
   * The class(es) to apply when the component is revealed.
   *
   * @type {string|string[]}
   *
   * @see _classes.reveal
   */
  get revealClass() {
    return this._classes.reveal;
  }

  set revealClass(value) {
    isValidClassList({ revealClass: value });

    if (this._classes.reveal !== value) {
      this._classes.reveal = value;
    }
  }

  /**
   * The class(es) to apply when the component is concealed.
   *
   * @type {string|string[]}
   *
   * @see _classes.conceal
   */
  get concealClass() {
    return this._classes.conceal;
  }

  set concealClass(value) {
    isValidClassList({ concealClass: value });

    if (this._classes.conceal !== value) {
      this._classes.conceal = value;
    }
  }

  /**
   * The class(es) to apply when the component is transitioning between revealed and concealed.
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
   * The duration time (in milliseconds) for the transition between revealed and concealed states.
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
   * The duration time (in milliseconds) for the transition from concealed to reveal states.
   *
   * If revealDuration is set to -1, the transitionDuration value will be used instead.
   *
   * Setting this value will also set the --ae-reveal-transition-duration CSS custom property on the component.
   *
   * @type {number}
   *
   * @see _durations.reveal
   */
  get revealDuration() {
    if (this._durations.reveal === -1) return this.transitionDuration;

    return this._durations.reveal;
  }

  set revealDuration(value) {
    isValidType("number", { revealDuration: value });

    if (this._durations.reveal !== value) {
      this._durations.reveal = value;
      this._setCustomProps();
    }
  }

  /**
   * The duration time (in milliseconds) for the transition from revealed to concealed states.
   *
   * If concealDuration is set to -1, the transitionDuration value will be used instead.
   *
   * Setting this value will also set the --ae-conceal-transition-duration CSS custom property on the component.
   *
   * @type {number}
   *
   * @see _durations.conceal
   */
  get concealDuration() {
    if (this._durations.conceal === -1) return this.transitionDuration;

    return this._durations.conceal;
  }

  set concealDuration(value) {
    isValidType("number", { concealDuration: value });

    if (this._durations.conceal !== value) {
      this._durations.conceal = value;
      this._setCustomProps();
    }
  }

  /**
   * Whether to reveal the component when it gains focus in the DOM.
   *
   * @type {boolean}
   *
   * @see _revealOnFocus
   */
  get revealOnFocus() {
    return this._revealOnFocus;
  }

  set revealOnFocus(value) {
    isValidType("boolean", { revealOnFocus: value });

    if (this._revealOnFocus !== value) {
      this._revealOnFocus = value;
    }
  }

  /**
   * Whether to conceal the component when it loses focus in the DOM.
   *
   * @type {boolean}
   *
   * @see _concealOnBlur
   */
  get concealOnBlur() {
    return this._concealOnBlur;
  }

  set concealOnBlur(value) {
    isValidType("boolean", { concealOnBlur: value });

    if (this._concealOnBlur !== value) {
      this._concealOnBlur = value;
    }
  }

  /**
   * The reveal state of the component.
   *
   * @readonly
   *
   * @type {boolean}
   *
   * @see _reveal
   */
  get isRevealed() {
    return this._reveal.value;
  }

  /**
   * The committed reveal state of the component.
   *
   * @readonly
   *
   * @type {boolean}
   *
   * @see _reveal
   */
  get shouldBeRevealed() {
    return this._reveal.committed;
  }

  /**
   * A flag to reveal the component when inside the breakpoint.
   *
   * @type {boolean}
   *
   * @see _revealInsideBreakpoint
   */
  get revealInsideBreakpoint() {
    return this._revealInsideBreakpoint;
  }

  set revealInsideBreakpoint(value) {
    isValidType("boolean", { revealInsideBreakpoint: value });

    if (this._revealInsideBreakpoint !== value) {
      this._revealInsideBreakpoint = value;
    }
  }

  /**
   * A flag to reveal the component when outside the breakpoint.
   *
   * @type {boolean}
   *
   * @see _revealOutsideBreakpoint
   */
  get revealOutsideBreakpoint() {
    return this._revealOutsideBreakpoint;
  }

  set revealOutsideBreakpoint(value) {
    isValidType("boolean", { revealOutsideBreakpoint: value });

    if (this._revealOutsideBreakpoint !== value) {
      this._revealOutsideBreakpoint = value;
    }
  }

  /**
   * A flag to conceal the component when inside the breakpoint.
   *
   * @type {boolean}
   *
   * @see _concealInsideBreakpoint
   */
  get concealInsideBreakpoint() {
    return this._concealInsideBreakpoint;
  }

  set concealInsideBreakpoint(value) {
    isValidType("boolean", { concealInsideBreakpoint: value });

    if (this._concealInsideBreakpoint !== value) {
      this._concealInsideBreakpoint = value;
    }
  }

  /**
   * A flag to conceal the component when outside the breakpoint.
   *
   * @type {boolean}
   *
   * @see _concealOutsideBreakpoint
   */
  get concealOutsideBreakpoint() {
    return this._concealOutsideBreakpoint;
  }

  set concealOutsideBreakpoint(value) {
    isValidType("boolean", { concealOutsideBreakpoint: value });

    if (this._concealOutsideBreakpoint !== value) {
      this._concealOutsideBreakpoint = value;
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
}

export default ConcealableComponent;
