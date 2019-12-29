import React, { Component } from 'react';
import { RecordButton, PauseButton } from '../common/Buttons';
import { SignalChart } from '../common/SignalChart';
import { Dsp } from '../common/Dsp';
import { Dsp as SvcDsp } from '../services/dsp';
import { StackedBuffer } from '../services/stackedbuffer';
import { SignalApi } from '../services/api';

export class Home extends Component {
  //static displayName = Home.name;

    constructor(props) {
        super();
        this.inputBuffer = new StackedBuffer(5, this.onInputBufferPop.bind(this));
        this.processBuffer = new StackedBuffer(SvcDsp.bufferSize, this.onProcessBufferPop.bind(this));
        this.signalApi = new SignalApi([this.inputBuffer.push.bind(this.inputBuffer), this.processBuffer.push.bind(this.processBuffer)]);

        // references
        this.recordButton = React.createRef();
        this.pauseButton = React.createRef();
        this.rawSignalChart = React.createRef();
        this.dsp = React.createRef();
    }

    onInputBufferPop(values) {
        if (this.pauseButton.current.paused()) { return; }
        this.rawSignalChart.current.process(values);
        this.recordButton.current.process(values);

    }

    onProcessBufferPop(values) {
        if (this.pauseButton.current.paused()) { return; }
        this.dsp.current.process(values);
    }

    componentWillMount() {
        this.signalApi.connect();
    }

    componentWillUnmount() {
        this.signalApi.disconnect();
        this.inputBuffer.clear();
        this.processBuffer.clear();
    }

    render () {
    return (
        <main>
            <h1>Breath rate recognition</h1>
            <div className="btn-group">
                <RecordButton ref={this.recordButton} />
                <PauseButton ref={this.pauseButton} />
            </div>
            <SignalChart ref={this.rawSignalChart} name="rawSignalChart" title="Raw Signal" expiration={10} />
            <Dsp ref={this.dsp} />
        </main>
    );
  }
}
