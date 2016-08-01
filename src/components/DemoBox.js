import React from 'react';
import Tappable from './Tappable';

import '../stylesheets/components/DemoBox.scss';

// example of a React component using Tappable
class DemoBox extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			message: 'Touch me!'
		};
	}

	onTapped() {
		this.setState({
			message: 'Tapped'
		});
	}

	onTouchHold() {
		this.setState({
			message: 'Touch hold'
		});
	}

	onTouchRelease() {
		this.setState({
			message: 'Touch release'
		});
	}

	onTouchEnter() {
		this.setState({
			message: 'Touch enter'
		});
	}

	onTouchLeave() {
		this.setState({
			message: 'Touch leave'
		});
	}

	render() {
		return (
			<Tappable
				className={'DemoBox'}
				onTapped={this.onTapped.bind(this)}
				onTouchHold={this.onTouchHold.bind(this)}
				onTouchRelease={this.onTouchRelease.bind(this)}
				onTouchEnter={this.onTouchEnter.bind(this)}
				onTouchLeave={this.onTouchLeave.bind(this)}
				container={this.props.container}
			>
				<div className="label">{this.state.message}</div>
			</Tappable>
		);
	}
}

DemoBox.propTypes = {
	container: React.PropTypes.object
};

export default DemoBox;
