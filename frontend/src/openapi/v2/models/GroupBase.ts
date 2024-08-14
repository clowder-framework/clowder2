/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { app__models__groups__Member } from './app__models__groups__Member';

export type GroupBase = {
    name: string;
    description?: string;
    users?: Array<app__models__groups__Member>;
}
