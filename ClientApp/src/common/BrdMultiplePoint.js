import { AbstractBrd } from './AbstractBrd'
import { BrdMultiplePoint } from '../services/brdMultiplePoint';

export class BrdMultiplePoint extends AbstractBrd {
    constructor(props) {
        super(props, BrdMultiplePoint);
    }
}