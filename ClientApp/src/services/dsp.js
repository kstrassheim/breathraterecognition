import moment from 'moment';
import shortTimeFT from 'stft';

export class Dsp {

    static bufferSize = 64;

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
            frequencies: [],
            filtered:[]
        };
    }

    getAvgDistanceFromValues(values) {
        return values.reduce((p, c, i, a) => p + (i > 0 ? moment.duration(moment(c.timestamp).diff(moment(a[i - 1].timestamp))).asSeconds() : 0), 0) / ((values.length || 2) - 1);
    }

    //smoothArray(values, smoothing) {
    //    var value = values[0].value; // start with the first input
    //    var ret = [value];
    //    for (var i = 1; i < values.length; ++i) {
    //        var currentValue = values[i].value;
    //        value += (currentValue - value) / smoothing;
    //        ret.push(value);
    //    }

    //    return ret;
    //}

    process(values) {
        //let filtered = this.smoothArray(values, 16);
        this.stft(values);
        this.result.input = values.map(o=>o.value);
        this.result.times = values.map(o =>o.timestamp);
        this.result.avgSignalDistance = this.getAvgDistanceFromValues(values);
        //this.result.filtered = values.map((o, i) => { return { timestamp: o.timestamp, port: o.port, value: filtered[i] }; })
    }

    onFreq(re, im) {
        this.istft(re, im);
        this.result.frequencies = re;
    }

    onTime(v) {
        //this.result.frequencies = v;
        this.returnResult();
    }

    returnResult() {
        if (this.onResultCallback) {
            this.onResultCallback(this.result);
        }
    }
}