﻿import React, { Component } from 'react';
import Chart from 'chart.js';
import moment from 'moment';

class LineChart extends Component {
    chart = null;
    props = null;

    constructor(props) {
        super(props);
        this.props = props;
    }

    getRandomColor() {
        var letters = '0123456789ABCDEF', color = '#';
        for (var i = 0; i < 6; i++) { color += letters[Math.floor(Math.random() * 16)]; }
        return color;
    }

    componentDidMount = () => {
        this.chart = new Chart(document.getElementById(this.props.name), {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                title: {
                    display: true,
                    text: this.props.title || this.props.name
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

    render() {
        return (
            <canvas id={this.props.name}></canvas>
        );
    }
}

export class SignalChart extends LineChart {
    defaultExpiration = 10;

    process(values) {
        let first = values[0];
        // get dataset
        let dsa = this.chart.data.datasets.length > 0 ? this.chart.data.datasets.filter((d) => d.label === first.port) : null;
        let ds = dsa && dsa.length > 0 ? dsa[0] : null;
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
        values.forEach(o => ds.data.push({ x: o.timestamp, y: o[this.props.valuePropertyName || 'value']}));

        // delete old values if expired
        if (ds.data.length > 0 && moment.duration(moment().diff(ds.data[0].x)).asSeconds() > (this.props.expiration || this.defaultExpiration)) { ds.data.splice(0, values.length); }

        this.chart.update();
    }
}