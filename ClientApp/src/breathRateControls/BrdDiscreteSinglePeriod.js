import { AbstractBrd } from './AbstractBrd'
import { BrdDiscreteSinglePeriod as Svc } from '../breathRateServices/brdDiscreteSinglePeriod';

export class BrdDiscreteSinglePeriod extends AbstractBrd {
    constructor(props) {
        super(props, Svc);
    }
}