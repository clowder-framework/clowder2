/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PromptRequest } from '../models/PromptRequest';
import type { PromptResponse } from '../models/PromptResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class LlmService {

    /**
     * Llm
     * @param requestBody
     * @returns PromptResponse Successful Response
     * @throws ApiError
     */
    public static llmApiV2LlmPost(
        requestBody: PromptRequest,
    ): CancelablePromise<PromptResponse> {
        return __request({
            method: 'POST',
            path: `/api/v2/llm`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}