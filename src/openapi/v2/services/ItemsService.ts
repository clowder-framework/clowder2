/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Item } from '../models/Item';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ItemsService {

    /**
     * Read Items
     * @param skip
     * @param limit
     * @returns Item List items
     * @throws ApiError
     */
    public static readItemsApiV2ItemsGet(
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<Item>> {
        return __request({
            method: 'GET',
            path: `/api/v2/items`,
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Item
     * @param requestBody
     * @returns Item Add a new item
     * @throws ApiError
     */
    public static createItemApiV2ItemsPost(
        requestBody: Item,
    ): CancelablePromise<Item> {
        return __request({
            method: 'POST',
            path: `/api/v2/items`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Item
     * @param itemId
     * @returns Item Successful Response
     * @throws ApiError
     */
    public static readItemApiV2ItemsItemIdGet(
        itemId: string,
    ): CancelablePromise<Item> {
        return __request({
            method: 'GET',
            path: `/api/v2/items/${itemId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}