import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');
var set = {
    "darkMode": true,
    "settingsCollapsed": true,
    "home": {
        "noiseSensity": 400,
        "bufferSize": 10,
        "lowPassSensity": 6,
        "displaySeconds": 30,
        "chartFontSize": 6,
        "resultHidden": true,
        "hideLabels": true,
        "showAlgorithm": false,
        "overlayBreathRate": true,
        "showRawSignal": false,
        "avgCutAlgoToleranceSec": 0.5
    },
    "other": {
        "noiseSensity": 400,
        "bufferSize": 10,
        "lowPassSensity": 6,
        "displaySeconds": 30,
        "chartFontSize": 6,
        "resultHidden": false,
        "hideLabels": false,
        "showAlgorithm": false,
        "overlayBreathRate": true,
        "showRawSignal": false,
        "avgCutAlgoToleranceSec": 0.5
    }
};

function render() {
    ReactDOM.render(
        <BrowserRouter basename={baseUrl}>
            <App settings={set} />
        </BrowserRouter>,
        rootElement);
    registerServiceWorker();
}

fetch("settings.json").then(a => a.json().then(a => {set = a; render();}).catch(render)).catch(render);

