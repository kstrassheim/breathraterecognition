import moment from 'moment';

export class TimedBuffer {

    constructor(secondsToKeep, bufferPopCallback) {
        this.buffer = [];
        this.secondsToKeep = secondsToKeep;
        this.bufferPopCallback = bufferPopCallback;
        this.timer = moment();
    }

    push(val) {
        if (this.buffer.length < 1) { this.timer = moment(); }
        this.buffer.push(val);
        let mm = moment().format();
        let tm = this.timer.format();
        let dur = moment.duration(moment().diff(this.timer)).asSeconds();
        if (moment.duration(moment().diff(this.timer)).asSeconds() > this.secondsToKeep) {
            this.bufferPopCallback(this.buffer);
            this.buffer.splice(0, this.buffer.length);
        }
    }

    clear() {
        this.buffer.splice(0, this.buffer.length);
    }
}