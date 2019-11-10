import { Component } from 'preact';
import { route } from 'preact-router';
import { SERVER } from '../../helpers/constants';
import style from './style';

export default class ShowCard extends Component {
    gotoShow = (show) => {
        route(`/show/${show}`);
    };

    render() {
        const { name } = this.props;
        return (
            <div onClick={() => this.gotoShow(name)} class={style['show-card']}>
                <img src={`${SERVER}/thumb/${name}`} class={style.showImage} />
                <h2 class={style.showTitle}>{name}</h2>
            </div>
        );
    }
}