import React, { Component } from 'react';
import { SignalSelect } from '../common/SignalSelect';
import { BrdSingleHalfPeriod } from '../breathRateControls/BrdSingleHalfPeriod';


export function SingleHalfPeriodPage(props) {
    let signalSelectControl = React.createRef();
    let breathRateDetectionControl = React.createRef();
    return (
        <main>
            <SignalSelect ref={signalSelectControl} {...props} />
            <BrdSingleHalfPeriod ref={breathRateDetectionControl} signalSelectControlRef={signalSelectControl} {...props} />
        </main>
    );
}
