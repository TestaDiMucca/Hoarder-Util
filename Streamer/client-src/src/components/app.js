import { Component } from 'preact';
import { Router } from 'preact-router';
import axios from 'axios';

import Header from './header';
import Home from '../routes/home';
import Profile from '../routes/profile';
import Show from '../routes/show';
import NotFound from '../routes/404';

import { DEFAULT_USER, SERVER } from '../helpers/constants';

export default class App extends Component {
	state = {
		currentUrl: null,
		user: null
	};

	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	handleRoute = e => {
		this.setState({
			currentUrl: e.url
		});
	};

	componentDidMount () {
		this.setUser(DEFAULT_USER);
	}

	/**
	 * 
	 */
	setUser = (user) => {
		this.setState({ user });
		axios.post(`${SERVER}/login/${user}`);
	};

	render() {
		return (
			<div id="app">
				<Header selectedRoute={this.state.currentUrl} />
				<Router onChange={this.handleRoute}>
					<Home path="/" />
					<Show path="/show/:show" />
					<Profile path="/profile/" user={this.state.user} prop="foo" />
					<Profile path="/profile/:user" />
					<NotFound default />
				</Router>
			</div>
		);
	}
}
