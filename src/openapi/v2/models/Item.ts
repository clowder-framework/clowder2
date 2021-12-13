/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NestedValue } from './NestedValue';

export type Item = {
    id?: string;
    name: string;
    price: number;
    is_offer?: boolean;
    value?: NestedValue;
}
