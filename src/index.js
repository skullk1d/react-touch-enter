import React from 'react';
import { render } from 'react-dom';

import DemoBox from './components/DemoBox';

// Imports the stylesheet and applies the styles to any React component with a corresponding className
import './stylesheets/global.scss';

render(
	// material-ui wraps redux wraps react
	<div className="demoContainer">
		<DemoBox />
		<DemoBox />
	</div>,
	document.getElementById('content')
);
