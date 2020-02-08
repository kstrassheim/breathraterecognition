
export class StackedBuffer {
    paused = false;
    filterName = '';
    filterPort = '';
    constructor(bufferSize, popCallback) {
        this.buffer = [];
        this.bufferSize = bufferSize;
        this.popCallback = popCallback ? (Array.isArray(popCallback) ? popCallback : [popCallback]) : [];
    }

    push(val, ignoreFilter) {
        if (val && !Array.isArray(val)) val = [val];
        if (!ignoreFilter && (this.paused || this.filterName && val && val.length > 0 && val[0].name !== this.filterName || this.filterPort && val && val.length > 0 && val[0].port !== this.filterPort)) return;
        this.buffer = this.buffer.concat(val);
        if (this.buffer.length >= this.bufferSize) {
            for (let i = 0; i < this.popCallback.length; i++) {
                this.popCallback[i](this.buffer);
            }
            this.clear();
        }
    }

    clear() {
        this.buffer.splice(0, this.buffer.length);
    }
}