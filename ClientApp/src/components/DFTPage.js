import React from 'react';
import { SignalSelect } from '../common/SignalSelect';
import { BrdDFT } from '../breathRateControls/BrdDFT';


export function DFTPage(props) {
    let signalSelectControl = React.createRef();
    let breathRateDetectionControl = React.createRef();
    return (
        <main>
            <SignalSelect ref={signalSelectControl} {...props} />
            <BrdDFT ref={breathRateDetectionControl} signalSelectControlRef={signalSelectControl} {...props} />
        </main>
    );
}
