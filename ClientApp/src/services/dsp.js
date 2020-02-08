import moment from 'moment';
import { TimedBuffer } from '../services/timedbuffer';

export class Dsp {
    toleranceSec = 0.5;

    constructor(onResultCallback, onSelectCallback, onSelectAvgCallback) {
        this.processBuffer = new TimedBuffer(10, this.onProcessBufferPop.bind(this));
        this.onResultCallback = onResultCallback;
        this.onSelectCallback = onSelectCallback;
        this.onSelectAvgCallback = onSelectAvgCallback;
    }

    reset() {
        this.processBuffer.clear();
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

    getAvgValue(values) {
        let avg = 0;
        for (let i = 0; i < values.length; i++) { avg += values[i].value; }
        return avg / values.length;
    }

    processDsp(values) {
        if (!values && values.length < 1) { return; }
        let avg = this.getAvgValue(values);
        let v = values[0].value - avg;
        if (this.onSelectAvgCallback) { this.onSelectAvgCallback(values[0].timestamp, avg, values[values.length - 1].timestamp, 1); }
        let pick = null;
        for (let i = 1; i < values.length; i++) {
            if (Math.sign(values[i].value - avg) !== Math.sign(v)) {
                if (!pick) {
                    console.log(`first pick - sign ${Math.sign(values[i].value - avg)} - cmp sign ${Math.sign(v)} - val ${values[i].value} - v ${v} - avg ${avg} on ${i} of  ${values.length}`, values[i]);
                    pick = values[i];
                    v = pick.value - avg;
                    if (this.onSelectCallback) { this.onSelectCallback(pick.timestamp, 2); }
                }
                else {
                    var ret = moment.duration(moment(values[i].timestamp).diff(moment(pick.timestamp))).asSeconds();
                    if (ret > this.toleranceSec) {
                        if (this.onSelectCallback) { this.onSelectCallback(values[i].timestamp, 3); }
                        console.log(`second pick - sign ${Math.sign(values[i].value - avg)} - cmp sign ${Math.sign(v)} - val ${values[i].value} - v ${v} - avg ${avg} on ${i} of  ${values.length}`, values[i]);
                        let ret = Object.assign({}, values[i]);
                        ret.avgValue = avg;
                        ret.period = moment.duration(moment(values[i].timestamp).diff(moment(pick.timestamp))).asSeconds();
                        ret.frequency = 1 / ret.period;
                        ret.frequencyPerMinute = ret.frequency * 60;

                        if (this.onResultCallback) {
                            this.onResultCallback(ret);
                        }

                        return ret;
                    }
                    else {
                        console.log(`invalid second pick - sign ${Math.sign(values[i].value - avg)} - cmp sign ${Math.sign(v)} - val ${values[i].value} - v ${v}  - avg ${avg} on ${i} of  ${values.length}`, values[i]);
                    }
                }
            }
        }

        // else return invalid
        if (this.onResultCallback) {
            this.onResultCallback(null);
        }
    }
}