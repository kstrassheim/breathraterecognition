import { AbstractBrd } from './AbstractBrd'
import { BrdContinousCutCount as Svc  } from '../breathRateServices/brdContinousCutCount';

export class BrdContinousCutCount extends AbstractBrd {
    constructor(props) {
        super(props, Svc);
    }
}