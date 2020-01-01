import React, { Component } from 'react';
import { RecordButton, PauseButton } from '../common/Buttons';
import { SignalChart } from '../common/SignalChart';
import { Dsp } from '../common/Dsp';
import { LowPassFilter } from '../services/lowpassfilter';
import { StackedBuffer } from '../services/stackedbuffer';
import { SignalApi, DemoApi } from '../services/api';

export class Home extends Component {
  //static displayName = Home.name;
    static bufferSize = 10;

    constructor(props) {
        super();
        this.inputBuffer = new StackedBuffer(Home.bufferSize, this.onInputBufferPop.bind(this));
        this.demoBuffer = new StackedBuffer(Home.bufferSize, this.onDemoInputBufferPop.bind(this));
        this.lowPassBuffer = new StackedBuffer(Home.bufferSize, this.onLowPassBufferPop.bind(this));
        this.lowPassFilter = new LowPassFilter(8, this.lowPassBuffer.push.bind(this.lowPassBuffer));
        this.signalApi = new SignalApi([this.inputBuffer.push.bind(this.inputBuffer), this.lowPassFilter.push.bind(this.lowPassFilter)]);
        this.demoApi = new DemoApi([this.demoBuffer.push.bind(this.demoBuffer), this.lowPassFilter.push.bind(this.lowPassFilter)])

        // references
        this.recordButton = React.createRef();
        this.pauseButton = React.createRef();
        this.rawSignalChart = React.createRef();
        this.lowPassSignalChart = React.createRef();
        this.dsp = React.createRef();
    }

    onInputBufferPop(values) {
        if (this.pauseButton.current.paused()) { return; }
        this.demoApi.disconnect();
        this.rawSignalChart.current.process(values);
        this.recordButton.current.process(values);
    }

    onDemoInputBufferPop(values) {
        if (this.pauseButton.current.paused()) { return; }
        this.rawSignalChart.current.process(values);
    }

    onLowPassBufferPop(values) {
        if (this.pauseButton.current.paused()) { return; }
        this.rawSignalChart.current.process(values);
        this.dsp.current.process(values);
    }

    componentDidMount() {
        this.signalApi.connect();
        this.demoApi.connect();
    }

    componentWillUnmount() {
        this.signalApi.disconnect();
        this.inputBuffer.clear();
        this.demoBuffer.clear();
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
                <input type="range" className="custom-range" min="0" max="255" id="customRange2" onChange={this.sliderChange} />
            </div>
            <SignalChart ref={this.rawSignalChart} name="rawSignalChart" title="Raw Signal" expiration={30} />
            <Dsp ref={this.dsp} />
        </main>
    );
  }
}
