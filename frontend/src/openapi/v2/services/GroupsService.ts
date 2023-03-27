/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GroupBase } from '../models/GroupBase';
import type { GroupIn } from '../models/GroupIn';
import type { GroupOut } from '../models/GroupOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class GroupsService {

    /**
     * Get Groups
     * @param skip
     * @param limit
     * @param mine
     * @returns GroupOut Successful Response
     * @throws ApiError
     */
    public static getGroupsApiV2GroupsGet(
        skip?: number,
        limit: number = 10,
        mine: boolean = false,
    ): CancelablePromise<Array<GroupOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/groups`,
            query: {
                'skip': skip,
                'limit': limit,
                'mine': mine,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Save Group
     * @param requestBody
     * @returns GroupOut Successful Response
     * @throws ApiError
     */
    public static saveGroupApiV2GroupsPost(
        requestBody: GroupIn,
    ): CancelablePromise<GroupOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/groups`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Group
     * @param groupId
     * @returns GroupOut Successful Response
     * @throws ApiError
     */
    public static getGroupApiV2GroupsGroupIdGet(
        groupId: string,
    ): CancelablePromise<GroupOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/groups/${groupId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Edit Group
     * @param groupId
     * @param userId
     * @param requestBody
     * @returns GroupOut Successful Response
     * @throws ApiError
     */
    public static editGroupApiV2GroupsGroupIdPut(
        groupId: string,
        userId: string,
        requestBody: GroupBase,
    ): CancelablePromise<GroupOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/groups/${groupId}`,
            query: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Group
     * @param groupId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteGroupApiV2GroupsGroupIdDelete(
        groupId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/groups/${groupId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Search Group
     * @param searchTerm
     * @returns any Successful Response
     * @throws ApiError
     */
    public static searchGroupApiV2GroupsSearchSearchTermGet(
        searchTerm: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/groups/search/${searchTerm}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Member
     * Add a new user to a group.
     * @param groupId
     * @param username
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addMemberApiV2GroupsGroupIdAddUsernamePost(
        groupId: string,
        username: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/groups/${groupId}/add/${username}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove Member
     * Remove a user from a group.
     * @param groupId
     * @param username
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeMemberApiV2GroupsGroupIdRemoveUsernamePost(
        groupId: string,
        username: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/groups/${groupId}/remove/${username}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}