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
     * Get a list of all Groups in the db the user is a member/owner of.
     *
     * Arguments:
     * skip -- number of initial recoto_list()rds to skip (i.e. for pagination)
     * limit -- restrict number of records to be returned (i.e. for pagination)
     * @param skip
     * @param limit
     * @returns GroupOut Successful Response
     * @throws ApiError
     */
    public static getGroupsApiV2GroupsGet(
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Array<GroupOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/groups`,
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
     * Search Group
     * Search all groups in the db based on text.
     *
     * Arguments:
     * text -- any text matching name or description
     * skip -- number of initial records to skip (i.e. for pagination)
     * limit -- restrict number of records to be returned (i.e. for pagination)
     * @param searchTerm
     * @param skip
     * @param limit
     * @returns GroupOut Successful Response
     * @throws ApiError
     */
    public static searchGroupApiV2GroupsSearchSearchTermGet(
        searchTerm: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Array<GroupOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/groups/search/${searchTerm}`,
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
     * @param requestBody
     * @returns GroupOut Successful Response
     * @throws ApiError
     */
    public static editGroupApiV2GroupsGroupIdPut(
        groupId: string,
        requestBody: GroupBase,
    ): CancelablePromise<GroupOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/groups/${groupId}`,
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
     * @returns GroupOut Successful Response
     * @throws ApiError
     */
    public static deleteGroupApiV2GroupsGroupIdDelete(
        groupId: string,
    ): CancelablePromise<GroupOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/groups/${groupId}`,
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
     * @param role
     * @returns GroupOut Successful Response
     * @throws ApiError
     */
    public static addMemberApiV2GroupsGroupIdAddUsernamePost(
        groupId: string,
        username: string,
        role?: string,
    ): CancelablePromise<GroupOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/groups/${groupId}/add/${username}`,
            query: {
                'role': role,
            },
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
     * @returns GroupOut Successful Response
     * @throws ApiError
     */
    public static removeMemberApiV2GroupsGroupIdRemoveUsernamePost(
        groupId: string,
        username: string,
    ): CancelablePromise<GroupOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/groups/${groupId}/remove/${username}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Member
     * Update user role.
     * @param groupId
     * @param username
     * @param role
     * @returns GroupOut Successful Response
     * @throws ApiError
     */
    public static updateMemberApiV2GroupsGroupIdUpdateUsernamePut(
        groupId: string,
        username: string,
        role: string,
    ): CancelablePromise<GroupOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/groups/${groupId}/update/${username}`,
            query: {
                'role': role,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}