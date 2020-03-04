import React, { Component } from 'react';
//import moment from 'moment';
import { SignalChart } from '../common/SignalChart';

export class AbstractBrd extends Component {

    applySingleValueCallback(callbackFunctions, value, value1, value2) {
        if (callbackFunctions) {
            for (let i = 0; i < callbackFunctions.length; i++) {
                callbackFunctions[i](value, value1, value2);
            }
        }
    }

    constructor(props, svcBrd) {
        super(props);
        this.svcBrd = new svcBrd(props.defaultProcessBufferSeconds, props.defaultNoiseSensity, props.defaultAvgCutAlgoToleranceSec, this.onDspResult.bind(this), this.onDspSelect.bind(this), this.onDspUnselect.bind(this), this.onDspReset.bind(this));
        this.state = { result: this.svcBrd.result, displaySeconds: props.defaultDisplaySeconds, processBufferSeconds: props.defaultProcessBufferSeconds, hidden: (!!this.props.defaultResultHidden), hideLabels: (!!this.props.defaultHideLabels), chartFontSize: this.props.defaultChartFontSize };
        this.signalChart = React.createRef();
    }

    process(values) {
        this.svcBrd.process(values);
    }

    reset() {
        this.svcBrd.reset();
        if (this.signalChart.current) { this.signalChart.current.reset(); }
        this.setState({ result: this.svcBrd.result });
    }

    onHideLabelsChanged(v) {
        this.setState({ hideLabels: v });
    }
    onHideResultChanged(v) {
        this.setState({ hidden: v });
    }

    onDspSelect(value, color) {  this.applySingleValueCallback(this.onDspSelectCallbacks, value, color); }
    onDspUnselect(value) {
        this.applySingleValueCallback(this.onDspUnselectCallbacks, value);
    }
    onDspReset() {
        this.applySingleValueCallback(this.onDspResetCallbacks);
    }

    onNoiseSensityChanged(v) { this.svcBrd.setNoiseSensity(v); }

    onDisplaySecondsChanged(v) {
        if (!v || v < 0) { return; }
        this.setState({ displaySeconds: v });
    }

    onProcessBufferSecondsChanged(v) {
        if (!v || v < 0) { return; }
        this.svcBrd.setProcessBufferSeconds(v);
        this.setState({ processBufferSeconds: v });
        
    }

    onDspResult(result) {
        this.setState({ result: result });
        if (result && this.signalChart.current) { this.signalChart.current.process([result]); }
        this.applySingleValueCallback(this.onDspResultCallbacks, result);
    }

    onChartFontSizeChanged(v) {
        this.setState({ chartFontSize: v });
    }

    onAvgCutAlgoToleranceSecChanged(v) {
        this.svcBrd.setAvgCutAlgoToleranceSec(v);
    }

    componentDidMount() {
        if (this.props.signalSelectControlRef.current) {
            this.props.signalSelectControlRef.current.setLowPassCallbacks([this.process.bind(this)]);
            this.props.signalSelectControlRef.current.setResetCallbacks([this.reset.bind(this)]);
            this.props.signalSelectControlRef.current.setNoiseSensityChangedCallbacks([this.onNoiseSensityChanged.bind(this)]);
            this.props.signalSelectControlRef.current.setDisplaySecondsChangedCallbacks([this.onDisplaySecondsChanged.bind(this)]);
            this.props.signalSelectControlRef.current.setHideLabelsCallbacks([this.onHideLabelsChanged.bind(this)]);
            this.props.signalSelectControlRef.current.setHideResultCallbacks([this.onHideResultChanged.bind(this)]);
            this.props.signalSelectControlRef.current.setChartFontSizeCallbacks([this.onChartFontSizeChanged.bind(this)]);
            this.props.signalSelectControlRef.current.setAvgCutAlgoToleranceSecCallbacks([this.onAvgCutAlgoToleranceSecChanged.bind(this)]);
            this.props.signalSelectControlRef.current.setProcessBufferSecondsCallbacks([this.onProcessBufferSecondsChanged.bind(this)]);

            this.onDspSelectCallbacks = [this.props.signalSelectControlRef.current.onDspSelect.bind(this.props.signalSelectControlRef.current)];
            this.onDspUnselectCallbacks = [this.props.signalSelectControlRef.current.onDspUnselect.bind(this.props.signalSelectControlRef.current)];
            this.onDspResultCallbacks = [this.props.signalSelectControlRef.current.onDspResult.bind(this.props.signalSelectControlRef.current)];
            this.onDspResetCallbacks = [this.props.signalSelectControlRef.current.onDspReset.bind(this.props.signalSelectControlRef.current)];
        }
    }

    componentWillUnmount() {
        this.svcBrd.reset();
    }

    render() {
        return (
            <React.Fragment>
                {
                    this.state.hidden ?
                        <React.Fragment />
                        : (<React.Fragment>
                
                <SignalChart ref={this.signalChart} visi name="signalChart" title="Breath rate" valuePropertyName={'frequencyPerMinute'} expiration={this.state.displaySeconds} hideLabels={this.state.hideLabels} fontSize={this.state.chartFontSize} />
                <section>
                    <h3>Signal Rate</h3>
                    {
                        this.state.result ?
                            <div>
                                <div>
                                    <label>Period:</label><span>{this.state.result.period}s</span>
                                </div>
                                <div>
                                    <label>Frequency:</label><span>{this.state.result.frequency}Hz</span>
                                </div>
                                <div>
                                    <label>Frequency per Minute:</label><span>{this.state.result.frequencyPerMinute} per Minute</span>
                                </div>
                                <div>
                                    <label>Avg Value:</label><span>{this.state.result.avg}</span>
                                </div>
                            </div>
                            :
                            <div>
                                <span>Invalid</span>
                            </div>
                    }

                            </section>
                        </React.Fragment>)
                }
            </React.Fragment>
        );
    }
}