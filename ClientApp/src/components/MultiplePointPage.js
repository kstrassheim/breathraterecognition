import React, { Component } from 'react';
import { SignalSelect } from '../common/SignalSelect';
import { BrdMultiplePoint } from '../breathRateControls/BrdMultiplePoint';


export function MultiplePointPage(props) {
    let signalSelectControl = React.createRef();
    let breathRateDetectionControl = React.createRef();

    return (
        <main>
            <SignalSelect ref={signalSelectControl} {...props} />
            <BrdMultiplePoint ref={breathRateDetectionControl} signalSelectControlRef={signalSelectControl} {...props}> </BrdMultiplePoint>
        </main>
    );
}
