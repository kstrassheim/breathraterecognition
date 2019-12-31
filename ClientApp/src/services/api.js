import * as signalR from "@microsoft/signalr";
import moment from 'moment';

export class Api {

    async getNewRecording() {
        return await (await fetch('/api/Recording/0')).json();
    }

    async getRecordings() {
       return await (await fetch(`/api/Recording`)).json();
    }

    async loadRecording(rid) {
        return await (await fetch(`/api/Recording/${rid}`)).json();
    }

    async saveRecording(recordingId, metrics) {
        await fetch(`/api/Recording/${recordingId}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metrics)
            }
        );
    }
}

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
        let api = new Api();
        let rs = await api.getRecordings();
        let dr = rs.filter(o => o.name === 'demo');
        if (dr && dr.length > 0) {
            this.demos = (await api.loadRecording(dr[0].id)).recordingMetrics;
        }
        
        while (this.active && this.demos) {
            if (this.demos && this.demos.length > 0) {
                for (let i = 0; i < this.demos.length; i++) {
                    if (this.onSignalCallbacks) {
                        let o = Object.assign({}, this.demos[i]);
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
        }
    }

    disconnect() {
        this.active = false;
    }
}