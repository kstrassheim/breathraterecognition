import React, { Component } from 'react';
import moment from 'moment';
import { Dsp as SvcDsp } from '../services/dsp';

export class Dsp extends Component {

    constructor(props) {
        super(props);
        this.dsp = new SvcDsp(this.onDspResult.bind(this));
        this.state = { result: this.dsp.result };
    }

    process(values) {
        this.dsp.process(values);
    }


    onDspResult(result) {
        this.setState({ result: result});
    }


    render() {
        return (
            <article>
                <section>
                    <h3>Signal Rate</h3>
                    <div>
                        <label>Avg Signal Distance:</label><span>{Math.round(this.state.result.avgSignalDistance * 100) / 100}s</span>
                    </div>
                </section>
                <label>Frequency</label>
                <div className="row">
                    <ul className="list-group col-3">
                        {Array.from(this.state.result.input).map((b, i) =>
                            <li className="list-group-item" key={'buffer' + i}>{b}</li>
                        )}
                    </ul>
                    <ul className="list-group col-3">
                        {Array.from(this.state.result.times).map((t, i) =>
                            <li className="list-group-item" key={'time' + i}>{moment(t).format('HH:mm:ss.SSS')}</li>
                        )}
                    </ul>
                    <ul className="list-group col-3">
                        {Array.from(this.state.result.frequencies).map((f, i) =>
                            <li className="list-group-item" key={'freq' + i}>{f}</li>
                        )}
                    </ul>
                </div>
            </article>
        );
    }
}