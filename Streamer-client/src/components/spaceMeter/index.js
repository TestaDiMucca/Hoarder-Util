import { Component } from 'preact';
import { SERVER } from '../../helpers/constants';
import axios from 'axios';

import style from './style';

export default class SpaceMeter extends Component {
    state = {
        used: 0,
        total: 0,
        percent: 0
    }

    componentDidMount () {
        this.getDiskData();
    }

    getDiskData = () => {
        axios.get(`${SERVER}/usage`).then(res => {
            const { available, total } = res.data;
            const percentUsed = Math.floor((total - available) / total * 100);
            const toGb = n => Math.floor(n / 1024 / 1024 / 1024);
            // console.log(toGb(available), toGb(total), percentUsed)
            this.setState({
                used: toGb(total - available),
                total: toGb(total),
                percent: percentUsed
            });
        });
    }

    render() {
        const { used, total, percent } = this.state;
        return (
            <section class={style.container}>
                <span class={style.label}>{`${used}GB/${total}GB`}</span>
                <span class={style.barContainer}>
                    <div class={style.front} style={{ width: `${4 * (percent / 100)}em` }}></div>
                    <div class={style.back}></div>
                </span>
                
            </section>
        );
    }
}