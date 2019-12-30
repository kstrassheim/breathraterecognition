import React, { Component } from 'react';
import { RecordButton, PauseButton } from '../common/Buttons';
import { SignalChart } from '../common/SignalChart';
import { Dsp } from '../common/Dsp';
import { LowPassFilter } from '../services/lowpassfilter';
import { StackedBuffer } from '../services/stackedbuffer';
import { SignalApi } from '../services/api';

export class Home extends Component {
  //static displayName = Home.name;

    constructor(props) {
        super();
        this.inputBuffer = new StackedBuffer(10, this.onInputBufferPop.bind(this));
        this.lowPassBuffer = new StackedBuffer(10, this.onLowPassBufferPop.bind(this));
        this.lowPassFilter = new LowPassFilter(64, 24, this.lowPassBuffer.push.bind(this.lowPassBuffer));
        this.signalApi = new SignalApi([this.inputBuffer.push.bind(this.inputBuffer), this.lowPassFilter.push.bind(this.lowPassFilter)]);

        // references
        this.recordButton = React.createRef();
        this.pauseButton = React.createRef();
        this.rawSignalChart = React.createRef();
        this.lowPassSignalChart = React.createRef();
        this.dsp = React.createRef();
    }

    onInputBufferPop(values) {
        if (this.pauseButton.current.paused()) { return; }
        this.rawSignalChart.current.process(values);
        this.recordButton.current.process(values);
    }

    onLowPassBufferPop(values) {
        if (this.pauseButton.current.paused()) { return; }
        this.rawSignalChart.current.process(values);
        //this.lowPassSignalChart.current.process(values);
        //this.dsp.process(values);
    }

    componentWillMount() {
        this.signalApi.connect();
    }

    componentWillUnmount() {
        this.signalApi.disconnect();
        this.inputBuffer.clear();
    }

    sliderChange(evt) {

    }

    render () {
    return (
        <main>
            <h1>Breath rate recognition</h1>
            <div className="btn-group">
                <RecordButton ref={this.recordButton} />
                <PauseButton ref={this.pauseButton} />
                <input type="range" class="custom-range" min="0" max="255" id="customRange2" onChange={this.sliderChange} />
            </div>
            <SignalChart ref={this.rawSignalChart} name="rawSignalChart" title="Raw Signal" expiration={30} />
            <Dsp ref={this.dsp} />
        </main>
    );
  }
}
