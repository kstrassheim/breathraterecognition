import React, { Component } from 'react';
import Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
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

    componentWillUpdate(nextProps) {
        let chartChanged = false;
        if (this.props.hideLabels !== nextProps.hideLabels) {
            this.chart.options.legend.display = !nextProps.hideLabels;
            this.chart.options.title.display = !nextProps.hideLabels;
  
            this.chart.options.scales.xAxes.forEach(a=>a.display = !nextProps.hideLabels);
            this.chart.options.scales.yAxes.forEach(a => a.display = !nextProps.hideLabels);
            chartChanged = true;
        }

        if (this.props.fontSize !== nextProps.fontSize) {
            this.chart.options.title.fontSize = nextProps.fontSize;
            this.chart.options.scales.xAxes.forEach(a => a.ticks.fontSize = nextProps.fontSize);
            this.chart.options.scales.yAxes.forEach(a => a.ticks.fontSize = nextProps.fontSize);
            chartChanged = true;
        }

        if (this.props.showRawSignal !== nextProps.showRawSignal) {
            this.chart.data.datasets.forEach(d => d.hidden = (!d.label.endsWith("LowPass")) ? !nextProps.showRawSignal : d.hidden);
            chartChanged = true;
        }

        if (this.props.showAlgorithm !== nextProps.showAlgorithm && this.chart.options.annotation && this.chart.options.annotation.annotations) {
            if (!nextProps.showAlgorithm) {
                this.clearAnnotations();
            }
        }

        if (chartChanged) { this.chart.update();}
    }

    componentDidMount() {
        let i = 0;
        this.chart = new Chart(document.getElementById(this.props.name), {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                legend: {
                    display: !this.props.hideLabels,
                    labels: {
                        fontSize: this.props.fontSize
                    }
                },
                title: {
                    display: !this.props.hideLabels, // !this.props.hideLabels,
                    fontSize: this.props.fontSize,
                    text: this.props.title || this.props.name
                },
                annotation: {
                    annotations: []
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        ticks: { fontSize: this.props.fontSize},
                        display: !this.props.hideLabels,
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
                            labelString: 'Time'
                        },
                    }],
                    
                    yAxes: [{
                        ticks: { fontSize: this.props.fontSize },
                        display: !this.props.hideLabels,
                        scaleLabel: {
                            labelString: 'Value'
                        }
                    }]
                }
            }
        });
    }

    componentWillUnmount() {
        this.chart.options.annotation.annotations.splice(0, this.chart.options.annotation.annotations.length);
        this.chart.data.datasets.forEach(ds => {
            ds.data.splice(0, ds.data.length);
            if (ds.data.labels) {
                ds.data.labels.splice(0, ds.data.labels.length);
            }
        });
        this.chart.data.labels.splice(0, this.chart.data.labels.length);

        this.chart.update();
    }

    render() {
        return (
            <canvas id={this.props.name}></canvas>
        );
    }
}

export class SignalChart extends LineChart {
    defaultExpiration = 10;

    addAnnotation(time, color) {
        if (this.props.showAlgorithm) {
            this.chart.options.annotation.annotations.push({
                id: `${time}`,
                scaleID: 'x-axis-0',
                type: 'line',
                mode: this.props.showAlgorithm ? 'vertical' : 'v',
                value: time,
                borderColor: color,
                borderWidth: 1
            });
        }
    }

    addHorizontalAnnotation(value, color) {
        if (this.props.showAlgorithm) {
            this.chart.options.annotation.annotations.push({
                id: `${moment()}_${value}`,
                scaleID: 'y-axis-0',
                type: 'line',
                mode: this.props.showAlgorithm ? 'horizontal' : 'h',
                value: value,
                borderColor: color,
                borderWidth: 1
            });
        }
    }

    clearAnnotations(numToClear) {
        this.chart.options.annotation.annotations.splice(0, numToClear ? numToClear : this.chart.options.annotation.annotations.length);
    }

    clearHorizontalAnnotation() {
        for (let i = 0; i < this.chart.options.annotation.annotations.length; i++) {
            if (this.chart.options.annotation.annotations[i].mode === 'horizontal') {
                this.chart.options.annotation.annotations.splice(i, 1);
                break;
            }
        }
    }

    removeAnnotation(time) {
        if (!time) { this.clearAnnotations(); }
        for (let i = 0; i < this.chart.options.annotation.annotations.length; i++) {
            if (this.chart.options.annotation.annotations[i].mode !== 'vertical') {  continue; }
            let td = moment.duration(moment(this.chart.options.annotation.annotations[i].value).diff(moment(time))).asMilliseconds();
            if (td <= 0) {
                this.chart.options.annotation.annotations.splice(i, 1);
            }
        }
    }

    process(values) {
        this.processMultipleValues(values);
    }

    processOneByOne(values) {
        values.forEach((v, i) => {
            if (i > 0) {
                let to = moment.duration(moment(v.timestamp).diff(values[i - 1].timestamp)).asMilliseconds()
                setTimeout(() => this.processMultipleValues(v), to);
            }
            else {
                this.processMultipleValues(v)
            }
        });
    }

    processMultipleValues(values) {
        if (!Array.isArray(values)) { values = [values]; }
        if (values.length < 1 || !values[0].port || !values[0].timestamp) { return; }
        let first = values[0];
        // get dataset
        let dsa = this.chart.data.datasets.length > 0 ? this.chart.data.datasets.filter((d) => d.label === first.port) : null;
        let ds = dsa && dsa.length > 0 ? dsa[0] : null;
        if (!ds) {
            ds = {
                data: [],
                label: first.port,
                borderColor: this.getRandomColor(),
                lineTension: 0,
                fill: false,
                hidden: (!first.port.endsWith("LowPass")) ? !this.props.showRawSignal : false
            }
            this.chart.data.datasets.push(ds);
        }

        // insert new values
        values.forEach(o => ds.data.push({ x: o.timestamp, y: o[this.props.valuePropertyName || 'value'] }));
        let latestTimestamp = values[values.length - 1].timestamp;
        // delete old values if expired
        let todelete = 0;
        let expiration = (this.props.expiration ? this.props.expiration : this.defaultExpiration);
        for (let i = 0; i < ds.data.length; i++) {
            if (moment.duration(moment(latestTimestamp).diff(ds.data[i].x)).asSeconds() > expiration) {
                todelete++;
            }
            else {
                break;
            }
        }

        ds.data.splice(0, todelete);
        if (todelete > 0) {
            this.removeAnnotation(ds.data[0].x);
        }

        this.chart.update();
    }

    reset() {
        this.clearAnnotations();
        if (this.chart.data.datasets && this.chart.data.datasets.length > 0) {
            for (let i = 0; i < this.chart.data.datasets.length; i++) {
                this.chart.data.datasets[i].data.splice(0, this.chart.data.datasets[i].data.length);
            }
            this.chart.data.datasets.splice(0, this.chart.data.datasets.length)
        }

        if (this.chart.data.labels) {
            this.chart.data.labels.splice(0, this.chart.data.labels.length);
        }
        this.chart.update();
    }
}