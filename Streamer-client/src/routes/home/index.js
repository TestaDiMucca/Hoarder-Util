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
			this.setState({ shows: res.data });
		}).catch(err => console.log(err));
	}

	componentDidMount () {
		const eles = document.querySelectorAll('#home');
		const arrOf = [...eles];
		if (arrOf.length > 1) {
			arrOf.shift();
			arrOf.forEach(e => e.remove());
		}
	}

	render() {
		const { shows } = this.state;
		return (
			<div class={`${style.home} page`} id="home">
				<header class={style.titleHeader}>
					<h1>Agua <span class={style.plus}>Plus</span></h1>
					<p>The most useless weeb streamer known to Belzerg.</p>
				</header>
				<section class={style.showsList}>
					{shows.map(show => (
						<ShowCard name={show.filePath} />
					))}
				</section>
			</div>
		);
	}
}
