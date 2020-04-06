import moment from 'moment';

export class TimedBuffer {

    constructor(secondsToKeep, bufferPopCallback) {
        this.buffer = [];
        this.secondsToKeep = secondsToKeep;
        this.bufferPopCallback = bufferPopCallback;
        this.timer = moment();
    }

    setExpiration(expiration) {
        if (!expiration || expiration < 1) { return; }
        this.secondsToKeep = expiration;
    }

    push(val) {
        if (this.buffer.length < 1) { this.timer = val.timestamp; }
        this.buffer.push(val);
        let dur = moment.duration(moment(val.timestamp).diff(this.timer)).asSeconds();
        if (dur > this.secondsToKeep) {
            this.bufferPopCallback(this.buffer);
            this.buffer.splice(0, this.buffer.length);
        }
    }

    clear() {
        this.buffer.splice(0, this.buffer.length);
    }
}