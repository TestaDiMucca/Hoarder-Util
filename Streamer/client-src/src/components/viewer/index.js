import { Component } from 'preact';
import { SERVER } from '../../helpers/constants';
import style from './style';

export default class ShowCard extends Component {
    render() {
        const { onClose, show, filename } = this.props;
        const isFirefox = typeof InstallTrigger !== 'undefined';
        const addQuery = isFirefox ? '?browser=firefox' : '';
        const url = `${ SERVER }/player/${ encodeURIComponent(show) }/${ encodeURIComponent(filename) }` + addQuery;
        return (
            <div class={style.viewer}>
                <div onClick={onClose} class={style.closeButton}>×</div>
                {show} {filename}
                <video class={style.viewerVideo} src={url} controls type={isFirefox ? 'video/webm' : 'video/mp4'} />
            </div>
        );
    }
}