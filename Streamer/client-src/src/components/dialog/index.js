import { Component } from 'preact';
import {
    Card,
} from 'preact-material-components';
import 'preact-material-components/Card/style.css';
import style from './style';

export default class Dialog extends Component {
    render() {
        const { children } = this.props;
        return (
            <div>
                <Card class={style.showingCard}>
                    {children}
                </Card>
                <div class={style.backing}>

                </div>
            </div>
        );
    }
}