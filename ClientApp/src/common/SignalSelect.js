import React, { Component } from 'react';
import $ from 'jquery';
import { PauseButton } from './Buttons';
import { HostSelector } from './HostSelector';
import { SignalChart } from './SignalChart';
import { LowPassFilter } from '../services/lowpassfilter';
import { StackedBuffer } from '../services/stackedbuffer';
import { SignalApi, DemoApi } from '../services/api';

export class SignalSelect extends Component {

    constructor(props) {
        super(props);
        this.inputBuffer = new StackedBuffer(props.defaultBufferSize);
        this.lowPassFilter = new LowPassFilter(props.defaultBufferSize, props.defaultLowPassSensity);
        this.signalApi = new SignalApi();
        this.demoApi = new DemoApi(props.defaultBufferSize);

        // references
        //this.recordButton = React.createRef();
        this.pauseButton = React.createRef();
        this.rawSignalChart = React.createRef();
        this.dsp = React.createRef();
        this.hostSelector = React.createRef();
        this.state = {
            noiseSensity: props.defaultNoiseSensity,
            bufferSize: props.defaultBufferSize,
            lowPassSensity: props.defaultLowPassSensity,
            displaySeconds: props.defaultDisplaySeconds,
            breathRate: '',
            overlayBreathRate: (!!this.props.defaultOverlayBreathRate),
            hideLabels: (!!this.props.defaultHideLabels),
            hideResult: (!!this.props.defaultResultHidden),
            showAlgorithm: (!!this.props.defaultShowAlgorithm),
            showRawSignal: (!!this.props.defaultShowRawSignal),
            darkMode: $("link[href*='dark.css']").length > 0,
            chartFontSize: this.props.chartFontSize,
            avgCutAlgoToleranceSec: this.props.defaultAvgCutAlgoToleranceSec
        };
    }

    setLowPassCallbacks(callbacks) {
        this.lowPassFilter.popCallback = [this.rawSignalChart.current.process.bind(this.rawSignalChart.current)].concat(callbacks); // [this.dsp.current.process.bind(this.dsp.current), this.rawSignalChart.current.process.bind(this.rawSignalChart.current)];
    }

    setResetCallbacks(callbacks) {
        this.resetCallbacks = callbacks; // [this.dsp.current.process.bind(this.dsp.current), this.rawSignalChart.current.process.bind(this.rawSignalChart.current)];
    }

    setNoiseSensityChangedCallbacks(callbacks) {
        this.noiseSensityChangeCallbacks = callbacks;
    }

    setDisplaySecondsChangedCallbacks(callbacks) {
        this.displaySecondsCallbacks = callbacks;
    }

    setHideLabelsCallbacks(callbacks) {
        this.hideLabelsCallbacks = callbacks;
    }

    setChartFontSizeCallbacks(callbacks) {
        this.chartFontSizeCallbacks = callbacks;
    }

    setHideResultCallbacks(callbacks) {
        this.hideresultCallbacks = callbacks;
    }

    setAvgCutAlgoToleranceSecCallbacks(callbacks) {
        this.avgCutAlgoToleranceSecCallbacks = callbacks;
    }

    btnHideLabels_Clicked() {
        if (this.hideLabelsCallbacks) {
            for (let i = 0; i < this.hideLabelsCallbacks.length; i++) {
                this.hideLabelsCallbacks[i](!this.state.hideLabels);
            }
        }
        this.setState({
            hideLabels: !this.state.hideLabels
        });
    }

    btnShowAlgorithm_Clicked() {
        this.setState({
            showAlgorithm: !this.state.showAlgorithm
        });
    }

    btnShowRawSignal_Clicked() {
        this.setState({
            showRawSignal: !this.state.showRawSignal
        });
    }

    btnHideResult_Clicked() {
        this.setState({
            hideResult: !this.state.hideResult
        });
        if (this.hideresultCallbacks) {
            for (let i = 0; i < this.hideresultCallbacks.length; i++) {
                this.hideresultCallbacks[i](!this.state.hideResult);
            }
        }
    }

