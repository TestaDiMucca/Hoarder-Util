import { Component } from 'preact';
import { Card, Checkbox, Button, TextField } from 'preact-material-components';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Checkbox/style.css';
import 'preact-material-components/TextField/style.css';
import 'preact-material-components/Button/style.css';
import style from './style';

import UploadService from '../../services/UploadService';

const loader = require('../../img/loader.svg');

export default class Upload extends Component {
    state = {
        season: 0,
        show: '',
        showingProgress: false,
        progress: 0,
        progressText: '',
        bannerFilename: '',
        selectedFilenames: []
    };

    bannerFile = null;
    mediaFiles = null;

    /**
     * @param {FileList} files
     */
    handleBannerChange = (files) => {
        this.bannerFile = files;
        this.setState({ bannerFilename: files ? files[0].name : null });
    };

    /**
     * @param {FileList} files
     */
    handleFiles = (files) => {
        this.mediaFiles = files;
        const keys = files ? Object.keys(files).map(f => files[f].name) : [];
        this.setState({ selectedFilenames: keys });
    };

    handleUpload = () => {
        const { season, show } = this.state;
        UploadService.newJob(season, show, this.bannerFile, this.mediaFiles)
            .onProgress(this.updateStatus)
            .upload()
            .then(this.doneUpload);
        this.setState({ showingProgress: true });
    };

    doneUpload = () => {
        this.setState({ showingProgress: false });
    };

    updateStatus = (progressText, progress) => {
        this.setState({ progress, progressText });
    };

    handleCancel = () => {
        const actually = window.confirm('Really cancel?');

        if (actually) {
            this.doneUpload();
            UploadService.cancel(true);
        }
    }

    render() {
        return (
            <div class={`${style.home} page`}>
                {this.state.showingProgress && (
                    <section>
                        <Card class={style.progressCard}>
                            Uploading..
                            <img src={loader} />
                            <span class={style.loaderInfo}>{this.state.progressText}<br /><b>{this.state.progress}%</b></span>
                            <Button raised ripple class={style.cardButton} onClick={this.handleCancel}>Cancel</Button>
                        </Card>
                        <div class={style.backing}>

                        </div>
                    </section>
                    
                )}

                <section>
                    <Card class={style.uploadCard}>
                        <h1>Uploader</h1>
                        <p>You can upload mp4s and determine what show/season they belong to. Leave the season as 0 if it is not applicable.</p>
                        <p>By the generosity of the Axis Church you can upload a season at a time.</p>

                        <TextField
                            class={style.inputField}
                            label="Series/Content Title"
                            helperText="The name of the content you are uploading."
                            onInput={e => this.setState({ show: e.target.value })}
                            value={this.state.show}
                        />
                        <TextField
                            class={style.inputField}
                            label="Season"
                            type="number"
                            helperText="Non-number would be kinda weird, like 'Season Shinobu' "
                            min={0}
                            onInput={e => this.setState({ season: e.target.value.replace(/[^\d]+/g, '') })}
                            value={this.state.season}
                        />
                        
                        
                        <section className="mdc-text-field mdc-text-field--upgraded mdc-ripple-upgraded">
                            <TextField
                                type="file"
                                class={style.fileUpload}
                                helperText="Banner Image in Jpg"
                                accept="image/jpg, image/jpeg"
                                onChange={e => this.handleBannerChange(e.target.files)}
                                helperTextPersistent={true}
                            />
                            <div class={style.browseFile}>
                                Browse Files
                            </div>
                            {!!this.state.bannerFilename && this.state.bannerFilename !== '' && <ul>
                                <li>{this.state.bannerFilename}</li>
                            </ul>}
                            
                        </section>
                        <section className="mdc-text-field mdc-text-field--upgraded mdc-ripple-upgraded">
                            <TextField
                                type="file"
                                multiple
                                class={style.fileUpload}
                                helperText="Media files in mp4"
                                accept="video/mp4, video/m4v"
                                onChange={e => this.handleFiles(e.target.files)}
                                helperTextPersistent={true}
                            />
                            <div class={style.browseFile}>
                                Browse Files
                            </div>
                            <ul>
                                {this.state.selectedFilenames.map(n => <li>{n}</li>)}
                            </ul>
                        </section>
                        <Button raised ripple class={style.cardButton} onClick={this.handleUpload}>Upload</Button>
                    </Card>
                </section>
                
            </div>
        );
    }
}
