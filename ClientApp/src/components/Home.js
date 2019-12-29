import React, { Component } from 'react';
import * as signalR from "@microsoft/signalr"
import Chart from 'chart.js'
import moment from 'moment'

export class Home extends Component {
  static displayName = Home.name;
    chart = null;
    buffer = [];
    bufferSize = 5;

    constructor(props) {
        super(props);
        this.state = { recordingId: 0 };
        this.btnRecord_clicked = this.btnRecord_clicked.bind(this);
    }

    async btnRecord_clicked() {
        if (this.state.recordingId) {
            // stop recording
            this.setState({ recordingId: 0 });
        }
        else {
            var recording = await (await fetch('/api/Recording/0')).json();
            if (recording && recording.id > 0) {
                this.setState({ recordingId: recording.id });
            }
        }
    }

    componentDidMount = () => {
        //this.initChart('Server');
        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/measurement")
            .configureLogging(signalR.LogLevel.Information)
            .build();
        hubConnection.start()
            .then(() => console.log('Connection started!'))
            .catch(err => console.log('Error while establishing connection :('));
        hubConnection.on('measurement', (metric) => {
            this.addData(metric);
        });
    }

    getRandomColor() {
        var letters = '0123456789ABCDEF', color = '#';
        for (var i = 0; i < 6; i++) {color += letters[Math.floor(Math.random() * 16)];  }
        return color;
    }

    async saveMetrics(metrics) {
        if (this.state.recordingId > 0) {
            fetch(`/api/Recording/${this.state.recordingId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(metrics)
                }
            );
        }
    }

    addData(metric) {

        this.buffer.push(metric);

        if (this.buffer.length > this.bufferSize) {

            var first = this.buffer[0];
            // init chart if not available
            if (!this.chart) {
                this.chart = this.initChart(first.name);
            }

            // get dataset
            var dsa = this.chart.data.datasets.length > 0 ? this.chart.data.datasets.filter((d) => d.label === first.port) : null;
            var ds = dsa && dsa.length > 0 ? dsa[0] : null;
            if (!ds) {
                ds = {
                    data: [],
                    label: first.port,
                    borderColor: this.getRandomColor(),
                    fill: false
                }
                this.chart.data.datasets.push(ds);
            }

            // insert new values
            if (this.chart.options.title.text === first.name) {
                for (var i = 0; i < this.buffer.length; i++) {
                    ds.data.push({ x: this.buffer[i].timestamp, y: this.buffer[i].value });
                }

                this.saveMetrics(this.buffer);
            }

            // delete old values if expired
            if (moment.duration(moment().diff(ds.data[0].x)).asSeconds() > 10) { ds.data.splice(0, this.buffer.length); }

            this.chart.update();

            // delete buffer
            this.buffer.splice(0, this.buffer.length);
        }
    }

    initChart(name) {
        return new Chart(document.getElementById("measurementChart"), {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                title: {
                    display: true,
                    text: name
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        type: "time",
                        time: {
                            //parser: timeFormat,
                            //tooltipFormat: 'hh:mm:ss fff',
                            displayFormats: {
                                millisecond: 'HH:mm:ss.SSS',
                                second: 'HH:mm:ss',
                                minute: 'HH:mm',
                                hour: 'HH'
                            }
                            //tooltipFormat: 'll',
                            //minUnit: 'millisecond',
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Time'
                        },
                        //ticks: {
                        //    //min: 0,
                        //    //max: 100,

                        //    // forces step size to be 5 units
                        //    stepSize: 0.1 // <----- This prop sets the stepSize
                        //}
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Value'
                        }
                    }]
                }
            }
        });
    }


    render () {
    return (
        <div>
            <h1>Breath rate recognition</h1>
            <div>
                <input id="btnRecord" type="button" onClick={this.btnRecord_clicked} className="btn btn-outline-danger" value={(this.state.recordingId > 0 ? 'Stop' : 'Start')} />
            </div>
            <canvas id="measurementChart"></canvas>
        </div>
    );
  }
}
