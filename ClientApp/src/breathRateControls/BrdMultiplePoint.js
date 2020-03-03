import { AbstractBrd } from './AbstractBrd'
import { BrdMultiplePoint as Svc  } from '../breathRateServices/brdMultiplePoint';

export class BrdMultiplePoint extends AbstractBrd {
    constructor(props) {
        super(props, Svc);
    }
}