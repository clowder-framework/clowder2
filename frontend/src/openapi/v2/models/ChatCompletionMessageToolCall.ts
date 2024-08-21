/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Function } from './Function';

export type ChatCompletionMessageToolCall = {
    id: string;
    function: Function;
    type: ChatCompletionMessageToolCall.type;
}

export namespace ChatCompletionMessageToolCall {

    export enum type {
        FUNCTION = 'function',
    }


}
