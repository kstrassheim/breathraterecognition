import { StackedBuffer } from './stackedbuffer';
import moment from 'moment';
export class LowPassFilter {

    portSuffix = "_LowPass";
    constructor(bufferLength, degree) {
        this.stackedBuffer = new StackedBuffer(bufferLength);
        this.stackedBuffer.popCallback = [this.onPop.bind(this)];
        this.degree = degree;
        this.filterBuffer = [];
    }

    onPop(ret) {
        if (!this.popCallback) { return; }
        for (let i = 0; i < this.popCallback.length; i++) {
            this.popCallback[i](ret);
        }
    }

    push(val) {
        if (val && !Array.isArray(val)) val = [val];
        if (this.paused || this.filterName && val && val.length > 0 && val[0].name !== this.filterName || this.filterPort && val && val.length > 0 && val[0].port !== this.filterPort) {
            return;
        }

        if (this.degree < 1) {
            let ret = Object.assign({}, val[0]);
            ret.port = ret.port + this.portSuffix;
            this.onPop([ret]);
            this.clear();
            return;
        }

        if (val.length < 2) {
            this.filterBuffer.push(val[0]);
        }
        else {
            this.filterBuffer = this.filterBuffer.concat(val);
        }

      
        if (this.filterBuffer.length > this.degree) {
            let len = this.filterBuffer.length - this.degree;
            for (let i = 0; i < len; i++) {
                let lpv = this.lowPass(this.filterBuffer);
                this.stackedBuffer.push(lpv, true);
                this.filterBuffer.splice(0, 1);
            }
        }
    }

    changeSize(newSize) {
        this.stackedBuffer.changeSize(newSize);
        this.bufferSize = newSize;
    }

    changeSensity(newSensity) {
        if (!newSensity || newSensity < 0) {
            return;
        }

        this.degree = newSensity;
    }

    lowPass(values) {
        let avg = values.map(o=>o.value).reduce((a, b) => a + b, 0) / values.length;
        // get centered array value
        let pickIndex =  Math.floor(values.length / 2);
        let ret = Object.assign({}, values[pickIndex]);
        ret.port = ret.port + this.portSuffix;
        ret.value = avg;
        return ret;
    }

    clear() {
        this.stackedBuffer.clear();
        this.filterBuffer.splice(0, this.filterBuffer.length);
    }
}