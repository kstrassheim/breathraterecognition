import React, { Component } from 'react';
import { Api } from '../services/api'

export class RecordButton extends Component {

    constructor(props) {
        super(props);
        this.api = new Api();
        this.btnRecord_clicked = this.btnRecord_clicked.bind(this);
        this.state = { recordingId: 0 }
    }

    process(values) {
        if (this.state.recordingId > 0) {
            this.api.saveRecording(this.state.recordingId, values);
        }
    }


    async btnRecord_clicked() {
        if (this.state.recordingId) {
            // stop recording
            this.setState({ recordingId: 0 });
        }
        else {
            var recording = await this.api.getNewRecording();
            if (recording && recording.id > 0) {
                this.setState({ recordingId: recording.id });
            }
        }
    }

    render() {
        return (
            <input id="btnRecord" type="button" onClick={this.btnRecord_clicked} className="btn btn-outline-danger" value={(this.state.recordingId > 0 ? 'Stop' : 'Start')} />
        );
    }
}

export class PauseButton extends Component {

    constructor(props) {
        super(props);
        this.btnPause_clicked = this.btnPause_clicked.bind(this);
        this.state = { pause: false }
    }

    paused() {
        return this.state.pause;
    }

    btnPause_clicked() {
        this.setState({ pause: !this.state.pause });
    }

    render() {
        return (
            <input id="btnPause" type="button" onClick={this.btnPause_clicked} className="btn btn-outline-info" value={(this.state.pause ? 'Continue' : 'Pause')} />
        );
    }
}