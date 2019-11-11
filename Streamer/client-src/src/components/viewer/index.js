import { Component } from 'preact';
import { SERVER } from '../../helpers/constants';
import style from './style';
import axios from 'axios';

import { isFirefox } from '../../helpers/helpers';

export default class ShowCard extends Component {
    componentWillUnmount () {
        const { user, show, filename } = this.props;
        if (user && this.isViewedEnough()) {
            /* format for watchedlog is base show / season / filename. filename is season/filename already */
            /* use encode */
            const useName = `${show}/${filename}`;
            const url = `${SERVER}/watched/${encodeURIComponent(user)}/${encodeURIComponent(useName)}`;
            axios.post(url, {});
        }
    }

    /**
     * Determine if should mark viewed. In FF since it is live stream duration won't be accurate but ignore for now.
     */
    isViewedEnough () {
        const vidElement = document.querySelector('#video-player');
        if (!vidElement || !vidElement.currentTime || !vidElement.duration) return false;
        if (vidElement.currentTime / vidElement.duration > 0.5) return true;
        return false;
    }

    render() {
        const { onClose, show, filename } = this.props;
        const addQuery = isFirefox() ? '?browser=firefox' : '';
        const url = `${ SERVER }/player/${ encodeURIComponent(show) }/${ encodeURIComponent(filename) }` + addQuery;
        return (
            <div class={style.viewer}>
                <div onClick={onClose} class={style.closeButton}>×</div>
                {show} {filename}
                <video id="video-player" class={style.viewerVideo} src={url} controls type={isFirefox() ? 'video/webm' : 'video/mp4'} />
            </div>
        );
    }
}