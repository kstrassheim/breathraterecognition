import * as signalR from "@microsoft/signalr";
import moment from 'moment';

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

    constructor(onSignalCallbacks) {
        this.onSignalCallbacks = onSignalCallbacks;
    }

    async sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    async connect() {
        this.active = true;
        if (!this.demos || this.demos.length < 1) {
            this.demos = (await (await fetch("demo.json")).json());
        }

        for (let i = 0; i < this.demos.length; i++) {
            if (this.onSignalCallbacks) {
                let o = Object.assign({}, this.demos[i]);
                //o.name = this.demoHostName;
                //let t = o.timestamp;
                o.timestamp = new Date();
                if (Array.isArray(this.onSignalCallbacks)) {
                    this.onSignalCallbacks.forEach(f => f(o));
                }
                else {
                    this.onSignalCallbacks(this.demos[i]);
                }
                // sleep until next call
                let ms = i < this.demos.length - 1 ? moment(this.demos[i + 1].timestamp).diff(moment(this.demos[i].timestamp)).valueOf() : 40;
                await this.sleep(ms);
                if (!this.active) {
                    return;
                }
            }
        }
    }

    disconnect() {
        this.active = false;
    }
}