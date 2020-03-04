import { StackedBuffer } from './stackedbuffer';
import moment from 'moment';
export class LowPassFilter {

    portSuffix = "_LowPass";
    constructor(bufferLength, degree) {
        this.outputBuffer = new StackedBuffer(bufferLength);
        this.outputBuffer.popCallback = [this.onPop.bind(this)];
        this.degree = degree;
        this.reset();
    }

    reset() {
        this.buffer = [];
        this.bufferSum = 0;
    }

    onPop(ret) {
        if (!this.popCallback) { return; }
        for (let i = 0; i < this.popCallback.length; i++) {
            this.popCallback[i](ret);
        }
    }

    push(val) {
        if (val && !Array.isArray(val)) val = [val];
        if (this.paused || this.filterName && val && val.length > 0 && val[0].name !== this.filterName || this.filterPort && val && val.length > 0 && val[0].port !== this.filterPort) { return; }
        val.forEach(v => {

            // clone object and push to buffer
            let o = Object.assign({}, v);
            o.port = o.port + this.portSuffix;

            // direct pop if low pass degree is disabed
            if (this.degree < 1) {
                this.outputBuffer.push(o, true);
                if (this.buffer.length > 0) { this.buffer.splice(0, this.buffer.length); }
                return;
            }

            this.bufferSum += o.value;
            this.buffer.push(o);

            // remove items that are over lp degree
            let toRemove = this.buffer.length > this.degree ? this.buffer.length - this.degree : 0;
            for (let i = 0; i < toRemove; i++) {
                if (i >= this.buffer.length) { continue; }
                this.bufferSum -= this.buffer[i].value;
                this.buffer.splice(0, 1);
            }

            // calculare avg of all lp items and return middle item in buffer
            let lpo = Object.assign({}, this.buffer && this.buffer.length > 0 ? this.buffer[Math.floor(this.buffer.length/2)] : o);
            lpo.value = this.bufferSum / (this.buffer.length > 0 ? this.buffer.length : 1);
            // push to output
            this.outputBuffer.push(lpo);
        });
    }

    changeSize(newSize) {
        this.outputBuffer.changeSize(newSize);
    }

    changeSensity(newSensity) {
        if (!newSensity || newSensity < 0) { return;  }
        this.degree = newSensity;
        this.reset();
    }

    clear() {
        this.outputBuffer.clear();
        this.buffer.splice(0, this.buffer.length);
    }
}