    btnReset_Clicked() {
        this.reset(true);
        if (this.resetCallbacks) {
            for (let i = 0; i < this.resetCallbacks.length; i++) {
                this.resetCallbacks[i]();
            }
        }
    }

    btnOverlayBr_Clicked() {
        this.setState({ overlayBreathRate: !this.state.overlayBreathRate })
    }

    btnDarkMode_Clicked() {
        let del = $("link[href*='dark.css']");
        if (del.length < 1) {
            $("body").prepend("<link rel='stylesheet' href='dark.css' type='text/css' />");
            $(".navbar").toggleClass("navbar-dark");
        }
        else {
            $(".navbar").toggleClass("navbar-dark");
            del.remove();
        }

        this.setState({  darkMode: $("link[href*='dark.css']").length > 0 });
    }


    onDisplaySecondsChanged(e) {
        this.setState({ displaySeconds: e.target.value })
        if (this.displaySecondsCallbacks) {
            for (let i = 0; i < this.displaySecondsCallbacks.length; i++) {
                this.displaySecondsCallbacks[i](e.target.value);
            }
        }
    }

    onNoiseSensityChanged(e) {
        this.setState({ noiseSensity: e.target.value })
        if (this.noiseSensityChangeCallbacks) {
            for (let i = 0; i < this.noiseSensityChangeCallbacks.length; i++) {
                this.noiseSensityChangeCallbacks[i](e.target.value);
            }
        }
    }

    onBufferSizeChanged(e) {
        this.setState({ bufferSize: e.target.value })
        this.inputBuffer.changeSize(e.target.value);
        this.lowPassFilter.changeSize(e.target.value);
        this.demoApi.onBufferSizeChanged(e.target.value)
    }

    onLowPassSensityChanged(e) {
        this.setState({ lowPassSensity: e.target.value })
        this.lowPassFilter.changeSensity(e.target.value);
    }

    onChartFontSizeChanged(e) {
        this.setState({ chartFontSize: e.target.value })
        if (this.chartFontSizeCallbacks) {
            for (let i = 0; i < this.chartFontSizeCallbacks.length; i++) {
                this.chartFontSizeCallbacks[i](e.target.value);
            }
        }
    }

