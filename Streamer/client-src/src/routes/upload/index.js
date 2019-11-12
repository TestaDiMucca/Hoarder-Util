import { Component } from 'preact';
import { Card, Checkbox, TextField } from 'preact-material-components';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Checkbox/style.css';
import 'preact-material-components/TextField/style.css';
import style from './style';

export default class Upload extends Component {
    state = {
        season: 0,
        show: ''
    };

    bannerFile = null;
    mediaFiles = null;

    handleBannerChange = (file) => {
        console.log(file)
    }

    handleFiles = (files) => {
        console.log(files)
    }

    render() {
        return (
            <div class={`${style.home} page`}>
                <section>
                    <Card class={style.uploadCard}>
                        <h1>Uploader</h1>
                        <p>You can upload mp4s and determine what show/season they belong to. Leave the season as 0 if it is not applicable.</p>

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
                    </Card>
                </section>
                
            </div>
        );
    }
}
