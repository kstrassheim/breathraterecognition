import { AbstractBrd } from './AbstractBrd'
import { BrdSingleHalfPeriod as Svc } from '../breathRateServices/brdSingleHalfPeriod';

export class BrdSingleHalfPeriod extends AbstractBrd {
    constructor(props) {
        super(props, Svc);
    }
}