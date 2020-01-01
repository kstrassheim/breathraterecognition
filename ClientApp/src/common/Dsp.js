import React, { Component } from 'react';
import moment from 'moment';
import { FrequencyChart } from '../common/FrequencyChart';
import { Dsp as SvcDsp } from '../services/dsp';

export class Dsp extends Component {

    constructor(props) {
        super(props);
        this.dsp = new SvcDsp(this.onDspResult.bind(this));
        this.state = { result: this.dsp.result };
        this.frequencyChart = React.createRef();
    }

    process(values) {
        this.dsp.process(values);
    }

    onDspResult(result) {
        this.frequencyChart.current.process(result.frequencies);
        this.setState({ result: result });
    }

    render() {
        return (
            <article>
                <FrequencyChart ref={this.frequencyChart} name="frequencyChart" title="Processed Signal" />
                <section>
                    <h3>Signal Rate</h3>
                    <div>
                        <label>Avg Signal Distance:</label><span>{Math.round(this.state.result.avgSignalDistance * 100) / 100}s</span>
                    </div>
                    <div>
                        <label>Base Freqency:</label><span>{this.state.result.baseFrequency.re}Hz - {this.state.result.baseFrequency.im}A</span>
                    </div>
                </section>
                <label>Frequencies</label>
                <div className="row">
                    <ul className="list-group col-3">
                        {Array.from(this.state.result.frequencies).map((f, i) =>
                            <li className="list-group-item" key={'freq' + i}>{f.re}Hz - {f.im}A</li>
                        )}
                    </ul>
                </div>
            </article>
        );
    }
}