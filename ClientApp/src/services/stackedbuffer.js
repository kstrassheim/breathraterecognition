
export class StackedBuffer {

    constructor(bufferSize, bufferPopCallback) {
        this.buffer = [];
        this.bufferSize = bufferSize;
        this.bufferPopCallback = bufferPopCallback;
    }

    push(val) {
        this.buffer.push(val);
        if (this.buffer.length >= this.bufferSize && this.bufferPopCallback) {
            this.bufferPopCallback(this.buffer);
            this.clear();
        }
    }

    clear() {
        this.buffer.splice(0, this.buffer.length);
    }
}