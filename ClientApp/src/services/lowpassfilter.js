export class LowPassFilter {

    constructor(bufferLength, degree, popCallback) {
        this.bufferLength = bufferLength;
        this.degree = degree;
        this.buffer = [];
        this.popCallback = popCallback;
    }

    push(val) {
        this.buffer.push(val);
        if (this.buffer.length > 1 && this.popCallback) {
            this.popCallback(this.lowPass(this.buffer));
            if (this.buffer.length >= this.bufferLength) {
                this.buffer.splice(0, 1);
            }
        }
    }

    lowPass(values) {
        let value = values[0].value; 
        for (var i = 1; i < values.length; ++i) {
            value += (values[i].value - value) / this.degree;
        }
        values[values.length - 1].value = value;
        return values[values.length - 1];
    }

    clear() {
        this.buffer.splice(0, this.buffer.length);
    }
}