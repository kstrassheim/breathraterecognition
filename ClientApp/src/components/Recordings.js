import React, { Component } from 'react';
import * as signalR from "@microsoft/signalr"
import Chart from 'chart.js'
import 'chartjs-plugin-annotation';
import moment from 'moment'

export class Recordings extends Component {
    chart = null;
    currentTrainingRangeStart = null;
    constructor(props) {
        super(props);
        this.state = { selected: null, recordings: [] };
        this.change = this.change.bind(this);
        this.onpointerdown = this.onpointerdown.bind(this);
        this.onpointerup = this.onpointerup.bind(this);
    }

    async componentDidMount() {
        var recordings = await (await fetch('/api/Recording')).json();
        if (recordings.length > 0) {
            await this.loadRecording(recordings[0].id);
            this.setState({ recordings: recordings })
        }
    }

    async change(event) {
        await this.loadRecording(event.target.value);
    }

    async loadRecording(rid) {
        var r = await (await fetch(`/api/Recording/${rid}`)).json();
        this.setState({ selected: r });
        if (r) {
            this.initChart(r);
            this.updateAnnotations();
        }
    }

    async addTraining(t) {
        // todo check if overlapping 
        var ret = await (await fetch(`/api/Training/${this.state.selected.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(t)
        })).json();
        if (ret != null) {
            this.state.selected.trainings = this.state.selected.trainings || [];
            this.state.selected.trainings.push(ret);
            this.updateAnnotations();
        }
    }

    async removeTraining(tid) {
        await fetch(`/api/Training/${tid}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        // todo delete training data from array
        for (let i = 0; i < this.state.selected.trainings.length; i++) {
            if (this.state.selected.trainings[i].id === tid) {
                this.state.selected.trainings.splice(i, 1);
                break;
            }
        }

        this.updateAnnotations();
    }

    updateAnnotations() {
        if (this.state.selected && this.state.selected.trainings) {
            // clear annotations
            this.chart.options.annotation.annotations = [];

            // add annotations from training data
            for (let i = 0; i < this.state.selected.trainings.length; i++) {
                let tid = this.state.selected.trainings[i].id;
                this.chart.options.annotation.annotations.push({
                    id: `${this.state.selected.trainings[i].id}l`,
                    scaleID: 'x-axis-0',
                    type: 'line',
                    mode: 'vertical',
                    value: this.state.selected.trainings[i].start,
                    borderColor: 'red',
                    borderWidth: 3,
                    onDblclick: function () {
                        this.removeTraining(tid);
                    }.bind(this)
                });
                this.chart.options.annotation.annotations.push({
                    id: `${this.state.selected.trainings[i].id}r`,
                    scaleID: 'x-axis-0',
                    type: 'line',
                    mode: 'vertical',
                    value: this.state.selected.trainings[i].end,
                    borderColor: 'green',
                    borderWidth: 3,
                    onDblclick: function () {
                        this.removeTraining(tid);
                    }.bind(this)
                });
            }

            this.chart.update();
        }
    }

    getRandomColor() {
        var letters = '0123456789ABCDEF', color = '#';
        for (var i = 0; i < 6; i++) { color += letters[Math.floor(Math.random() * 16)]; }
        return color;
    }

    initChart(r) {
        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new Chart(document.getElementById('measurementChart'), {
            type: 'line',
            data: {
                datasets: [{
                    data: r.recordingMetrics.map((o) => { return { x: o.timestamp, y: o.value }; }),
                    label: r && r.recordingMetrics && r.recordingMetrics.length > 0 ? r.recordingMetrics[0].port : '',
                    borderColor: this.getRandomColor(),
                    fill: false
                }]
            },
            options: {
                title: {
                    display: true,
                    text: r.id
                },
                annotation: {
                    dblClickSpeed: 500,
                    events: ['click', 'dblclick'],
                    annotations: []
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        id: 'x-axis-0',
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
                        id: 'y-axis-0',
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
        this.clearAnnotations();
        const points = this.chart.getElementsAtEventForMode(evt, 'index', { intersect: false });
        const d = this.chart.data.datasets[0].data[points[0]._index];
        this.currentTrainingRangeStart = d.x;
    }

    onpointerup(evt) {
        const points = this.chart.getElementsAtEventForMode(evt, 'index', { intersect: false });
        const d = this.chart.data.datasets[0].data[points[0]._index];
        const port = this.chart.data.datasets[0].label;
        if (d.x !== this.currentTrainingRangeStart) {
            let t = {
                port: port,
                start: moment(this.currentTrainingRangeStart).diff(moment(d.x)) < 0 ? this.currentTrainingRangeStart : d.x,
                end: moment(this.currentTrainingRangeStart).diff(moment(d.x)) < 0 ? d.x : this.currentTrainingRangeStart
            };
            // check for collision
            let collision = false;
            for (let i = 0; this.state.selected.trainings && i < this.state.selected.trainings.length; i++) {
                let o = this.state.selected.trainings[i];
            
                // check if dates are overlapping
                if (moment(o.start).diff(moment(t.end)) <= 0 && moment(t.start).diff(moment(o.end)) <= 0) {
                    collision = true;
                    console.log("Selected Range collides with another one")
                    break;
                }
            }

            if (!collision) {

                this.addTraining(t);
            }
        }
    }

    clearAnnotations() {
        if (this.chart.options.annotation) {
            this.chart.options.annotation.annotations = [];
        }
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
