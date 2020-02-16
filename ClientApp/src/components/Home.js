import React, { Component } from 'react';
import { RecordButton, PauseButton } from '../common/Buttons';
import { HostSelector } from '../common/HostSelector';
import { SignalChart } from '../common/SignalChart';
import { Dsp } from '../common/Dsp';
import { LowPassFilter } from '../services/lowpassfilter';
import { StackedBuffer } from '../services/stackedbuffer';
import { SignalApi, DemoApi } from '../services/api';

export class Home extends Component {
  //static displayName = Home.name;
    static bufferSize = 10;
    static displaySec = 30;
    constructor(props) {
        super();
        this.inputBuffer = new StackedBuffer(Home.bufferSize);
        this.lowPassFilter = new LowPassFilter(Home.bufferSize, 16);
        this.signalApi = new SignalApi();
        this.demoApi = new DemoApi();

        // references
        //this.recordButton = React.createRef();
        this.pauseButton = React.createRef();
        this.rawSignalChart = React.createRef();
        this.dsp = React.createRef();
        this.hostSelector = React.createRef();
        this.state = { noiseSensity: 400 };
    }

    btnReset_Clicked() {
        this.reset();
    }

    onPauseChanged(paused) {
       // this.recordButton.current.stop();
        this.inputBuffer.paused = paused;
        this.lowPassFilter.paused = paused;
    }

    onHostSelected(host) {
        //this.recordButton.current.stop();
        this.inputBuffer.filterName = host.name;
        this.lowPassFilter.filterName = host.name;
        this.reset(true);
    }

    onPortSelected(port) {
        //this.recordButton.current.stop();
        this.inputBuffer.filterPort = port;
        this.lowPassFilter.filterPort = port;
        this.reset(true);
    }

    onNewHostDetected(host) {
        console.log(`New Host found:${host}`);
    }

    onDspSelect(val) {
        //if (!this.rawSignalChart.current) { return; }
        //this.rawSignalChart.current.addAnnotation(time, type == 2 ? 'red' : 'green');
        this.rawSignalChart.current.addAnnotation(val.timestamp, 'red');
    }

    onDspUnselect(val) {
        this.rawSignalChart.current.removeAnnotation(val.timestamp);
    }

    onDspResult(res) {
        if (!this.rawSignalChart.current) { return; }
        this.rawSignalChart.current.clearHorizontalAnnotation();
        this.rawSignalChart.current.addHorizontalAnnotation(res.avg, 'orange');
    }

    onDspReset() {
        console.log("Reset");
        if (this.rawSignalChart.current) { this.rawSignalChart.current.clearAnnotations(); };
    }

    onNoiseSensityChanged(evt) {
        this.setState({noiseSensity:evt.target.value})
    }

    reset(ignoreHost) {
        //if (this.recordButton.current) { this.recordButton.current.stop(); }
        this.inputBuffer.clear();
        this.lowPassFilter.clear();
        if (this.rawSignalChart.current) { this.rawSignalChart.current.reset(); }
        if (this.dsp.current) { this.dsp.current.reset(); }
        if (!ignoreHost && this.hostSelector.current) { this.hostSelector.current.reset(); }
    }

    componentDidMount() {
        // set callbacks
        this.demoApi.onSignalCallbacks = [this.hostSelector.current.process.bind(this.hostSelector.current), this.inputBuffer.push.bind(this.inputBuffer), this.lowPassFilter.push.bind(this.lowPassFilter)];
        this.signalApi.onSignalCallbacks = [this.hostSelector.current.process.bind(this.hostSelector.current), this.inputBuffer.push.bind(this.inputBuffer), this.lowPassFilter.push.bind(this.lowPassFilter)];
        this.inputBuffer.popCallback = [this.rawSignalChart.current.process.bind(this.rawSignalChart.current)]; //, this.recordButton.current.process.bind(this.recordButton.current)
        this.lowPassFilter.popCallback = [this.dsp.current.process.bind(this.dsp.current), this.rawSignalChart.current.process.bind(this.rawSignalChart.current)];

        this.demoApi.connect();
        this.signalApi.connect();
    }

    componentWillUnmount() {
        this.signalApi.disconnect();
        this.reset();
    }

    render () {
    return (
        <main>
            <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                <div className="btn-group mb1" role="group" >
                    <PauseButton ref={this.pauseButton} onPauseChanged={this.onPauseChanged.bind(this)} />
                    <input id="btnReset" type="button" onClick={this.btnReset_Clicked.bind(this)} className="btn btn-outline-warning" value='Reset' />
                </div>
                <HostSelector ref={this.hostSelector} onHostSelected={this.onHostSelected.bind(this)} onPortSelected={this.onPortSelected.bind(this)} onNewHostDetected={this.onNewHostDetected.bind(this)} />
                <input type="range" min="100" step="100" max="3000" value={this.state.noiseSensity} className="custom-range" id="noiseRangeSelect" onChange={this.onNoiseSensityChanged.bind(this)} />
            </div>
            <SignalChart ref={this.rawSignalChart} name="rawSignalChart" title="Raw Signal" expiration={Home.displaySec} />
            <Dsp ref={this.dsp} noiseSensity={ this.state.noiseSensity } onDspSelect={this.onDspSelect.bind(this)} onDspUnselect={this.onDspUnselect.bind(this)} onDspResult={this.onDspResult.bind(this)} onDspReset={this.onDspReset.bind(this)} expiration={Home.displaySec} />
        </main>
    );
  }
}
