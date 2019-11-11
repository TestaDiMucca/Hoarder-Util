import { Component } from 'preact';
import axios from 'axios';
import Card from 'preact-material-components/Card';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Button/style.css';
import style from './style';

import Viewer from '../../components/viewer';
import { SERVER } from '../../helpers/constants';
import { isFirefox } from '../../helpers/helpers';

/**
 * @typedef Episode
 * @property {string} file
 * @property {string} season
 * @property {string} [watched=]
 */
export default class Show extends Component {
    state = {
        episodes: {},
        viewerOpen: false,
        selectedFile: null,
        showWarning: null
    };

    componentWillMount () {
        axios.get(`${SERVER}/library/${this.props.show}`).then(res => {
            if (isFirefox()) this.detectMp4(res.data);
            this.setState({ episodes: this.processSeasons(res.data) });
        }).catch(err => console.log(err));
    }

    /**
     * @param {Episode[]} data
     */
    detectMp4 = (data) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].file.indexOf('mp4') !== -1 || data[i].file.indexOf('m4v') !== -1) {
                this.setState({ showWarning: 'These files are mp4s which are not supported by Firefox. The server will live transcode to webm, so seeking will be disabled and more time is needed to buffer.' });
                return true;
            }
        }
        return false;
    };

    /**
     * @param {Episode[]} data 
     */
    processSeasons (data) {
        return data.reduce((acc, item) => ((acc[item['season']] = [...(acc[item['season']] || []), item]), acc), {});
    }

    /**
     * @param {Episode} selectedFile
     */
    launchViewer = (selectedFile) => {
        selectedFile = selectedFile.season === this.props.show ? selectedFile.file : `${selectedFile.season}/${selectedFile.file}`;
        this.setState({
            selectedFile,
            viewerOpen: true
        })
    }

    closeViewer = () => {
        this.setState({
            selectedFile: null,
            viewerOpen: false
        })
    }

    clearWarning = () => {
        this.setState({ showWarning: null });
    }

    render({ show }) {
        const { episodes, viewerOpen, selectedFile, showWarning } = this.state;
        return (
            <div class={`${style.home} page`}>
                <header class={style.headerTitle}>
                    <img src={`${SERVER}/thumb/${show}`} class={style.showImage} />
                    <h1 class={style.titleText}>{show}</h1>
                </header>
                {showWarning &&
                    <Card class={style.warningCard}>
                        <p>{showWarning}</p>
                        <Button raised ripple class={style.cardButton} onClick={this.clearWarning}>Dismiss</Button>
                    </Card>
                }
                <section class={style.episodeList}>
                    {Object.keys(episodes).map(seasonSet => (
                        <div class={style.seasonSet}>
                            <h2>{seasonSet !== show ? seasonSet : 'No Season'}</h2>
                            {episodes[seasonSet].map(episode => (
                                <div class={style.episode} onClick={() => this.launchViewer(episode)}>
                                    {episode.file}
                                </div>
                            ))}
                        </div>
                    ))}
                </section>

                {viewerOpen && (
                    <Viewer
                        show={show}
                        filename={selectedFile}
                        onClose={this.closeViewer}
                    />
                )}
            </div>
        );
    }
}
