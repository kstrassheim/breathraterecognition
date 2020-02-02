import React, { Component } from 'react';
import Chart from 'chart.js';
import moment from 'moment';

class BarChart extends Component {
    
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
            type: 'bar',
            data: {
                datasets: []
            },
            options: {
                title: {
                    display: true,
                    text: this.props.title || this.props.name
                },
                responsive: true,
            }
        });
    }

    render() {
        return (
            <canvas id={this.props.name}></canvas>
        );
    }
}

export class FrequencyChart extends BarChart {
    process(values) {
        if (!Array.isArray(values)) { values = [values]; }
        this.chart.data.datasets.splice(0, this.chart.data.datasets.length);
        this.chart.data.labels.splice(0, this.chart.data.labels.length);
        this.chart.data.datasets.push({
            data: values.map(v =>  Math.abs(v.im)),
            barPercentage: 0.5,
            barThickness: 6,
            maxBarThickness: 8,
            minBarLength: 2,
            //label: "Frequencies",
            //borderColor: this.getRandomColor(),
            //fill: false
        });
        this.chart.data.labels = values.map(v => { return v.re; });
        
        this.chart.update();
    }

    reset() {
        this.clearAnnotations();
        if (this.chart.data.datasets.length > 0) {
            for (let i = 0; i < this.chart.data.datasets.length; i++) {
                this.chart.data.datasets[i].data.splice(0, this.chart.data.datasets[0].data.length);
            }
        }
    }
}