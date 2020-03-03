import React, { Component } from 'react';

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
        if (this.props.onPauseChanged) { this.props.onPauseChanged(!this.state.pause); } 
    }

    render() {
        return (
            <input id="btnPause" type="button" onClick={this.btnPause_clicked} className="btn btn-outline-info" value={(this.state.pause ? 'Continue' : 'Pause')} />
        );
    }
}