import React from 'react';
import touchHandler from './handlers/TouchHandler';
import Events from '../enums/eventEnum';

import '../stylesheets/components/Tappable.scss';

// all taps/clicks for elements should go through here
class Tappable extends React.Component {
	constructor(props) {
		super(props);

		touchHandler.on(Events.TAP, this.onTap.bind(this));
		touchHandler.on(Events.TAPPED, this.onTapped.bind(this));
		touchHandler.on(Events.TOUCH_HOLD, this.onTouchHold.bind(this));
		touchHandler.on(Events.TOUCH_RELEASE, this.onTouchRelease.bind(this));
		touchHandler.on(Events.TOUCH_ENTER, this.onTouchEnter.bind(this));
		touchHandler.on(Events.TOUCH_LEAVE, this.onTouchLeave.bind(this));

		this.state = {
			currentEvent: '',
			id: `tappable${new Date().getTime()}`
		};
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
		touchHandler.registerElement(this.refs.domNode, this.props.propagateChildren, !this.props.disabled);
	}

	componentWillUnmount() {
		touchHandler.unregisterElement(this.refs.domNode.id);
	}

	componentWillReceiveProps(nextProps) {
		touchHandler.enable(this.refs.domNode.id, !nextProps.disabled);
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
				onTouchMove={touchHandler.onTouchMove.bind(touchHandler)}
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
