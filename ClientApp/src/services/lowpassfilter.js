import { StackedBuffer } from './stackedbuffer';
export class LowPassFilter extends StackedBuffer {

    portSuffix = "_LowPass";
    constructor(bufferLength, degree, popCallback) {
        super(bufferLength, popCallback);
        this.degree = degree;
        this.filterBuffer = [];
        this.popCallback = popCallback ? (Array.isArray(popCallback) ? popCallback : [popCallback]) : [];
    }

    push(val) {
        if (val && !Array.isArray(val)) val = [val];
        if (this.paused || this.filterName && val && val.length > 0 && val[0].name !== this.filterName || this.filterPort && val && val.length > 0 && val[0].port !== this.filterPort) return;
        this.filterBuffer = this.filterBuffer.concat(val);
        let lpv = this.lowPass(this.filterBuffer);
        super.push(lpv, true);

        if (this.filterBuffer.length > this.degree) {
            this.filterBuffer.splice(0, this.filterBuffer.length - this.degree);
        }
    }

    lowPass(values) {
        let value = values[0].value; 
        for (var i = 1; i < values.length; ++i) {
            value += (values[i].value - value) / this.degree;
        }
        // get centered array value
        let ret = Object.assign({}, values[Math.floor(values.length / 2)]);
        ret.port = ret.port + this.portSuffix;
        ret.value = value;
        return ret;
    }

    clear() {
        super.clear();
        this.filterBuffer.splice(0, this.filterBuffer.length);
    }
}