import EventEmitter from 'events';
import Events from '../../enums/eventEnum';

const TOUCH_END_THRESHOLD = 60;
const TOUCH_HOLD_THRESHOLD = 250; // Determines how long the user must hold the touch in milliseconds
const BENCH_SCROLL_Y = 1; // how far we scrolled before no longer a "tap"

class TouchHandler extends EventEmitter {
	constructor() {
		super();

		this.t0 = 0;
		this.registeredElements = {};

		document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
		document.addEventListener('touchstart', this.setScrolls.bind(this), { passive: true });
		document.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
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

	static getEvent(e) {
		// detect and return native dom event
		// note: react synthetic event refs may no longer be available come time to use them
		if (e.persist) {
			e.persist();
		}

		return e.nativeEvent || e;
	}

	static isChild(parent, child) {
		let node = child.parentNode;

		while (node !== null) {
			if (node === parent) {
				return true;
			}
			node = node.parentNode;
		}

		return false;
	}

	static isOnTop(elementNode, point) {
		// touched elment is top node or child of top node
		const touchedNode = document.elementFromPoint(point.x, point.y);

		return touchedNode === elementNode || TouchHandler.isChild(elementNode, touchedNode);
	}

	static isTouchEntered(element, point) {
		return TouchHandler.elementContainsPoint(element.node, point, element.propagateChildren) &&
			TouchHandler.isOnTop(element.node, point);
	}

	getScroll(id) {
		// scroll y value of an elements overflowing parent
		return this.registeredElements[id].containerNode.scrollTop;
	}

	isScrolling(id) {
		// track y scroll from starting point
		return Math.abs(this.getScroll(id) - this.registeredElements[id].scrollY0) >= BENCH_SCROLL_Y;
	}

	onTouchStart(e) {
		const registeredElement = this.registeredElements[e.currentTarget.id];

		// touched element registered?
		if (!registeredElement || !registeredElement.enabled) {
			return;
		}

		// reset base values, emit initial tap
		registeredElement.t0 = new Date().getTime();
		registeredElement.currentEvent = Events.TAP;

		const event = TouchHandler.getEvent(e);
		const touchPosition = TouchHandler.getTouchPosition(e);

		this.emit(registeredElement.currentEvent, {
			event: event,
			touchPosition: touchPosition,
			target: registeredElement.node
		});

		this.checkTapHold(registeredElement, event, touchPosition);
	}

	onTouchEnd(e) {
		// process each element at point
		for (const id in this.registeredElements) {
			if (!this.registeredElements.hasOwnProperty(id)) {
				continue;
			}

			const elem = this.registeredElements[id];

			// touched element registered?
			// already finished interaction? (reset by tap released or touch leave)
			if (!elem.enabled || !elem.currentEvent) {
				continue;
			}

			// CANCEL TOUCH if
			// releasing finger on tapping quickly after scroll
			// there was a scroll
			const dT = new Date().getTime() - elem.t0;

			if (elem.currentEvent === Events.TAP && dT < TOUCH_END_THRESHOLD) {
				this.reset(elem.id);
				continue;
			}

			// TOUCHLEAVE if there was a scroll or left element
			// check scroll again, in case of scrollTo
			const touchPosition = TouchHandler.getTouchPosition(e);
			const touchEntered = TouchHandler.isTouchEntered(elem, touchPosition);

			if (this.isScrolling(id) || !touchEntered) {
				this.onTouchLeave(e, elem);
				continue;
			}

			// emit either a 'released' if long touching/touch entered, or 'tapped' if short touching
			const nextEvent = {
				[Events.TOUCH_ENTER]: Events.TOUCH_RELEASE,
				[Events.TOUCH_HOLD]: Events.TOUCH_RELEASE,
				[Events.TAP]: Events.TAPPED
			};

			elem.currentEvent = nextEvent[elem.currentEvent];

			const event = TouchHandler.getEvent(e);

			this.emit(elem.currentEvent, {
				event: event,
				touchPosition: touchPosition,
				target: elem.node
			});

			this.reset(elem.id);
		}
	}

	onTouchEnter(e, elem) {
		// pass along event but override target
		const event = TouchHandler.getEvent(e);
		const touchPosition = TouchHandler.getTouchPosition(e);

		elem.currentEvent = Events.TOUCH_ENTER;

		this.emit(elem.currentEvent, {
			event: event,
			touchPosition: touchPosition,
			target: elem.node
		});

		this.checkTapHold(elem, event, touchPosition);
	}

	onTouchLeave(e, elem) {
		// pass along event but override target
		const event = TouchHandler.getEvent(e);
		const touchPosition = TouchHandler.getTouchPosition(e);

		elem.currentEvent = Events.TOUCH_LEAVE;

		this.emit(elem.currentEvent, {
			event: event,
			touchPosition: touchPosition,
			target: elem.node
		});

		this.reset(elem.id);
	}

	onTouchMove(e) {
		// process each element at point
		for (const id in this.registeredElements) {
			if (!this.registeredElements.hasOwnProperty(id)) {
				continue;
			}

			const elem = this.registeredElements[id];

			// touched element registered?
			// if began touch inside this element, no need to check for a touchEnter or touchLeave
			if (!elem.enabled ||
				elem.currentEvent === Events.TAP ||
				(this.isScrolling(id) && !elem.currentEvent)
			) {
				continue;
			}

			// if scrolling, release touch while interacting or prevent touch if not interacting
			if (this.isScrolling(id) && elem.currentEvent) {
				this.onTouchLeave(e, elem);
				continue;
			}

			// check if React proxy event, otherwise directly pass native dom event
			const touchPosition = TouchHandler.getTouchPosition(e);
			const touchEntered = TouchHandler.isTouchEntered(elem, touchPosition);

			// emit a TOUCH_LEAVE if we've moved outside of the registered element, even if we've begun interacting
			if (elem.currentEvent && !touchEntered) {
				this.onTouchLeave(e, elem);
				continue;
			}

			// emit a TOUCH_ENTER if document touchmove entered into the registered element
			if (!elem.currentEvent && touchEntered) {
				this.onTouchEnter(e, elem);
				continue;
			}
		}
	}

	checkTapHold(registeredElement, event, touchPosition) {
		// begin check for long tap
		clearTimeout(registeredElement.timer);
		registeredElement.timer = setTimeout(() => {
			// no longer holding if started scrolling container or no longer on top
			if (this.isScrolling(registeredElement.id)) {
				return;
			}

			registeredElement.currentEvent = Events.TOUCH_HOLD; // The user has held the touch long enough
			this.emit(registeredElement.currentEvent, {
				event: event,
				touchPosition: touchPosition,
				target: registeredElement.node
			});
		}, TOUCH_HOLD_THRESHOLD);
	}

	setScrolls() {
		for (const id in this.registeredElements) {
			if (!this.registeredElements.hasOwnProperty(id)) {
				continue;
			}

			const elem = this.registeredElements[id];

			// begin tracking for scroll threshold
			elem.scrollY0 = this.getScroll(id);
		}
	}

	registerElement(params, shouldEnable = true) {
		// expects a DOM node
		const element = params.element;
		const propagateChildren = params.propagateChildren;
		const container = params.container || window.document.documentElement;

		this.registeredElements[element.id] = {
			id: element.id, // html node unique id
			node: element, // html node
			containerNode: container, // overflowing parent (optional)
			scrollY0: container.scrollTop, // initial overflow Y
			timer: null, // event timer,
			t0: 0, // timer start
			propagateChildren: propagateChildren, // include child rects
			currentEvent: '', // event enum
			enabled: shouldEnable // emit events?
		};
	}

	unregisterElement(id) {
		delete this.registeredElements[id];
	}

	registerContainer(id, containerElement = window.document.documentElement) {
		this.registeredElements[id].containerNode = containerElement;
	}

	reset(id) {
		// only reset after interactions have ended (TOUCH_LEAVE, TOUCH_END)
		const registeredElement = this.registeredElements[id];

		// reset event status, clear event timer
		registeredElement.currentEvent = '';
		clearTimeout(registeredElement.timer);
	}

	enable(id, shouldEnable = true) {
		const registeredElement = this.registeredElements[id];

		registeredElement.enabled = shouldEnable;
	}
}

export default new TouchHandler();
