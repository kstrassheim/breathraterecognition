import moment from 'moment';
import { TimedBuffer } from '../services/timedbuffer';
import shortTimeFT from 'stft';

export class BrdFourier {

    constructor(processBufferSec, noiseSensity, avgCutAlgoToleranceSec, onResultCallback, onSelectCallback, onUnselectCallback, onReset) {
        this.noiseSensity = noiseSensity;
        this.avgCutAlgoToleranceSec = avgCutAlgoToleranceSec;
        this.processBuffer = new TimedBuffer(processBufferSec, this.processDsp.bind(this));
        this.onResultCallback = onResultCallback;
        this.onSelectCallback = onSelectCallback;
        this.onUnselectCallback = onUnselectCallback;
        this.onReset = onReset;

        //this.stft = shortTimeFT(1, this.bufferSize, this.onFreq);
        //this.istft = shortTimeFT(-1, this.bufferSize, this.onTime);
    }

    reset(useCallbacks) {
        this.currentValues = [];
        this.processBuffer.clear();
        if (useCallbacks && this.onReset) { this.onReset(); }
    }

    setProcessBufferSeconds(sec) {
        this.processBuffer.setExpiration(sec);
    }

    setAvgCutAlgoToleranceSec(v) {
        if (!v || v < 0) { return; }
        this.avgCutAlgoToleranceSec = v;
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

    processDsp(values) {
        if (this.onUnselectCallback) {this.onUnselectCallback(); }
        this.currentValues = values;
        shortTimeFT(1, this.currentValues.length, this.onFreq.bind(this))(new Float32Array(values.map(v => v.value)))
    }

    onFreq(re, im) {
        if (this.currentValues && this.currentValues.length > 0) {
            let ren = Array.from(re);
            let imn = Array.from(im);
            if (this.onSelectCallback) { this.onSelectCallback(this.currentValues[0], 'blue'); this.onSelectCallback(this.currentValues[this.currentValues.length - 1], 'blue'); }

            let maxI = 0;
            let maxIm = 0;

            for (let i = 0; i < imn.length;i++) {
                if (Math.abs(imn[i]) > Math.abs(maxIm)) {
                    maxI = i;
                    maxIm = imn[i];
                }
            }


            let ret = {};
            ret.avg = this.currentValues.reduce((a,b)=>a.value+b.value, 0) / this.currentValues.length;
            ret.period = 1 / Math.abs(ren[maxI]);
            ret.frequency = 1 / ret.period;
            ret.frequencyPerMinute = ret.frequency * 60;
            ret.breathRate = Math.round(ret.frequencyPerMinute);

            //this.istft(re, im);
            let frequencies = [];
            // not possible with map and float32 array
            for (let i = 0; i < ren.length; i++) { frequencies.push({ re: ren[i], im: imn[i] }); }
            ret.fourier = {
                input: this.currentValues.map(o => o.value),
                times: this.currentValues.map(o => o.timestamp),
                frequencies : frequencies.sort((a, b) => Math.abs(a.re) - Math.abs(b.re)),
                baseFrequency: frequencies[maxI],
                avgSignalPeriod: this.currentValues.reduce((p, c, i, a) => p + (i > 0 ? moment.duration(moment(c.timestamp).diff(moment(a[i - 1].timestamp))).asSeconds() : 0), 0) / ((this.currentValues.length || 2) - 1)
            }

            if (this.onResultCallback) {
                this.onResultCallback(ret);
            }
        }
        else {
            // else return invalid
            if (this.onResultCallback) {
                this.onResultCallback(null);
            }
        }
    }
}