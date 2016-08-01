import React from 'react';
import touchHandler from './handlers/TouchHandler';
import Events from '../enums/eventEnum';

import '../stylesheets/components/Tappable.scss';

// all taps/clicks for elements should go through here
class Tappable extends React.Component {
	constructor(props) {
		super(props);

		this.onTapHandler = this.onTap.bind(this);
		this.onTappedHandler = this.onTapped.bind(this);
		this.onTouchHoldHandler = this.onTouchHold.bind(this);
		this.onTouchReleaseHandler = this.onTouchRelease.bind(this);
		this.onTouchEnterHandler = this.onTouchEnter.bind(this);
		this.onTouchLeaveHandler = this.onTouchLeave.bind(this);

		this.state = {
			currentEvent: '',
			id: `tappable${new Date().getTime()}`
		};
	}

	addEvents() {
		touchHandler.on(Events.TAP, this.onTapHandler);
		touchHandler.on(Events.TAPPED, this.onTappedHandler);
		touchHandler.on(Events.TOUCH_HOLD, this.onTouchHoldHandler);
		touchHandler.on(Events.TOUCH_RELEASE, this.onTouchReleaseHandler);
		touchHandler.on(Events.TOUCH_ENTER, this.onTouchEnterHandler);
		touchHandler.on(Events.TOUCH_LEAVE, this.onTouchLeaveHandler);
	}

	removeEvents() {
		touchHandler.removeListener(Events.TAP, this.onTapHandler);
		touchHandler.removeListener(Events.TAPPED, this.onTappedHandler);
		touchHandler.removeListener(Events.TOUCH_HOLD, this.onTouchHoldHandler);
		touchHandler.removeListener(Events.TOUCH_RELEASE, this.onTouchReleaseHandler);
		touchHandler.removeListener(Events.TOUCH_ENTER, this.onTouchEnterHandler);
		touchHandler.removeListener(Events.TOUCH_LEAVE, this.onTouchLeaveHandler);
	}

	onTap(params = {}) {
		if (params.target.id !== this.refs.domNode.id) {
			return;
		}

		this.setCurrentEvent(Events.TAP, () => {
			if (this.props.onTap) {
				return this.props.onTap(params);
			}
		});
	}

	onTapped(params = {}) {
		if (params.target.id !== this.refs.domNode.id) {
			return;
		}

		this.setCurrentEvent(Events.TAPPED, () => {
			if (this.props.onTapped) {
				return this.props.onTapped(params);
			}
		});
	}

	onTouchHold(params = {}) {
		if (params.target.id !== this.refs.domNode.id) {
			return;
		}

		this.setCurrentEvent(Events.TOUCH_HOLD, () => {
			if (this.props.onTouchHold) {
				return this.props.onTouchHold(params);
			}
		});
	}

	onTouchRelease(params = {}) {
		if (params.target.id !== this.refs.domNode.id) {
			return;
		}

		this.setCurrentEvent(Events.TOUCH_RELEASE, () => {
			if (this.props.onTouchRelease) {
				return this.props.onTouchRelease(params);
			}
		});
	}

	onTouchEnter(params = {}) {
		if (params.target.id !== this.refs.domNode.id) {
			return;
		}

		this.setCurrentEvent(Events.TOUCH_ENTER, () => {
			if (this.props.onTouchEnter) {
				return this.props.onTouchEnter(params);
			}
		});
	}

	onTouchLeave(params = {}) {
		if (params.target.id !== this.refs.domNode.id) {
			return;
		}

		this.setCurrentEvent(Events.TOUCH_LEAVE, () => {
			if (this.props.onTouchLeave) {
				return this.props.onTouchLeave(params);
			}
		});
	}

	setCurrentEvent(currentEvent, callback = () => {}) {
		// for easy styling of Tappables for each event
		this.setState({
			currentEvent: currentEvent
		}, callback);
	}

	componentDidMount() {
		// register dom element with tap handler
		touchHandler.registerElement({
			element: this.refs.domNode,
			container: this.props.container,
			propagateChildren: this.props.propagateChildren
		},
		!this.props.disabled);

		this.addEvents();
	}

	componentWillUnmount() {
		this.removeEvents();
		touchHandler.unregisterElement(this.refs.domNode.id);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.hasOwnProperty('disabled')) {
			touchHandler.enable(this.refs.domNode.id, !nextProps.disabled);
		}

		if (nextProps.hasOwnProperty('container')) {
			touchHandler.registerContainer(this.state.id, nextProps.container);
		}
	}

	render() {
		const className = `${this.props.className || ''} ${this.props.disabled ? 'disabled' : ''}`;

		return (
			<div
				id={this.state.id}
				className={`Tappable ${className} ${this.state.currentEvent}`}
				ref="domNode"
				style={this.props.style}
				onTouchStart={touchHandler.onTouchStart.bind(touchHandler)}
				onTouchEnd={touchHandler.onTouchEnd.bind(touchHandler)}
			>
				{this.props.children}
			</div>
		);
	}
}

Tappable.propTypes = {
	onTap: React.PropTypes.func,
	onTapped: React.PropTypes.func,
	onTouchHold: React.PropTypes.func,
	onTouchRelease: React.PropTypes.func,
	onTouchEnter: React.PropTypes.func,
	onTouchLeave: React.PropTypes.func,
	className: React.PropTypes.string,
	style: React.PropTypes.object,
	propagateChildren: React.PropTypes.bool,
	container: React.PropTypes.object,
	disabled: React.PropTypes.bool,
	children: React.PropTypes.node
};

export default Tappable;
