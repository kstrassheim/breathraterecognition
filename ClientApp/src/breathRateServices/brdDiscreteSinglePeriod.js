import moment from 'moment';
import { TimedBuffer } from '../services/timedbuffer';

export class BrdDiscreteSinglePeriod {

    constructor(processBufferSec, noiseSensity, avgCutAlgoToleranceSec, onResultCallback, onSelectCallback, onUnselectCallback, onReset) {
        this.noiseSensity = noiseSensity;
        this.avgCutAlgoToleranceSec = avgCutAlgoToleranceSec;
        this.defaultProcessBufferSeconds = processBufferSec;
        this.processBuffer = new TimedBuffer(processBufferSec, this.onProcessBufferPop.bind(this));
        this.onResultCallback = onResultCallback;
        this.onSelectCallback = onSelectCallback;
        this.onUnselectCallback = onUnselectCallback;
        this.onReset = onReset;
    }

    reset(useCallbacks) {
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

    onProcessBufferPop(values) {
        this.processDsp(values);
    }

    getAvgValue(values) {
        let avg = 0;
        for (let i = 0; i < values.length; i++) { avg += values[i].value; }
        return avg / values.length;
    }

    processDsp(values) {
        if (!values && values.length < 1) { return; }
        let avg = this.getAvgValue(values);
        let v = values[0].value - avg;

        if (this.onUnselectCallback) {
            this.onUnselectCallback();
        }

        if (this.onSelectCallback) {
            this.onSelectCallback(values[0], 'blue');
            this.onSelectCallback(values[values.length - 1], 'blue');
        }
        let pick = null;
        let pick2 = null;
        for (let i = 1; i < values.length; i++) {

            // noise detection
            let h = Math.abs(Math.abs(values[i].value) - avg);
            if (h > this.noiseSensity) {
                this.reset(true);
                return;
            }

            if (Math.sign(values[i].value - avg) !== Math.sign(v)) {
                if (!pick) {
                    console.log(`first pick - sign ${Math.sign(values[i].value - avg)} - cmp sign ${Math.sign(values[i].value)} - val ${values[i].value} - v ${v} - avg ${avg} on ${i} of  ${values.length}`, values[i]);
                    pick = values[i];
                    v = pick.value - avg;
                    if (this.onSelectCallback) { this.onSelectCallback(pick, 'red'); }
                }
                else {
                    let dur = moment.duration(moment(values[i].timestamp).diff(moment(pick.timestamp))).asSeconds();
                    if (dur > this.avgCutAlgoToleranceSec) {
                        if (!pick2) {
                            console.log(`second pick - sign ${Math.sign(values[i].value - avg)} - cmp sign ${Math.sign(values[i].value)} - val ${values[i].value} - v ${v} - avg ${avg} on ${i} of  ${values.length}`, values[i]);
                            pick2 = values[i];
                            v = pick2.value - avg;
                            if (this.onSelectCallback) { this.onSelectCallback(pick2, 'yellow'); }
                        }
                        else {
                            let dur2 = moment.duration(moment(values[i].timestamp).diff(moment(pick2.timestamp))).asSeconds();
                            if (dur2 > this.avgCutAlgoToleranceSec) {
                                if (this.onSelectCallback) { this.onSelectCallback(values[i], 'green'); }
                                console.log(`third pick - sign ${Math.sign(values[i].value - avg)} - cmp sign ${Math.sign(values[i].value)} - val ${values[i].value} - v ${v} - avg ${avg} on ${i} of  ${values.length}`, values[i]);
                                let ret = Object.assign({}, values[i]);
                                ret.avg = avg;
                                ret.period = moment.duration(moment(values[i].timestamp).diff(moment(pick.timestamp))).asSeconds();

                                ret.frequency = 1 / ret.period;
                                ret.frequencyPerMinute = ret.frequency * 60;
                                ret.breathRate = Math.round(ret.frequencyPerMinute);
                                
                                if (this.onResultCallback) {
                                    this.onResultCallback(ret);
                                }

                                // attach process buffer seconds
                                this.setProcessBufferSeconds(Math.round(ret.period * 1.5));

                                return ret;
                            }
                        }
                    }
                }
            }
        }

        //if value not found set process buffer seconds to default
        this.setProcessBufferSeconds(Math.round(this.processBuffer.secondsToKeep * 1.5));
  
    }
}