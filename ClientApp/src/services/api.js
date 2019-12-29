import * as signalR from "@microsoft/signalr";

export class Api {

    async getNewRecording() {
        return await (await fetch('/api/Recording/0')).json();
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