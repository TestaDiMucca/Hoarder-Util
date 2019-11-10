import { Component } from 'preact';
import { route } from 'preact-router';
import axios from 'axios';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Button/style.css';
import style from './style';

import { SERVER } from '../../helpers/constants';

export default class Home extends Component {
	state = {
		shows: []
	};

	componentWillMount () {
		axios.get(`${SERVER}/library`).then(res => {
			console.log('data', res.data);
		}).catch(err => console.log(err));
	}

	gotoShow = (show) => {
		route(`/show/${show}`);
	};

	render() {
		return (
			<div class={`${style.home} page`}>
				<h1>Vlablalbla</h1>
				<h1 onClick={this.gotoShow}>Home route</h1>
			</div>
		);
	}
}
