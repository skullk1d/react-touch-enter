import React from 'react';
import TouchHandler from './handlers/TouchHandler';
import Events from '../enums/eventEnum';

import '../stylesheets/components/Tappable.scss';

// all taps/clicks for elements should go through here
class Tappable extends React.Component {
	constructor(props) {
		super(props);

		const touchHandler = this.touchHandler = new TouchHandler(props.propagateChildren);

		touchHandler.on(Events.TAP, this.onTap.bind(this));
		touchHandler.on(Events.TAPPED, this.onTapped.bind(this));
		touchHandler.on(Events.TOUCH_HOLD, this.onTouchHold.bind(this));
		touchHandler.on(Events.TOUCH_RELEASE, this.onTouchRelease.bind(this));
		touchHandler.on(Events.TOUCH_ENTER, this.onTouchEnter.bind(this));
		touchHandler.on(Events.TOUCH_LEAVE, this.onTouchLeave.bind(this));

		this.state = {
			currentEvent: ''
		};
	}

	onTap(params = {}) {
		this.setCurrentEvent(Events.TAP, () => {
			if (this.props.onTap) {
				return this.props.onTap(params);
			}
		});
	}

	onTapped(params = {}) {
		this.setCurrentEvent(Events.TAPPED, () => {
			if (this.props.onTapped) {
				return this.props.onTapped(params);
			}
		});
	}

	onTouchHold(params = {}) {
		this.setCurrentEvent(Events.TOUCH_HOLD, () => {
			if (this.props.onTouchHold) {
				return this.props.onTouchHold(params);
			}
		});
	}

	onTouchRelease(params = {}) {
		this.setCurrentEvent(Events.TOUCH_RELEASE, () => {
			if (this.props.onTouchRelease) {
				return this.props.onTouchRelease(params);
			}
		});
	}

	onTouchEnter(params = {}) {
		this.setCurrentEvent(Events.TOUCH_ENTER, () => {
			if (this.props.onTouchEnter) {
				return this.props.onTouchEnter(params);
			}
		});
	}

	onTouchLeave(params = {}) {
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
		this.touchHandler.registerElement(this.refs.domNode);
	}

	componentWillUnmount() {
		this.touchHandler.unregisterElement();
	}

	componentWillMount() {
		this.touchHandler.enable(!this.props.disabled);
	}

	componentWillReceiveProps(nextProps) {
		this.touchHandler.enable(!nextProps.disabled);
	}

	render() {
		const touchHandler = this.touchHandler;
		const className = `${this.props.className || ''} ${this.props.disabled ? 'disabled' : ''}`;

		return (
			<div
				className={`Tappable ${className} ${this.state.currentEvent}`}
				ref="domNode"
				style={this.props.style}
				onTouchStart={touchHandler.onTouchStart.bind(touchHandler)}
				onTouchEnd={touchHandler.onTouchEnd.bind(touchHandler)}
				onTouchMove={touchHandler.onTouchMove.bind(touchHandler)}
				onMouseDown={touchHandler.onTouchStart.bind(touchHandler)}
				onMouseUp={touchHandler.onTouchEnd.bind(touchHandler)}
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
	disabled: React.PropTypes.bool,
	children: React.PropTypes.node
};

export default Tappable;
