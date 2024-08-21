/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ChatCompletionMessageToolCall } from './ChatCompletionMessageToolCall';
import type { FunctionCall } from './FunctionCall';

export type ChatCompletionMessage = {
    content?: string;
    role: ChatCompletionMessage.role;
    function_call?: FunctionCall;
    tool_calls?: Array<ChatCompletionMessageToolCall>;
}

export namespace ChatCompletionMessage {

    export enum role {
        ASSISTANT = 'assistant',
    }


}
