import moment from 'moment';
import shortTimeFT from 'stft'

export class Dsp {

    static bufferSize = 128;

    constructor(onResultCallback) {
        this.onFreq = this.onFreq.bind(this);
        this.onTime = this.onTime.bind(this);
        this.stft = shortTimeFT(1, Dsp.bufferSize, this.onFreq);
        this.istft = shortTimeFT(-1, Dsp.bufferSize, this.onTime);
        this.onResultCallback = onResultCallback;

        this.result = {
            avgSignalDistance: 0,
            input: [],
            times:[],
            frequencies:[]
        };
    }

    process(values) {
        this.stft(values.map(o => o.value));
        this.result.input = values.map(o=>o.value);
        this.result.times = values.map(o =>o.timestamp);
        this.result.avgSignalDistance = values.reduce((p, c, i, a) => p + (i > 0 ? moment.duration(moment(c.timestamp).diff(moment(a[i - 1].timestamp))).asSeconds() : 0), 0) / ((values.length || 2) - 1);
    }

    onFreq(re, im) {
        this.istft(re, im);
    }

    onTime(v) {
        this.result.frequencies = v;
        this.returnResult();
    }

    returnResult() {
        if (this.onResultCallback) {
            this.onResultCallback(this.result);
        }
    }
}