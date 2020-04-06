import React, { Component } from 'react';
import { SignalSelect } from '../common/SignalSelect';
import { BrdContinousCutCount } from '../breathRateControls/BrdContinousCutCount.';


export function ContinousCutCountPage(props) {
    let signalSelectControl = React.createRef();
    let breathRateDetectionControl = React.createRef();

    return (
        <main>
            <SignalSelect ref={signalSelectControl} {...props} />
            <BrdContinousCutCount ref={breathRateDetectionControl} signalSelectControlRef={signalSelectControl} {...props} />
        </main>
    );
}
