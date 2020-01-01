import moment from 'moment';
import { StackedBuffer } from '../services/stackedbuffer';
import shortTimeFT from 'stft';

export class Dsp {

    bufferSize = 64;

    constructor(onResultCallback) {
        this.processBuffer = new StackedBuffer(this.bufferSize, this.onProcessBufferPop.bind(this));
        this.onFreq = this.onFreq.bind(this);
        this.onTime = this.onTime.bind(this);
        this.stft = shortTimeFT(1, this.bufferSize, this.onFreq);
        this.istft = shortTimeFT(-1, this.bufferSize, this.onTime);
        this.onResultCallback = onResultCallback;
        this.result = {
            avgSignalPeriod:0.0,
            baseFrequency: { re: 0, im: 0 },
            input: [],
            times: [],
            frequencies: []
        };
    }

    process(values) {
        // push one by one value
        if (Array.isArray(values)) {
            for (let i = 0; i < values.length; i++) {
                this.processBuffer.push(values[i]);
            }
        }
        else {
            this.processBuffer.push(values);
        }
    }

    onProcessBufferPop(values) { this.processDsp(values); }

    processDsp(values) {
        this.stft(new Float32Array(values.map(v => v.value)));
        this.result.input = values.map(o=>o.value);
        this.result.times = values.map(o =>o.timestamp);
        this.result.avgSignalPeriod = values.reduce((p, c, i, a) => p + (i > 0 ? moment.duration(moment(c.timestamp).diff(moment(a[i - 1].timestamp))).asSeconds() : 0), 0) / ((values.length || 2) - 1);
    }

    onFreq(re, im) {
        //this.istft(re, im);
        this.result.frequencies = [];
        // not possible with map and float32 array
        for (let i = 0; i < re.length; i++) {
            this.result.frequencies.push({ re: re[i], im: im[i] });
        }

        this.returnResult();
        
    }

    onTime(v) {
        //this.result.frequencies = v;
    }

    returnResult() {
        // set base frequncy
        this.result.frequencies = this.result.frequencies.sort((a, b) => Math.abs(a.re) - Math.abs(b.re));
        this.result.baseFrequency = this.result.frequencies[0];

        if (this.onResultCallback) {
            this.onResultCallback(this.result);
        }
    }
}