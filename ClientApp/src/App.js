import React from 'react';
import { Route } from 'react-router';
import { NavMenu } from './components/NavMenu';
import { Home } from './components/Home';
import { DiscreteSinglePeriodPage } from './components/DiscreteSinglePeriodPage';
import { ContinousCutCountPage } from './components/ContinousCutCountPage';
import { DFTPage } from './components/DFTPage';

import './custom.css'

export default function App(props) {
    return (
        <React.Fragment>
            {props.settings.darkMode ? <link rel="stylesheet" type="text/css" href="dark.css" /> : <React.Fragment /> }
            <div className="container-fluid">
                <NavMenu darkMode={props.settings.darkMode}  />
                <Route exact path='/' component={() => <Home settingsCollapsed={props.settings.settingsCollapsed} defaultNoiseSensity={props.settings.home.noiseSensity} defaultBufferSize={props.settings.home.bufferSize} defaultLowPassSensity={props.settings.home.lowPassSensity} defaultDisplaySeconds={props.settings.home.displaySeconds} defaultChartFontSize={props.settings.home.chartFontSize} defaultResultHidden={props.settings.home.resultHidden} defaultHideLabels={props.settings.home.hideLabels} defaultShowAlgorithm={props.settings.home.showAlgorithm} defaultOverlayBreathRate={props.settings.home.overlayBreathRate} defaultShowRawSignal={props.settings.home.showRawSignal} defaultAvgCutAlgoToleranceSec={props.settings.home.avgCutAlgoToleranceSec} defaultProcessBufferSeconds={props.settings.home.processBufferSeconds} />} />
                <Route exact path='/DiscreteSinglePeriod' component={() => <DiscreteSinglePeriodPage settingsCollapsed={props.settings.settingsCollapsed} defaultNoiseSensity={props.settings.acdsp.noiseSensity} defaultBufferSize={props.settings.acdsp.bufferSize} defaultLowPassSensity={props.settings.acdsp.lowPassSensity} defaultDisplaySeconds={props.settings.acdsp.displaySeconds} defaultChartFontSize={props.settings.acdsp.chartFontSize} defaultResultHidden={props.settings.resultHidden} defaultHideLabels={props.settings.acdsp.hideLabels} defaultShowAlgorithm={props.settings.acdsp.showAlgorithm} defaultOverlayBreathRate={props.settings.acdsp.overlayBreathRate} defaultShowRawSignal={props.settings.acdsp.showRawSignal} defaultAvgCutAlgoToleranceSec={props.settings.acdsp.avgCutAlgoToleranceSec} defaultProcessBufferSeconds={props.settings.acdsp.processBufferSeconds} />} />
                <Route exact path='/ContinousCutCount' component={() => <ContinousCutCountPage settingsCollapsed={props.settings.settingsCollapsed} defaultNoiseSensity={props.settings.accc.noiseSensity} defaultBufferSize={props.settings.accc.bufferSize} defaultLowPassSensity={props.settings.accc.lowPassSensity} defaultDisplaySeconds={props.settings.accc.displaySeconds} defaultChartFontSize={props.settings.accc.chartFontSize} defaultResultHidden={props.settings.resultHidden} defaultHideLabels={props.settings.accc.hideLabels} defaultShowAlgorithm={props.settings.accc.showAlgorithm} defaultOverlayBreathRate={props.settings.accc.overlayBreathRate} defaultShowRawSignal={props.settings.accc.showRawSignal} defaultAvgCutAlgoToleranceSec={props.settings.accc.avgCutAlgoToleranceSec} defaultProcessBufferSeconds={props.settings.accc.processBufferSeconds} />} />
                <Route exact path='/DFT' component={() => <DFTPage settingsCollapsed={props.settings.settingsCollapsed} defaultNoiseSensity={props.settings.dft.noiseSensity} defaultBufferSize={props.settings.dft.bufferSize} defaultLowPassSensity={props.settings.dft.lowPassSensity} defaultDisplaySeconds={props.settings.dft.displaySeconds} defaultChartFontSize={props.settings.dft.chartFontSize} defaultResultHidden={props.settings.resultHidden} defaultHideLabels={props.settings.dft.hideLabels} defaultShowAlgorithm={props.settings.dft.showAlgorithm} defaultOverlayBreathRate={props.settings.dft.overlayBreathRate} defaultShowRawSignal={props.settings.dft.showRawSignal} defaultAvgCutAlgoToleranceSec={props.settings.dft.avgCutAlgoToleranceSec} defaultProcessBufferSeconds={props.settings.dft.processBufferSeconds} />} />
            </div>
        </React.Fragment>
    );
}
