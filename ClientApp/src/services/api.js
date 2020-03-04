import * as signalR from "@microsoft/signalr";
import moment from 'moment';
import { StackedBuffer } from './stackedbuffer'

export class SignalApi {

    constructor(onSignalCallbacks) {
 
        //this.initChart('Server');
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/measurement")
            .configureLogging(signalR.LogLevel.Information)
            .build();
        this.onSignalCallbacks = onSignalCallbacks;
    }

    connect() {
        this.hubConnection.start()
            .then(() => console.log('Signal Connection started!'))
            .catch(err => console.log('Error while establishing connection :('));
        this.hubConnection.on('measurement', (metric) => {
            if (this.onSignalCallbacks) {
                if (Array.isArray(this.onSignalCallbacks)) {
                    this.onSignalCallbacks.forEach(f => f(metric));
                }
                else {
                    this.onSignalCallbacks(metric);
                }
            }
        });
    }

    disconnect() {
        this.hubConnection.stop().then(() => console.log('Signal Connection closed!'));
    }
}

export class DemoApi {

    active = false;
    demos = null;

    constructor(bufferSize, onSignalCallbacks) {
        this.demoBuffer = new StackedBuffer(bufferSize);
        this.onSignalCallbacks = onSignalCallbacks;
    }

    onBufferSizeChanged(v) {
        if (v < 1) { return; }
        this.demoBuffer.changeSize(v)
    }

    async sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    async connect() {
        this.active = true;
        if (!this.demos || this.demos.length < 1) {
            this.demos = (await (await fetch("demo.json")).json());
        }
        //let isSGArray = Array.isArray(this.onSignalCallbacks);
        
        this.demoBuffer.popCallback = this.onSignalCallbacks;

        while (this.active && this.demos) {
            if (this.demos && this.demos.length > 0) {
                let ms = 0;
                for (let i = 0; i < this.demos.length; i++) {
                    //if (this.onSignalCallbacks) {
                    let o = Object.assign({}, this.demos[i]);
                    //o.name = this.demoHostName;
                    //let t = o.timestamp;
                    //o.timestamp = new Date();
                    this.demoBuffer.push(o);
                    // sleep until next call
                    ms += i < this.demos.length - 1 ? moment(this.demos[i + 1].timestamp).diff(moment(this.demos[i].timestamp)).valueOf() : 40;
                    // sleep only every buffer sync interval
                    if (i % this.demoBuffer.bufferSize === 0) {
                        await this.sleep(ms);
                        ms = 0;
                    }
                        
                    if (!this.active) {
                        return;
                    }
                    //}
                }
            }
            this.demoBuffer.clear();
        }
    }

    disconnect() {
        this.demoBuffer.clear();
        this.active = false;
    }
}