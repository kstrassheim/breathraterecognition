import moment from 'moment';
//import { TimedBuffer } from './timedbuffer';

export class Dsp {
    static minfreq = 5;
    static maxfreq = 40;
    toleranceSec = 1.5;

    constructor(expiration, noiseSensity, onResultCallback, onSelectCallback, onUnselectCallback, onReset) {
        this.expiration = expiration;
        this.noiseSensity = noiseSensity;
        this.minPicks = Math.floor(expiration / 60 * Dsp.minfreq);
        this.minPicks = this.minPicks > 3 ? this.minPicks : 4;
        //this.processBuffer = new TimedBuffer(60, this.onProcessBufferPop.bind(this));
        this.reset();
        this.onResultCallback = onResultCallback;
        this.onSelectCallback = onSelectCallback;
        this.onUnselectCallback = onUnselectCallback;
        this.onReset = onReset;
    }

    setNoiseSensity(noiseSensity) {
        console.log(`Noise Sensity set to ${noiseSensity}`);
        this.noiseSensity = noiseSensity;

    }

    reset() {
        this.buffer = [];
        this.bufferSum = 0;
        //this.min = null;
        //this.max = null;
        this.sgn = -1;
        this.timestampReset = moment();
        if (this.onReset) { this.onReset(); }
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
            this.bufferSum = val.value;
            return;
        };

        let removeItems = 0;
        for (let i = 0; i < this.buffer.length; i++) {
            let distance = moment.duration(moment(val.timestamp).diff(this.buffer[i].timestamp)).asSeconds();
            if (distance > this.expiration) {
                removeItems++;
                this.bufferSum = this.bufferSum - this.buffer[i].value;
                if (this.onUnselectCallback) { this.onUnselectCallback(this.buffer[i]); }
                //if (this.buffer[i] === this.min) {
                //    console.log(`min ${this.min.value} outdated`);
                //    this.min = null;
                //}
                //else if (this.buffer[i] === this.max) {
                //    console.log(`max ${this.max.value} outdated`);
                //    this.max = null;
                //}
            }
            else {
                break;
            }
        }

        this.buffer.splice(0, removeItems);
        //console.log(`Deleted ${removeItems} items`);

        //if (!this.min || !this.max) {
        //    console.log(`Getting new min or max`);
        //    for (let i = 0; i < this.buffer.length; i++) {
        //        //if (!this.min || this.buffer[i].value < this.min.value) {
        //        //    this.min = this.buffer[i];
        //        //    console.log(`new min found ${this.buffer[i].value}`);
        //        //}

        //        //if (!this.max || this.buffer[i].value > this.max.value) {
        //        //    this.max = this.buffer[i];
        //        //    console.log(`new max found ${this.buffer[i].value}`);
        //        //}
        //    }
        //}

        if (this.buffer.length > 2) {
            //let span = this.max.value - this.min.value;
            let avg = this.bufferSum / this.buffer.length;
            let h = Math.abs(Math.abs(val.value) - avg);
            if (h > this.noiseSensity) {
                this.reset();
                return;
            }
        }

        this.bufferSum = this.bufferSum + val.value;
        //if (!this.min || this.min.value > val.value) {
        //    this.min = val;
        //    //console.log(`new min ${val.value}`);
        //}
        //if (!this.max || this.max.value < val.value) {
        //    this.max = val;
        //    //console.log(`new max ${val.value}`);
        //}
        this.buffer.push(val);

        let timestampOfLastPicked = this.timestampReset;
        for (let i = this.buffer.length - 1; i > 0; i--) {
            if (this.buffer[i].picked) {
                timestampOfLastPicked = this.buffer[i].timestamp; break;
            }
        }

        let distanceToLastPicked = moment.duration(moment(val.timestamp).diff(timestampOfLastPicked)).asSeconds();
        //let avg = (this.bufferSum / this.buffer.length);
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