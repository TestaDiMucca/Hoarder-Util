import { Component } from 'preact';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Button/style.css';
import style from './style';

export default class Show extends Component {
    state = {
        episodes: []
    };

    render({ show }) {
        return (
            <div class={`${style.home} page`}>
                <h1>{ show }</h1>
                <h1>SHOW</h1>
            </div>
        );
    }
}
