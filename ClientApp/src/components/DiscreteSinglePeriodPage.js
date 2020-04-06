import React, { Component } from 'react';
import { SignalSelect } from '../common/SignalSelect';
import { BrdDiscreteSinglePeriod } from '../breathRateControls/BrdDiscreteSinglePeriod';


export function DiscreteSinglePeriodPage(props) {
    let signalSelectControl = React.createRef();
    let breathRateDetectionControl = React.createRef();
    return (
        <main>
            <SignalSelect ref={signalSelectControl} {...props} />
            <BrdDiscreteSinglePeriod ref={breathRateDetectionControl} signalSelectControlRef={signalSelectControl} {...props} />
        </main>
    );
}
