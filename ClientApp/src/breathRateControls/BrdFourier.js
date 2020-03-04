import React from 'react';
import { AbstractBrd } from './AbstractBrd'
import { FrequencyChart } from '../common/FrequencyChart';
import { BrdFourier as Svc } from '../breathRateServices/brdFourier';

export class BrdFourier extends AbstractBrd {
    constructor(props) {
        super(props, Svc);
        this.frequencyChart = React.createRef();
    }

    onDspResult(result) {
        super.onDspResult(result);
        if (this.frequencyChart.current) {
            this.frequencyChart.current.process(result.fourier.frequencies);
        }
    }

    render() {
        return (
            <React.Fragment> {  super.render() }
                <article>
                    <FrequencyChart ref={this.frequencyChart} name="frequencyChart" title="Frequencies" hideLabels={this.state.hideLabels} fontSize={this.state.chartFontSize}  />
                    <section>
                        <h3>Fourier Data</h3>
                        <div>
                            <label>Avg Signal Distance:</label><span>{Math.round(this.state.result ? this.state.result.avgSignalDistance * 100 : null) / 100}s</span>
                        </div>
                        <div>
                            <label>Base Freqency:</label><span>{this.state.result && this.state.result.fourier ? this.state.result.fourier.baseFrequency.re : '-'}Hz - {this.state.result && this.state.result.fourier ? this.state.result.fourier.baseFrequency.im : '-'}A</span>
                        </div>
                    </section>
                    <label>Frequencies</label>
                    <div className="row">
                        <ul className="list-group col-3">
                            {(this.state.result && this.state.result.fourier ? Array.from(this.state.result.fourier.frequencies).map((f, i) =>
                                <li className="list-group-item" key={'freq' + i}>{f.re}Hz - {f.im}A</li>
                            ) : '')}
                        </ul>
                    </div>
                </article>
            </React.Fragment>
        );
    }
}