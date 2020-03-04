import React from 'react';
import { SignalSelect } from '../common/SignalSelect';
import { BrdFourier } from '../breathRateControls/BrdFourier';


export function FourierPage(props) {
    let signalSelectControl = React.createRef();
    let breathRateDetectionControl = React.createRef();
    return (
        <main>
            <SignalSelect ref={signalSelectControl} {...props} />
            <BrdFourier ref={breathRateDetectionControl} signalSelectControlRef={signalSelectControl} {...props} />
        </main>
    );
}
