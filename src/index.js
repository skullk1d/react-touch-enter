import React from 'react';
import { render } from 'react-dom';

import Tappable from './components/Tappable';

// Imports the stylesheet and applies the styles to any React component with a corresponding className
import './stylesheets/global.scss';

render(
	// material-ui wraps redux wraps react
	<div className="demoContainer">
		<Tappable
			className="demoTap"
		/>
		<Tappable
			className="demoTap"
		/>
	</div>,
	document.getElementById('content')
);
