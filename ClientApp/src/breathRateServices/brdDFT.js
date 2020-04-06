import moment from 'moment';
import { TimedBuffer } from '../services/timedbuffer';
import { DFT } from '../services/dsp'

export class BrdDFT {
    static minfreq = 5;
    static maxfreq = 35;
    constructor(processBufferSec, noiseSensity, avgCutAlgoToleranceSec, onResultCallback, onSelectCallback, onUnselectCallback, onReset) {
        this.noiseSensity = noiseSensity;
        this.avgCutAlgoToleranceSec = avgCutAlgoToleranceSec;
        this.processBuffer = new TimedBuffer(processBufferSec, this.processDsp.bind(this));
        this.onResultCallback = onResultCallback;
        this.onSelectCallback = onSelectCallback;
        this.onUnselectCallback = onUnselectCallback;
        this.onReset = onReset;
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
        let t = Math.abs(moment.duration(moment(values[0].timestamp).diff(values[values.length - 1].timestamp)).asSeconds());
        let sampleRate = values.length / t;
        var dft = new DFT(values.length, sampleRate);
        dft.forward(values.map(v => v.value));

        let spectrum = [].slice.call(dft.spectrum).map((o, i) => { return { amplitude: o/2, frequency: dft.getBandFrequency(i), frequencyPerMinute: dft.getBandFrequency(i) * 60 }; });
        let spectrumShort = spectrum.filter(o => o.amplitude < 10000 && o.frequencyPerMinute >= BrdDFT.minfreq && o.frequencyPerMinute <= BrdDFT.maxfreq);;
        let avgFreq = spectrumShort.map(o => o.frequency * o.amplitude).reduce((a, b) => a + b) / spectrumShort.map(o => o.amplitude).reduce((a, b) => a + b);
        let avgFreqPerMinute = avgFreq * 60;

        let baseFrequency = avgFreq; // spectrum[dft.peakBand];


        if (this.onSelectCallback) { this.onSelectCallback(values[0], 'blue'); this.onSelectCallback(values[values.length - 1], 'blue'); }

        let ret = {};
        ret.avg = values.reduce((a, b) => a.value + b.value, 0) / values.length;
        ret.period = 1 / avgFreq;
        ret.frequency = avgFreq;
        ret.frequencyPerMinute = avgFreqPerMinute;
        ret.breathRate = Math.round(avgFreqPerMinute);

        ret.fourier = {
            samplePeriod: t,
            sampleRate : sampleRate,
            input: values.map(o => o.value),
            times: values.map(o => o.timestamp),
            spectrum: spectrum,
            spectrumShort: spectrumShort,
            baseFrequency: avgFreq,
            avgSignalPeriod: values.reduce((p, c, i, a) => p + (i > 0 ? moment.duration(moment(c.timestamp).diff(moment(a[i - 1].timestamp))).asSeconds() : 0), 0) / ((values.length || 2) - 1),
            re: [].slice.call(dft.real),
            im: [].slice.call(dft.imag),
            spec: [].slice.call(dft.spectrum)
        }

        if (this.onResultCallback) {
            this.onResultCallback(ret);
        }
    }
}