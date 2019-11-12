import { Component } from 'preact';
import { Card, Checkbox, Button, TextField } from 'preact-material-components';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Checkbox/style.css';
import 'preact-material-components/TextField/style.css';
import 'preact-material-components/Button/style.css';
import style from './style';

import UploadService from '../../services/UploadService';

export default class Upload extends Component {
    state = {
        season: 0,
        show: '',
        showingProgress: false,
        progress: 0,
        progressText: ''
    };

    bannerFile = null;
    mediaFiles = null;

    uploader = null;

    handleBannerChange = (file) => {
        this.bannerFile = file;
    }

    handleFiles = (files) => {
        this.mediaFiles = files;
    }

    handleUpload = () => {
        const { season, show } = this.state;
        UploadService.newJob(season, show, this.bannerFile, this.mediaFiles)
            .onProgress(this.updateStatus)
            .upload();
        // this.uploader = uploader;
    }

    updateStatus = (status, percent) => {
        console.log(status, percent + '%')
    };

    // componentWillUnmount () {
    //     if (this.uploader) this.uploader.cancel();
    // }

    render() {
        return (
            <div class={`${style.home} page`}>
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
                        <TextField
                            class={style.inputField}
                            type="file"
                            class={style.fileUpload}
                            helperText="Banner Image in Jpg"
                            accept="image/jpg, image/jpeg"
                            onChange={e => this.handleBannerChange(e.target.files)}
                            helperTextPersistent={true}
                        />
                        <TextField
                            class={style.inputField}
                            type="file"
                            multiple
                            class={style.fileUpload}
                            helperText="Media files in mp4"
                            accept="video/mp4"
                            onChange={e => this.handleFiles(e.target.files)}
                            helperTextPersistent={true}
                        />
                        <Button raised ripple class={style.cardButton} onClick={this.handleUpload}>Upload</Button>
                    </Card>
                </section>
                
            </div>
        );
    }
}
