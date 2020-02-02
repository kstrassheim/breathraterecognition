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
        this.lowPassFilter = new LowPassFilter(16, this.lowPassBuffer.push.bind(this.lowPassBuffer));
        this.signalApi = new SignalApi([this.inputBuffer.push.bind(this.inputBuffer), this.lowPassFilter.push.bind(this.lowPassFilter)]);
        this.demoApi = new DemoApi([this.demoBuffer.push.bind(this.demoBuffer), this.lowPassFilter.push.bind(this.lowPassFilter)])

        // references
        this.recordButton = React.createRef();
        this.pauseButton = React.createRef();
        this.rawSignalChart = React.createRef();
        this.dsp = React.createRef();
    }

    btnReset_Clicked() {
        this.reset();
    }

    onDspSelect(time, type) {
        if (!this.rawSignalChart.current) { return; }
        this.rawSignalChart.current.addAnnotation(time, type == 2 ? 'red' : 'green');
    }

    onDspAvgSelect(time, avg) {
        if (!this.rawSignalChart.current) { return; }
        this.rawSignalChart.current.clearAnnotations();
        this.rawSignalChart.current.addHorizontalAnnotation(time, avg, 'orange');
        this.rawSignalChart.current.addAnnotation(time, 'blue');
    }

    onInputBufferPop(values) {
        if (!this.pauseButton.current || this.pauseButton.current.paused()) { return; }
        this.demoApi.disconnect();
        this.rawSignalChart.current.process(values);
        this.recordButton.current.process(values);
    }

    onDemoInputBufferPop(values) {
        if (!this.pauseButton.current || this.pauseButton.current.paused()) { return; }
        this.rawSignalChart.current.process(values);
    }

    onLowPassBufferPop(values) {
        if (!this.pauseButton.current || this.pauseButton.current.paused()) { return; }
        this.rawSignalChart.current.process(values);
        this.dsp.current.process(values);
    }

    reset() {
        this.inputBuffer.clear();
        this.demoBuffer.clear();
        this.lowPassBuffer.clear();
        this.lowPassFilter.clear();
        if (this.rawSignalChart.current) { this.rawSignalChart.current.reset(); }
        if (this.dsp.current) { this.dsp.current.reset(); }
    }

    componentDidMount() {
        this.signalApi.connect();
        this.demoApi.connect();
    }

    componentWillUnmount() {
        this.signalApi.disconnect();
        this.reset();
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
                <input id="btnReset" type="button" onClick={this.btnReset_Clicked.bind(this)} className="btn btn-outline-warning" value='Reset' />
            </div>
            <SignalChart ref={this.rawSignalChart} name="rawSignalChart" title="Raw Signal" expiration={30} />
            <Dsp ref={this.dsp} onDspSelect={this.onDspSelect.bind(this)} onDspAvgSelect={this.onDspAvgSelect.bind(this)} />
        </main>
    );
  }
}
