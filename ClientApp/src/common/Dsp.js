import React, { Component } from 'react';
//import moment from 'moment';
import { SignalChart } from '../common/SignalChart';
import { Dsp as SvcDsp } from '../services/dsp';

export class Dsp extends Component {

    constructor(props) {
        super(props);
        this.dsp = new SvcDsp(this.props.expiration, this.props.noiseSensity, this.onDspResult.bind(this), this.props.onDspSelect, this.props.onDspUnselect, this.props.onDspReset);
        this.state = { result: this.dsp.result };
        this.signalChart = React.createRef();
    }

    process(values) {
        this.dsp.process(values);
    }

    reset() {
        this.dsp.reset();
        this.signalChart.current.reset();
        this.setState({result: this.dsp.result });
    }

    onDspResult(result) {
        this.setState({ result: result });
        if (result && this.signalChart.current) {
            this.signalChart.current.process([result]);
        }
        if (this.props.onDspResult) { this.props.onDspResult(result); }
    }

    componentWillUpdate(nextProps) {
        if (this.noiseSensity !== nextProps.noiseSensity) {
            this.dsp.setNoiseSensity(nextProps.noiseSensity);
        }
    }

    render() {
        return (
            <article>
                <SignalChart ref={this.signalChart} name="signalChart" title="Breath rate" valuePropertyName={'frequencyPerMinute'} expiration={3600} />
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
                                    <label>Avg Signal Period:</label><span>{this.state.result.avgSignalPeriod}s</span>
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
            </article>
        );
    }
}