import { Component } from 'preact';
import {
    Card,
    Radio,
    FormField,
    Button,
    TextField
} from 'preact-material-components';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Checkbox/style.css';
import 'preact-material-components/TextField/style.css';
import 'preact-material-components/Button/style.css';
import 'preact-material-components/FormField/style.css';
import 'preact-material-components/List/style.css';
import style from './style';

import Dialog from '../../components/dialog';
import UploadService from '../../services/UploadService';

const loader = require('../../img/loader.svg');

const CONVERT_OPTIONS = {
    MP4: 'mp4',
    NONE: null,
    WEBM: 'webm'
}

export default class Upload extends Component {
    state = {
        season: 0,
        show: '',
        showingProgress: false,
        progress: 0,
        progressText: '',
        bannerFilename: '',
        selectedFilenames: [],
        convert: null,
        nullDisabled: false
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

        if (keys.filter(k => k.indexOf('mkv') !== -1).length > 0) {
            this.setState({ convert: CONVERT_OPTIONS.WEBM, nullDisabled: true });
        } else {
            this.setState({ nullDisabled: false });
        }
    };

    handleUpload = () => {
        const { season, show } = this.state;
        UploadService.newJob(season, show, this.bannerFile, this.mediaFiles)
            .onProgress(this.updateStatus)
            .upload(this.state.convert)
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
        const { convert } = this.state;
        return (
            <div class={`${style.home} page`}>
                {this.state.showingProgress && (
                    <Dialog>
                        <section class={style.uploadPop}>
                            Uploading..
                            <img src={loader} />
                            <span class={style.loaderInfo}>{this.state.progressText}<br /><b>{this.state.progress}{typeof this.state.progress === 'number' ? '%' : ''}</b></span>
                            <Button raised ripple class={style.cardButton} onClick={this.handleCancel}>Cancel</Button>
                        </section>
                    </Dialog>
                    // <section>
                    //     <Card class={style.progressCard}>
                    //         Uploading..
                    //         <img src={loader} />
                    //         <span class={style.loaderInfo}>{this.state.progressText}<br /><b>{this.state.progress}{typeof this.state.progress === 'number' ? '%' : ''}</b></span>
                    //         <Button raised ripple class={style.cardButton} onClick={this.handleCancel}>Cancel</Button>
                    //     </Card>
                    //     <div class={style.backing}>

                    //     </div>
                    // </section>
                    
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
                                helperText="Media files in mp4 or mkv"
                                accept="video/mp4, video/m4v, video/*,.mkv"
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
                        <section className="mdc-text-field mdc-text-field--upgraded mdc-ripple-upgraded">
                            <FormField class={style.radio}>
                                <Radio
                                    id="radio-1"
                                    name="Controlled Options"
                                    checked={!convert}
                                    onClick={() => this.setState({ convert: null })}
                                    disabled={this.state.nullDisabled}
                                />
                                <label for="radio-1">No Conversion</label>
                            </FormField>
                            <FormField class={style.radio}>
                                <Radio
                                    checked={convert === CONVERT_OPTIONS.MP4}
                                    id="radio-2"
                                    name="Controlled Options"
                                    onClick={() => this.setState({ convert: CONVERT_OPTIONS.MP4 })}
                                />
                                <label for="radio-2">MP4</label>
                            </FormField>
                            <FormField class={style.radio}>
                                <Radio
                                    id="radio-3"
                                    name="Controlled Options"
                                    checked={convert === CONVERT_OPTIONS.WEBM}
                                    onClick={() => this.setState({ convert: CONVERT_OPTIONS.WEBM })}
                                />
                                <label for="radio-3">WEBM</label>
                            </FormField>
                        </section>
                        <Button raised ripple class={style.cardButton} onClick={this.handleUpload}>Upload</Button>
                    </Card>
                </section>
                
            </div>
        );
    }
}
