
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
        if (!ignoreFilter && (this.paused || this.filterName && val && val.name !== this.filterName || this.filterPort && val && val.port !== this.filterPort)) return;
        this.buffer.push(val);
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