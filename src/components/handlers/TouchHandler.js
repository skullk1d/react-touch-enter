import EventEmitter from 'events';
import Events from '../../enums/eventEnum';

const TOUCH_END_THRESHOLD = 60;
const TOUCH_HOLD_THRESHOLD = 250; // Determines how long the user must hold the touch in milliseconds
const BENCH_SCROLL_Y = 1; // how far we scrolled before no longer a "tap"

class TouchHandler extends EventEmitter {
	constructor(propagateChildren) {
		super();

		this.t0 = 0;
		this.timer = null;
		this.scrollY0 = TouchHandler.getScroll();
		this.registeredElement = null;
		this.currentEvent = ''; // nothing means no longer interacting with element
		this.propagateChildren = propagateChildren; // include space of children
		this.disabled = false; // prevent any events from firing
	}

	static getTouchPosition(e) {
		// get tap based on touch or mouse event
		return {
			x: e.clientX || e.changedTouches[0].clientX || 0,
			y: e.clientY || e.changedTouches[0].clientY || 0
		};
	}

	static elementContainsPoint(elem, point, propagateChildren) {
		// check if a point, usually a touch or click, lies within the client rect of an element
		const elemRect = elem.getBoundingClientRect();
		const rect = {
			top: elemRect.top,
			left: elemRect.left,
			right: elemRect.right,
			bottom: elemRect.bottom
		};

		// include total space of rects of children
		if (propagateChildren) {
			for (let i = 0; i < elem.childNodes.length; i += 1) {
				const node = elem.childNodes[i];

				if (!node.getBoundingClientRect) {
					continue;
				}

				const nodeRect = node.getBoundingClientRect();

				rect.top = Math.min(rect.top, nodeRect.top);
				rect.left = Math.min(rect.left, nodeRect.left);
				rect.bottom = Math.max(rect.bottom, nodeRect.bottom);
				rect.right = Math.max(rect.right, nodeRect.right);
			}
		}

		const containsX = Math.min(point.x, rect.left) === rect.left && Math.max(point.x, rect.right) === rect.right;
		const containsY = Math.min(point.y, rect.top) === rect.top && Math.max(point.y, rect.bottom) === rect.bottom;

		return containsX && containsY;
	}

	static getScroll() {
		// scroll y value of main react content wrapper
		return document.scrollTop;
	}

	isScrolling() {
		// track y scroll from starting point
		return Math.abs(TouchHandler.getScroll() - this.scrollY0) >= BENCH_SCROLL_Y;
	}

	getEvent(e) {
		// detect and return native dom event
		// note: react synthetic event refs may no longer be available come time to use them
		const event = e.nativeEvent ? Object.assign({}, e.nativeEvent) : e;

		return {
			...event,
			currentTarget: this.registeredElement // touch should target this element
		};
	}

	onTouchStart(e) {
		if (this.disabled) {
			return;
		}

		// reset base values, emit initial tap
		this.t0 = new Date().getTime();
		this.currentEvent = Events.TAP;

		const event = this.getEvent(e);
		const touchPosition = TouchHandler.getTouchPosition(e);

		this.emit(this.currentEvent, {
			event: event,
			touchPosition: touchPosition
		});

		this.checkTapHold(event, touchPosition);
	}

