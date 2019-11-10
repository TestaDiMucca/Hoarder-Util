import { Component } from 'preact';
import axios from 'axios';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Button/style.css';
import style from './style';

import ShowCard from '../../components/showCard';
import { SERVER } from '../../helpers/constants';

export default class Home extends Component {
	state = {
		shows: []
	};

	componentWillMount () {
		axios.get(`${SERVER}/library`).then(res => {
			console.log('data', res.data);
			this.setState({ shows: res.data });
		}).catch(err => console.log(err));
	}

	render() {
		const { shows } = this.state;
		return (
			<div class={`${style.home} page`}>
				<h1>Shows</h1>
				<section class={style.showsList}>
					{shows.map(show => (
						<ShowCard name={show.filePath} />
					))}
				</section>
			</div>
		);
	}
}
