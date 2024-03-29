﻿
export class StackedBuffer {
    paused = false;
    filterName = '';
    filterPort = '';
    constructor(bufferSize, popCallback) {
        this.buffer = [];
        this.bufferSize = bufferSize;
        this.popCallback = [popCallback];
    }

    push(val, ignoreFilter) {
        if (val && !Array.isArray(val)) val = [val];
        if (!ignoreFilter && (this.paused || this.filterName && val && val.length > 0 && val[0].name !== this.filterName || this.filterPort && val && val.length > 0 && val[0].port !== this.filterPort)) return;
        // direct pop if buffer too small
        if (this.bufferSize < 1) {
            if (this.popCallback && Array.isArray(this.popCallback)) {
                for (let i = 0; i < this.popCallback.length; i++) {
                    this.popCallback[i](val);
                }
            }

            return;
        }

        val.forEach(o => {
            this.buffer.push(o);
            if (this.buffer.length >= this.bufferSize) {
                var pop = this.buffer.splice(0, this.buffer.length); // Object.assign({}, this.buffer);
                this.clear();
                if (this.popCallback && Array.isArray(this.popCallback)) {
                    for (let i = 0; i < this.popCallback.length; i++) {
                        this.popCallback[i](pop);
                    }
                }
            }
        });
    }

    changeSize(newSize) {
        if (!newSize || newSize < 0) {
            return;
        }

        this.bufferSize = newSize;
    }

    clear() {
        return this.buffer.splice(0, this.buffer.length);
    }
}