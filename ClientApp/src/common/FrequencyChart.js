import React, { Component } from 'react';
import Chart from 'chart.js';
import moment from 'moment';

class BarChart extends Component {
    
    chart = null;
    props = null;


    constructor(props) {
        super(props);
        this.props = props;
        this.barColor = this.getRandomColor();
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

            this.chart.options.scales.xAxes.forEach(a => a.display = !nextProps.hideLabels);
            this.chart.options.scales.yAxes.forEach(a => a.display = !nextProps.hideLabels);
            chartChanged = true;
        }

        if (this.props.fontSize !== nextProps.fontSize) {
            this.chart.options.title.fontSize = nextProps.fontSize;
            this.chart.options.scales.xAxes.forEach(a => a.ticks.fontSize = nextProps.fontSize);
            this.chart.options.scales.yAxes.forEach(a => a.ticks.fontSize = nextProps.fontSize);
            chartChanged = true;
        }

        if (chartChanged) { this.chart.update(); }
    }

    componentDidMount = () => {
        this.chart = new Chart(document.getElementById(this.props.name), {
            type: 'bar',
            data: {
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
                responsive: true,
                scales: {
                    xAxes: [{
                        ticks: { fontSize: this.props.fontSize },
                        display: !this.props.hideLabels
                    }],
                    yAxes: [{
                        ticks: { fontSize: this.props.fontSize },
                        display: !this.props.hideLabels
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

export class FrequencyChart extends BarChart {
    process(values) {
        if (!Array.isArray(values)) { values = [values]; }
        this.chart.data.datasets.splice(0, this.chart.data.datasets.length);
        this.chart.data.labels.splice(0, this.chart.data.labels.length);
        this.chart.data.datasets.push({
            data: values.map(v => Math.abs(v.im)),
            backgroundColor: this.barColor,
            barPercentage: 0.5,
            barThickness: 6,
            maxBarThickness: 8,
            minBarLength: 2,
            label: "Frequencies",
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