    onAvgCutAlgoToleranceSecChanged(e) {
        this.setState({ avgCutAlgoToleranceSec: e.target.value })
        if (this.avgCutAlgoToleranceSecCallbacks) {
            for (let i = 0; i < this.avgCutAlgoToleranceSecCallbacks.length; i++) {
                this.avgCutAlgoToleranceSecCallbacks[i](e.target.value);
            }
        }
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

    onDspSelect(val, color) {
        if (!this.rawSignalChart.current) { return; }
        this.rawSignalChart.current.addAnnotation(val.timestamp, color);
    }

    onDspUnselect(val) {
        if (this.rawSignalChart.current) {
            this.rawSignalChart.current.removeAnnotation(val ? val.timestamp : null);
        }
    }

    onDspResult(res) {
        if (!this.rawSignalChart.current) { return; }
        if (!res) { this.rawSignalChart.current.clearAnnotations(); return; }
        this.rawSignalChart.current.clearHorizontalAnnotation();
        this.rawSignalChart.current.addHorizontalAnnotation(res.avg, 'orange');
        this.setState({ breathRate: res.breathRate });
    }

    onDspReset() {
        console.log("Reset");
        if (this.rawSignalChart.current) { this.rawSignalChart.current.clearAnnotations(); };
        this.setState({ breathRate: '' });
    }

    reset(ignoreHost) {
        //if (this.recordButton.current) { this.recordButton.current.stop(); }
        this.inputBuffer.clear();
        this.lowPassFilter.clear();
        if (this.rawSignalChart.current) { this.rawSignalChart.current.reset(); }
        if (!ignoreHost && this.hostSelector.current) { this.hostSelector.current.reset(); }
    }


    componentDidMount() {
        // set callbacks
        this.demoApi.onSignalCallbacks = [this.hostSelector.current.process.bind(this.hostSelector.current), this.inputBuffer.push.bind(this.inputBuffer), this.lowPassFilter.push.bind(this.lowPassFilter)];
        this.signalApi.onSignalCallbacks = [this.hostSelector.current.process.bind(this.hostSelector.current), this.inputBuffer.push.bind(this.inputBuffer), this.lowPassFilter.push.bind(this.lowPassFilter)];
        this.inputBuffer.popCallback = [this.rawSignalChart.current.process.bind(this.rawSignalChart.current)]; //, this.recordButton.current.process.bind(this.recordButton.current)
        this.lowPassFilter.popCallback = [this.rawSignalChart.current.process.bind(this.rawSignalChart.current)]
        this.demoApi.connect();
        this.signalApi.connect();

        if ($("link[href*='dark.css']").length > 0 && !this.state.darkMode) {
            this.setState({ darkMode: true });
        }
    }

    componentWillUnmount() {
        this.signalApi.disconnect();
        this.reset();
    }

    render() {
        return (
            <React.Fragment>
                <div id="optionsToolbar" className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups" style={{display: this.props.settingsCollapsed ? 'none' : 'inherit'}}>
                    <HostSelector ref={this.hostSelector} onHostSelected={this.onHostSelected.bind(this)} onPortSelected={this.onPortSelected.bind(this)} onNewHostDetected={this.onNewHostDetected.bind(this)} />
                    <div className="btn-group mb1" role="group" >
                        <PauseButton ref={this.pauseButton} onPauseChanged={this.onPauseChanged.bind(this)} />
                        <input id="btnReset" type="button" onClick={this.btnReset_Clicked.bind(this)} className="btn btn-outline-warning" value='Reset' />
                        <input id="btnOverlayBr" type="button" onClick={this.btnOverlayBr_Clicked.bind(this)} className={'btn' + (this.state.overlayBreathRate ? ' btn-primary' : ' btn-secondary')} value={'Overlay BreathRate' + (this.state.overlayBreathRate ? ' On' : ' Off')} />
                       </div>
                    <div className="btn-group mb1" role="group" >
                        <input id="btnHideLabels" type="button" onClick={this.btnHideLabels_Clicked.bind(this)} className={'btn' + (this.state.hideLabels ? ' btn-primary' : ' btn-secondary')} value="Hide Labels" />
                        <input id="btnHideResult" type="button" onClick={this.btnHideResult_Clicked.bind(this)} className={'btn' + (this.state.hideResult ? ' btn-primary' : ' btn-secondary')} value="Hide Result" />
                    </div>
                    <div className="btn-group mb1" role="group">
                        <input id="btnShowRawSignal" type="button" onClick={this.btnShowRawSignal_Clicked.bind(this)} className={'btn' + (this.state.showRawSignal ? ' btn-primary' : ' btn-secondary')} value="Show Raw Signal" />
                        <input id="btnShowAlgorithm" type="button" onClick={this.btnShowAlgorithm_Clicked.bind(this)} className={'btn' + (this.state.showAlgorithm ? ' btn-primary' : ' btn-secondary')} value="Show Algorithm" />
                    </div>
                    <div className="btn-group mb1" role="group">
                        <input id="btnDarkMode" type="button" onClick={this.btnDarkMode_Clicked.bind(this)} className={'btn' + (this.state.darkMode ? ' btn-primary' : ' btn-secondary')} value="Dark Mode" />
                    </div>
                    <div className="btn-group mb1" role="group">
                        <label htmlFor="noiseRangeSelect" style={{ whiteSpace: 'nowrap'}}>Noise Detection Sensity:</label>
                        <input type="range" min="100" step="100" max="3000" value={this.state.noiseSensity} onChange={this.onNoiseSensityChanged.bind(this)} style={{ marginLeft: '5px', marginRight: '5px', boxShadow: '0', outline: '0 !important' }} className="form-control-range form-control custom-range" id="noiseRangeSelect" />
                        <span> {this.state.noiseSensity}</span>
                    </div>
                    <div className="btn-group mb1" role="group">
                        <label htmlFor="bufferSizeSelect" style={{ whiteSpace: 'nowrap' }}>Buffer Size:</label>
                        <input type="range" min="0" step="1" max="100" value={this.state.bufferSize} onChange={this.onBufferSizeChanged.bind(this)} style={{ marginLeft: '5px', marginRight: '5px', boxShadow: '0', outline: '0 !important' }} className="form-control-range form-control custom-range" id="bufferSizeSelect" />
                        <span> {this.state.bufferSize}</span>
                    </div>
                    <div className="btn-group  mb1" role="group">
                        <label htmlFor="lowPassSensitySelect" style={{ whiteSpace: 'nowrap' }}>Low pass sensity:</label>
                        <input type="range" min="0" step="1" max="100" value={this.state.lowPassSensity} onChange={this.onLowPassSensityChanged.bind(this)} style={{ marginLeft: '5px', marginRight: '5px', boxShadow: '0', outline: '0 !important' }} className="form-control-range form-control custom-range" id="lowPassSensitySelect" />
                        <span> {this.state.lowPassSensity}</span>
                    </div>
                    <div className="btn-group  mb1" role="group">
                        <label htmlFor="displaySecondsSelect" style={{ whiteSpace: 'nowrap' }}>Display Seconds:</label>
                        <input type="range" min="10" step="1" max="60" value={this.state.displaySeconds} onChange={this.onDisplaySecondsChanged.bind(this)} style={{ marginLeft: '5px', marginRight: '5px', boxShadow: '0', outline: '0 !important' }} className="form-control-range form-control custom-range" id="displaySecondsSelect" />
                        <span> {this.state.displaySeconds}</span>
                    </div>
                    <div className="btn-group  mb1" role="group">
                        <label htmlFor="chartFontSizeSelect" style={{ whiteSpace: 'nowrap' }}>Chart Font Size:</label>
                        <input type="range" min="1" step="1" max="20" value={this.state.chartFontSize} onChange={this.onChartFontSizeChanged.bind(this)} style={{ marginLeft: '5px', marginRight: '5px', boxShadow: '0', outline: '0 !important' }} className="form-control-range form-control custom-range" id="chartFontSizeSelect" />
                        <span> {this.state.chartFontSize}</span>
                    </div>
                    <div className="btn-group  mb1" role="group">
                        <label htmlFor="avgCutAlgoToleranceSecSelect" style={{ whiteSpace: 'nowrap' }}>Avg Cut Tolerance Seconds:</label>
                        <input type="range" min="0" step="0.1" max="3" value={this.state.avgCutAlgoToleranceSec} onChange={this.onAvgCutAlgoToleranceSecChanged.bind(this)} style={{ marginLeft: '5px', marginRight: '5px', boxShadow: '0', outline: '0 !important' }} className="form-control-range form-control custom-range" id="avgCutAlgoToleranceSecSelect" />
                        <span> {this.state.avgCutAlgoToleranceSec}</span>
                    </div>
                </div>

                <div className="container-fluid" style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', opacity: 0.3, width: '100%', height: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: '11em', display: 'flex', alignItems: 'center', justifyContent: 'center', display: (this.state.overlayBreathRate ? 'flex' : ' none') }}>{this.state.breathRate}</div>
                    <SignalChart ref={this.rawSignalChart} name="rawSignalChart" title="Raw Signal" expiration={this.state.displaySeconds} hideLabels={this.state.hideLabels} showAlgorithm={this.state.showAlgorithm} fontSize={this.state.chartFontSize} showRawSignal={this.state.showRawSignal} />
                </div>
            </React.Fragment>
        );
    }
}