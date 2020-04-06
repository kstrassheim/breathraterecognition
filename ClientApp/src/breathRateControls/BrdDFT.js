import React from 'react';
import { AbstractBrd } from './AbstractBrd'
import { FrequencyChart } from '../common/FrequencyChart';
import { BrdDFT as Svc } from '../breathRateServices/brdDFT';

export class BrdDFT extends AbstractBrd {
    constructor(props) {
        super(props, Svc);
        this.frequencyChart = React.createRef();
        this.frequencyChartOut = React.createRef();
    }

    onDspResult(result) {
        super.onDspResult(result);
        if (this.frequencyChart.current) {
            this.frequencyChart.current.process(result.fourier.spectrumShort);
        }
        if (this.frequencyChartOut.current) {
            this.frequencyChartOut.current.process(result.fourier.spectrum);
        }
    }

    render() {
        return (
            <React.Fragment> {  super.render() }
                <article>
                    <FrequencyChart ref={this.frequencyChart} name="frequencyChart" title="Frequencies" hideLabels={this.state.hideLabels} fontSize={this.state.chartFontSize} />
                    <FrequencyChart ref={this.frequencyChartOut} name="frequencyChartout" title="Frequencies Output" hideLabels={this.state.hideLabels} fontSize={this.state.chartFontSize} />
                    <section>
                        <h3>Fourier Data</h3>
                        <div>
                            <label>Sample Period:</label><span>{(this.state.result && this.state.result.fourier ? this.state.result.fourier.samplePeriod : null)}</span>
                        </div>
                        <div>
                            <label>Sample Rate:</label><span>{(this.state.result && this.state.result.fourier ? this.state.result.fourier.sampleRate : null)}</span>
                        </div>
                        <div>
                            <label>Avg Signal Distance:</label><span>{Math.round(this.state.result ? this.state.result.avgSignalDistance * 100 : null) / 100}s</span>
                        </div>
                        <div>
                            <label>Avg Signal Distance:</label><span>{Math.round(this.state.result ? this.state.result.avgSignalDistance * 100 : null) / 100}s</span>
                        </div>
                        <div>
                            <label>Base Freqency:</label><span>{this.state.result && this.state.result.fourier ? this.state.result.fourier.baseFrequency.frequency : '-'}Hz - {this.state.result && this.state.result.fourier ? this.state.result.fourier.baseFrequency.amplitude : '-'}A</span>
                        </div>
                    </section>
                    <label>Sample Rate</label>
                    <div className="row">
                        <ul className="list-group col-3">
                            {(this.state.result && this.state.result.fourier ? this.state.result.fourier.spectrumShort.map((f, i) =>
                                <li className="list-group-item" key={'freq' + i}>{f.frequency}Hz - {f.amplitude}A</li>
                            ) : '')}
                        </ul>
                    </div>
                    <label>Spectrum Short</label>
                    <div className="row">
                        <ul className="list-group col-3">
                            {(this.state.result && this.state.result.fourier ? this.state.result.fourier.spectrumShort.map((f, i) =>
                                <li className="list-group-item" key={'freq' + i}>{f.frequency}Hz - {f.amplitude}A</li>
                            ) : '')}
                        </ul>
                    </div>
                    <label>Spectrum Out</label>
                    <div className="row">
                        <ul className="list-group col-3">
                            {(this.state.result && this.state.result.fourier ? this.state.result.fourier.spectrum.map((f, i) =>
                                <li className="list-group-item" key={'freq' + i}>{f.frequency}Hz - {f.amplitude}A</li>
                            ) : '')}
                        </ul>
                    </div>
                    <label>Values</label>
                    <div className="row">
                        <ul className="list-group col-3">
                            {(this.state.result && this.state.result.fourier ? this.state.result.fourier.input.map((inp, i) =>
                                <li className="list-group-item" key={'srcval' + i}>{inp}</li>
                            ) : '')}
                        </ul>
                    </div>
                    <label>Times</label>
                    <div className="row">
                        <ul className="list-group col-3">
                            {(this.state.result && this.state.result.fourier ? this.state.result.fourier.times.map((t, i) =>
                                <li className="list-group-item" key={'srctimes' + i}>{t}</li>
                            ) : '')}
                        </ul>
                    </div>
                    <label>Re</label>
                    <div className="row">
                        <ul className="list-group col-3">
                            {(this.state.result && this.state.result.fourier ? this.state.result.fourier.re.map((r, i) =>
                                <li className="list-group-item" key={'srcre' + i}>{r}</li>
                            ) : '')}
                        </ul>
                    </div>
                    <label>Im</label>
                    <div className="row">
                        <ul className="list-group col-3">
                            {(this.state.result && this.state.result.fourier ? this.state.result.fourier.im.map((img, i) =>
                                <li className="list-group-item" key={'srcim' + i}>{img}</li>
                            ) : '')}
                        </ul>
                    </div>
                </article>
            </React.Fragment>
        );
    }
}