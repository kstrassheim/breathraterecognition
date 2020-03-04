import React from 'react';
import { Route } from 'react-router';
import { NavMenu } from './components/NavMenu';
import { Home } from './components/Home';
import { SingleHalfPeriodPage } from './components/SingleHalfPeriodPage';
import { MultiplePointPage } from './components/MultiplePointPage';
import { FourierPage } from './components/FourierPage';

import './custom.css'

export default function App(props) {
    return (
        <React.Fragment>
            {props.settings.darkMode ? <link rel="stylesheet" type="text/css" href="dark.css" /> : <React.Fragment /> }
            <div className="container-fluid">
                <NavMenu darkMode={props.settings.darkMode}  />
                <Route exact path='/' component={() => <Home settingsCollapsed={props.settings.settingsCollapsed} defaultNoiseSensity={props.settings.home.noiseSensity} defaultBufferSize={props.settings.home.bufferSize} defaultLowPassSensity={props.settings.home.lowPassSensity} defaultDisplaySeconds={props.settings.home.displaySeconds} defaultChartFontSize={props.settings.home.chartFontSize} defaultResultHidden={props.settings.home.resultHidden} defaultHideLabels={props.settings.home.hideLabels} defaultShowAlgorithm={props.settings.home.showAlgorithm} defaultOverlayBreathRate={props.settings.home.overlayBreathRate} defaultShowRawSignal={props.settings.home.showRawSignal} defaultAvgCutAlgoToleranceSec={props.settings.home.avgCutAlgoToleranceSec} defaultProcessBufferSeconds={props.settings.home.processBufferSeconds} />} />
                <Route exact path='/SinglePeriod' component={() => <SingleHalfPeriodPage settingsCollapsed={props.settings.settingsCollapsed} defaultNoiseSensity={props.settings.other.noiseSensity} defaultBufferSize={props.settings.other.bufferSize} defaultLowPassSensity={props.settings.other.lowPassSensity} defaultDisplaySeconds={props.settings.other.displaySeconds} defaultChartFontSize={props.settings.other.chartFontSize} defaultResultHidden={props.settings.resultHidden} defaultHideLabels={props.settings.other.hideLabels} defaultShowAlgorithm={props.settings.other.showAlgorithm} defaultOverlayBreathRate={props.settings.other.overlayBreathRate} defaultShowRawSignal={props.settings.other.showRawSignal} defaultAvgCutAlgoToleranceSec={props.settings.other.avgCutAlgoToleranceSec} defaultProcessBufferSeconds={props.settings.other.processBufferSeconds} />} />
                <Route exact path='/MultiplePoint' component={() => <MultiplePointPage settingsCollapsed={props.settings.settingsCollapsed} defaultNoiseSensity={props.settings.other.noiseSensity} defaultBufferSize={props.settings.other.bufferSize} defaultLowPassSensity={props.settings.other.lowPassSensity} defaultDisplaySeconds={props.settings.other.displaySeconds} defaultChartFontSize={props.settings.other.chartFontSize} defaultResultHidden={props.settings.resultHidden} defaultHideLabels={props.settings.other.hideLabels} defaultShowAlgorithm={props.settings.other.showAlgorithm} defaultOverlayBreathRate={props.settings.other.overlayBreathRate} defaultShowRawSignal={props.settings.other.showRawSignal} defaultAvgCutAlgoToleranceSec={props.settings.other.avgCutAlgoToleranceSec} defaultProcessBufferSeconds={props.settings.other.processBufferSeconds} />} />
                <Route exact path='/Fourier' component={() => <FourierPage settingsCollapsed={props.settings.settingsCollapsed} defaultNoiseSensity={props.settings.other.noiseSensity} defaultBufferSize={props.settings.other.bufferSize} defaultLowPassSensity={props.settings.other.lowPassSensity} defaultDisplaySeconds={props.settings.other.displaySeconds} defaultChartFontSize={props.settings.other.chartFontSize} defaultResultHidden={props.settings.resultHidden} defaultHideLabels={props.settings.other.hideLabels} defaultShowAlgorithm={props.settings.other.showAlgorithm} defaultOverlayBreathRate={props.settings.other.overlayBreathRate} defaultShowRawSignal={props.settings.other.showRawSignal} defaultAvgCutAlgoToleranceSec={props.settings.other.avgCutAlgoToleranceSec} defaultProcessBufferSeconds={props.settings.other.processBufferSeconds} />} />
            </div>
        </React.Fragment>
    );
}
