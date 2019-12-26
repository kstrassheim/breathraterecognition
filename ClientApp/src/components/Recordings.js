import React, { Component } from 'react';
import * as signalR from "@microsoft/signalr"
import Chart from 'chart.js'
import moment from 'moment'

export class Recordings extends Component {
    chart = null;
    constructor(props) {
        super(props);
        this.state = { selected: null, recordings: [] };
        this.change = this.change.bind(this);

        this.onpointerdown = this.onpointerdown.bind(this);
        this.onpointerup = this.onpointerup.bind(this);
        this.clearAnnotations = this.clearAnnotations.bind(this);
        this.addAnnotation = this.addAnnotation.bind(this);
    }

    async componentDidMount() {
        var recordings = await (await fetch('/api/Recording')).json();
        if (recordings.length > 0) {
            await this.loadRecording(recordings[0].id);
        }
        this.setState({ selectedId: 0, recordings: recordings })
    }

    async change(event) {
        await this.loadRecording(event.target.value);
    }

    async loadRecording(rid) {
        var r = await (await fetch(`/api/Recording/${rid}`)).json();
        this.setState({ selected: r });
        if (r) {
            if (!this.chart) {
                this.chart = this.initChart(r);
            }
            this.chart.data.datasets.splice(0, this.chart.data.datasets.length);
            this.chart.data.datasets.push({
                data: r.recordingMetrics.map((o) => { return { x: o.timestamp, y: o.value }; }),
                label: r && r.recordingMetrics && r.recordingMetrics.length > 0 ? r.recordingMetrics[0].port : '',
                borderColor: this.getRandomColor(),
                fill: false
            });

            this.chart.options.title.text = r.id;
            this.chart.update();
        }
    }

    getRandomColor() {
        var letters = '0123456789ABCDEF', color = '#';
        for (var i = 0; i < 6; i++) { color += letters[Math.floor(Math.random() * 16)]; }
        return color;
    }

    initChart(r) {
        return new Chart(document.getElementById("measurementChart"), {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                title: {
                    display: true,
                    text: ''
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        type: "time",
                        time: {
                            displayFormats: {
                                millisecond: 'HH:mm:ss.SSS',
                                second: 'HH:mm:ss',
                                minute: 'HH:mm',
                                hour: 'HH'
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Time'
                        }
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

    onpointerdown(evt) {
        console.log("pointer down");
        this.clearAnnotations()
        const points = this.chart.getElementsAtEventForMode(evt, 'index', { intersect: false })
        const label = this.chart.data.labels[points[0]._index]
        this.addAnnotation(label)
    }

    onpointerup(evt) {
        console.log("pointer up");
        const points = this.chart.getElementsAtEventForMode(evt, 'index', { intersect: false })
        const label = this.chart.data.labels[points[0]._index]
        this.addAnnotation(label)
    }

    clearAnnotations() {
        if (this.chart.options.annotation) {
            this.chart.options.annotation.annotations = [];
        }
    }

    addAnnotation(label) {
        const annotation = {
            scaleID: 'x-axis-0',
            type: 'line',
            mode: 'vertical',
            value: label,
            borderColor: 'red'
        };
        this.chart.options.annotation = this.chart.options.annotation || {};
        this.chart.options.annotation.annotations = this.chart.options.annotation.annotations || [];
        this.chart.options.annotation.annotations.push(annotation);
        this.chart.update();
    }

    render () {
    return (
        <div>
            <h1>Recordings</h1>
            <select id="selRecordings" className="form-control" onChange={this.change} value={this.state.selected ? this.state.selected.id : 0}>
                {this.state.recordings.map((r) =>
                    <option value={r.id} key={'rec' + r.id}>{r.name}</option>
                )}
            </select>
            <canvas id="measurementChart" onPointerUp={this.onpointerup} onPointerDown={this.onpointerdown}></canvas>
        </div>
    );
  }
}
