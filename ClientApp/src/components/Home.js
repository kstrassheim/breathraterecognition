import React from 'react';
import { SignalSelect } from '../common/SignalSelect';
import { BrdContinousCutCount } from '../breathRateControls/BrdContinousCutCount.';


export function Home(props) {

    let signalSelectControl = React.createRef();
    let breathRateDetectionControl = React.createRef();

    return (
        <React.Fragment>
            <SignalSelect ref={signalSelectControl} {...props} />
            <BrdContinousCutCount ref={breathRateDetectionControl} signalSelectControlRef={signalSelectControl} {...props} />
        </React.Fragment>
    );
}
