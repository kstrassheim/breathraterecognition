export class LowPassFilter {

    portSuffix = "LowPass";

    constructor(degree, popCallback) {
        this.degree = degree;
        this.buffer = [];
        this.popCallback = popCallback;
    }

    push(val) {
        this.buffer.push(val);
        if (this.buffer.length > 1 && this.popCallback) {
            this.popCallback(this.lowPass(this.buffer));
            if (this.buffer.length > this.degree) {
                this.buffer.splice(0, this.buffer.length - this.degree);
            }
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
        this.buffer.splice(0, this.buffer.length);
    }
}