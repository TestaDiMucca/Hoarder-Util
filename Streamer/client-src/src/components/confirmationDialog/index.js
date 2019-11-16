import { Component } from 'preact';
import Dialog from '../dialog';
import {
    Button
} from 'preact-material-components';
import 'preact-material-components/Button/style.css';
import style from './style';

export default class ConfirmationDialog extends Component {
    render() {
        const { onConfirm, onReject, text } = this.props;
        return (
            <Dialog>
                <div>
                    <p>{text}</p>
                    <Button raised ripple class={style.cardButton} onClick={onConfirm}>Confirm</Button>
                    <Button raised ripple class={style.cardButton} onClick={onReject}>Cancel</Button>
                </div>
            </Dialog>
        );
    }
}