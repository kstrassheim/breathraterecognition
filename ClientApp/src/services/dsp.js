import moment from 'moment';
//import { TimedBuffer } from './timedbuffer';

export class Dsp {
    static minfreq = 5;
    static maxfreq = 40;
    toleranceSec = 0.5;

    constructor(expiration, onResultCallback, onSelectCallback, onUnselectCallback) {
        this.expiration = expiration;
        this.minPicks = Math.floor(expiration / 60 * Dsp.minfreq);
        this.minPicks = this.minPicks > 3 ? this.minPicks : 4;
        //this.processBuffer = new TimedBuffer(60, this.onProcessBufferPop.bind(this));
        this.reset();
        this.onResultCallback = onResultCallback;
        this.onSelectCallback = onSelectCallback;
        this.onUnselectCallback = onUnselectCallback;
    }

    reset() {
        this.buffer = [];
        this.bufferSum = 0;
        this.min = 0;
        this.max = 0;
        this.sgn = -1;
        this.timestampReset = moment();
        //this.processBuffer.clear();
    }

    process(values) {
        if (!Array.isArray(values)) { values = [values]; }
        // push one by one value
        for (let i = 0; i < values.length; i++) {
            this.processValue(values[i]);
        }
    }

    processValue(val) {
        if (this.buffer.length < 1) {
            val.picked = true;
            this.buffer.push(val);
            this.bufferSum = this.min = this.max = val.value;
            return;
        };

        let removeItems = 0;
        for (let i = 0; i < this.buffer.length; i++) {
            let distance = moment.duration(moment(val.timestamp).diff(this.buffer[i].timestamp)).asSeconds();
            if (distance > this.expiration) {
                removeItems++;
                this.bufferSum = this.bufferSum - this.buffer[i].value;
                if (this.onUnselectCallback) { this.onUnselectCallback(this.buffer[i]); }
            }
            else {
                break;
            }
        }

        this.buffer.splice(0, removeItems);
        console.log(`Deleted ${removeItems} items`);
        this.bufferSum = this.bufferSum + val.value;
        if (this.min > val.value) { this.min = val.value; }
        if (this.max < val.value) { this.max = val.value; }
        this.buffer.push(val);

        let timestampOfLastPicked = this.timestampReset;
        for (let i = this.buffer.length - 1; i > 0; i--) {
            if (this.buffer[i].picked) {
                timestampOfLastPicked = this.buffer[i].timestamp; break;
            }
        }

        let distanceToLastPicked = moment.duration(moment(val.timestamp).diff(timestampOfLastPicked)).asSeconds();
        let avg = (this.bufferSum / this.buffer.length);
        let relVal = val.value - (this.bufferSum / this.buffer.length);
        let valSgn = Math.sign(relVal);

        if (valSgn !== this.sgn && distanceToLastPicked > this.toleranceSec) {
            this.sgn = valSgn;
            val.picked = true;
            if (this.onSelectCallback) { this.onSelectCallback(val); }
            this.processDsp();
        }
    }

    processDsp() {
        let picked = this.buffer.filter(o => o.picked);
        if (picked.length > this.minPicks) {
            let avg = this.bufferSum / this.buffer.length;
            let distance = moment.duration(moment(picked[picked.length - 1].timestamp).diff(picked[0].timestamp)).asSeconds();
            //let pickedCount = this.buffer.filter(o => o.picked).length - 1; // 1 pick is to remove here due to timespan

            let ret = Object.assign({}, picked[picked.length - 1]);
            ret.avg = avg;
            ret.period = distance / (picked.length - 1);
            ret.frequency = 1 / ret.period;
            ret.frequencyPerMinute = ret.frequency * 60;

            // only return valid frequencies
            if (ret.frequencyPerMinute >= Dsp.minfreq && ret.frequencyPerMinute <= Dsp.maxfreq) {
                if (this.onResultCallback) {
                    this.onResultCallback(ret);
                }
            }
        }
    }
}