	onTouchEnd(e) {
		if (this.disabled) {
			return;
		}

		// already finished interaction (reset by tap released or touch leave)
		if (!this.currentEvent) {
			return;
		}

		// CANCEL TOUCH if
		// releasing finger on tapping quickly after scroll
		// there was a scroll
		const dT = new Date().getTime() - this.t0;

		if (this.currentEvent === Events.TAP && dT < TOUCH_END_THRESHOLD) {
			return this.reset();
		}

		// TOUCHLEAVE if there was a scroll or left element
		// check scroll again, in case of scrollTo
		const touchPosition = TouchHandler.getTouchPosition(e);
		const touchEntered = TouchHandler.elementContainsPoint(this.registeredElement, touchPosition, this.propagateChildren);

		if (this.isScrolling() || !touchEntered) {
			return this.onTouchLeave(e);
		}

		// emit either a 'released' if long touching/touch entered, or 'tapped' if short touching
		const nextEvent = {
			[Events.TOUCH_ENTER]: Events.TOUCH_RELEASE,
			[Events.TOUCH_HOLD]: Events.TOUCH_RELEASE,
			[Events.TAP]: Events.TAPPED
		};

		this.currentEvent = nextEvent[this.currentEvent];

		const event = this.getEvent(e);

		this.emit(this.currentEvent, {
			event: event,
			touchPosition: touchPosition
		});

		this.reset();
	}

	onTouchEnter(e) {
		if (this.disabled) {
			return;
		}

		this.currentEvent = Events.TOUCH_ENTER;

		// pass along event but override target
		const event = this.getEvent(e);
		const touchPosition = TouchHandler.getTouchPosition(e);

		this.emit(this.currentEvent, {
			event: event,
			touchPosition: touchPosition
		});

		this.checkTapHold(event, touchPosition);
	}

	onTouchLeave(e) {
		if (this.disabled) {
			return;
		}

		this.currentEvent = Events.TOUCH_LEAVE;

		// pass along event but override target
		const event = this.getEvent(e);
		const touchPosition = TouchHandler.getTouchPosition(e);

		this.emit(this.currentEvent, {
			event: event,
			touchPosition: touchPosition
		});

		this.reset();
	}

	onTouchMove(e) {
		if (this.disabled) {
			// no preventDefault -> chrome throws an error not allowing this on "passive" events
			return;
		}

		// if began touch inside this element, no need to check for a touchEnter or touchLeave
		if (this.currentEvent === Events.TAP) {
			return;
		}

		// if scrolling, release touch while interacting or prevent touch if not interacting
		if (this.isScrolling()) {
			if (this.currentEvent) {
				return this.onTouchLeave(e);
			}

			return;
		}

		// check if React proxy event, otherwise directly pass native dom event
		const touchPosition = TouchHandler.getTouchPosition(e);
		const touchEntered = TouchHandler.elementContainsPoint(this.registeredElement, touchPosition, this.propagateChildren);

		// emit a TOUCH_LEAVE if we've moved outside of the registered element, even if we've begun interacting
		if (this.currentEvent && !touchEntered) {
			return this.onTouchLeave(e);
		}

		// emit a TOUCH_ENTER if document touchmove entered into the registered element
		if (!this.currentEvent && touchEntered) {
			return this.onTouchEnter(e);
		}
	}

	checkTapHold(event, touchPosition) {
		// begin check for long tap
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			if (this.isScrolling()) {
				return;
			}

			this.currentEvent = Events.TOUCH_HOLD; // The user has held the touch long enough
			this.emit(this.currentEvent, {
				event: event,
				touchPosition: touchPosition
			});
		}, TOUCH_HOLD_THRESHOLD);
	}

	setScroll() {
		// begin tracking for scroll threshold
		this.scrollY0 = TouchHandler.getScroll();
	}

	registerElement(element) {
		// expects a DOM node
		this.registeredElement = element;

		document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
		document.addEventListener('touchstart', this.setScroll.bind(this), { passive: true });
		document.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
	}

	unregisterElement() {
		this.reset();

		document.removeEventListener('touchmove', this.onTouchMove.bind(this));
		document.removeEventListener('touchstart', this.setScroll.bind(this));
		document.removeEventListener('touchend', this.onTouchEnd.bind(this));
	}

	reset() {
		// only reset after interactions have ended (TOUCH_LEAVE, TOUCH_END)
		this.currentEvent = '';

		clearTimeout(this.timer);
	}

	enable(shouldEnable = true) {
		this.disabled = !shouldEnable;
	}
}

export default TouchHandler;
