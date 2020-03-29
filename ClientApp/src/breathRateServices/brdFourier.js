import moment from 'moment';
import { TimedBuffer } from '../services/timedbuffer';
import { FFT } from '../services/dsp'

export class BrdFourier {
    static minfreq = 3;
    static maxfreq = 60;
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
        // find next 2 potency for apply FFT
        let pot = 2;
        while (pot < values.length) {
            pot = pot << 1;
        }

        pot = pot >> 1;
        values = values.slice(0, pot);

        if (this.onUnselectCallback) {this.onUnselectCallback(); }
        this.currentValues = values;
        let t = Math.abs(moment.duration(moment(this.currentValues[0].timestamp).diff(this.currentValues[this.currentValues.length - 1].timestamp)).asSeconds());
        let sampleRate = this.currentValues.length / t;
        var fft = new FFT(this.currentValues.length, sampleRate);
        fft.forward(this.currentValues.map(v=>v.value));
        this.onFreq(fft.real, fft.imag, fft.spectrum);
        
        //shortTimeFT(1, this.currentValues.length, this.onFreq.bind(this))(new Float32Array(values.map(v => v.value)))
    }

    onFreq(re, im, spec) {
        if (this.currentValues && this.currentValues.length > 0) {
            
            //let ren = Array.from(re); let imn = Array.from(im);
            let amplitudes = re.map((r, i) => Math.sqrt(r * r + im[i] * im[i])).slice(0, spec.length);
            let phases = amplitudes.map((a, i) => im[i] / a);
            let frequencies =  phases.map(p => p);


            let maxAmplitude = Math.max.apply(null, amplitudes);
            let maxAmpIndex = amplitudes.indexOf(maxAmplitude);
            let baseFrequency = spec[maxAmpIndex];

            // retry again while frequency with highest amplitude not in breath range
            while (amplitudes.length > 1 && (baseFrequency > BrdFourier.maxfreq || baseFrequency < BrdFourier.minfreq)) {
                amplitudes = amplitudes.filter(o => o !== maxAmplitude);
                spec = spec.filter(o => o !== baseFrequency); 
                maxAmplitude = Math.max.apply(null, amplitudes);
                maxAmpIndex = amplitudes.indexOf(maxAmplitude);
                baseFrequency = spec[maxAmpIndex];
            }

            //if (baseFrequency > this.ma)

            //let pasn = fsn.map(f => Math.asin(f));
            //let facn = fcn.map(f => Math.acos(f));

            if (this.onSelectCallback) { this.onSelectCallback(this.currentValues[0], 'blue'); this.onSelectCallback(this.currentValues[this.currentValues.length - 1], 'blue'); }

            //let maxI = 0;
            //let maxA = 0;

            //for (let i = 0; i < imn.length;i++) {
            //    if (Math.abs(amplitudes[i]) > Math.abs(maxA)) {
            //        maxI = i;
            //        maxA = amn[i];
            //    }
            //}


            let ret = {};
            ret.avg = this.currentValues.reduce((a,b)=>a.value+b.value, 0) / this.currentValues.length;
            ret.period = 1 / baseFrequency;
            ret.frequency = baseFrequency / 60;
            ret.frequencyPerMinute = baseFrequency;
            ret.breathRate = Math.round(ret.frequencyPerMinute);

            //this.istft(re, im);
            let freq = [];
            // not possible with map and float32 array
            for (let i = 0; i < spec.length; i++) { freq.push({ re: spec[i], im: amplitudes[i] }); }
            ret.fourier = {
                input: this.currentValues.map(o => o.value),
                times: this.currentValues.map(o => o.timestamp),
                frequencies: freq,
                baseFrequency: { re: re[1], im: im[1] },
                avgSignalPeriod: this.currentValues.reduce((p, c, i, a) => p + (i > 0 ? moment.duration(moment(c.timestamp).diff(moment(a[i - 1].timestamp))).asSeconds() : 0), 0) / ((this.currentValues.length || 2) - 1)
            }

            if (this.onResultCallback) {
                this.onResultCallback(ret);
            }
            // set process buffer secs to 1.5 amount of current rate
            this.setProcessBufferSeconds(Math.round(ret.period * 1.5));
        }
        else {
            // else return invalid
            if (this.onResultCallback) {
                this.onResultCallback(null);
            }

            // increase process buffer if failed
            this.setProcessBufferSeconds(Math.round(this.processBuffer.secondsToKeep * 1.5));
        }
    }
}