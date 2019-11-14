import { h, Component } from 'preact';
import Card from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';
import style from './style';

export default class BugReport extends Component {
    render() {
        return (
            <Card class={`${style.bugs} page`}>
                <div>
                    You can fix if you want
                </div>
            </Card>
        );
    }
}
