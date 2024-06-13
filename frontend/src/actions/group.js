import { V2 } from "../openapi";
import { handleErrors, handleErrorsInline } from "./common";

export const CREATE_GROUP = "CREATE_GROUP";

export function createGroup(formData) {
	return (dispatch) => {
		return V2.GroupsService.saveGroupApiV2GroupsPost(formData)
			.then((json) => {
				dispatch({
					type: CREATE_GROUP,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, createGroup(formData)));
			});
	};
}

export const RESET_CREATE_GROUP = "RESET_CREATE_GROUP";

export function resetGroupCreation() {
	return (dispatch) => {
		dispatch({
			type: RESET_CREATE_GROUP,
			receivedAt: Date.now(),
		});
	};
}

export const RECEIVE_GROUPS = "RECEIVE_GROUPS";

export function fetchGroups(skip = 0, limit = 21) {
	return (dispatch) => {
		return V2.GroupsService.getGroupsApiV2GroupsGet(skip, limit)
			.then((json) => {
				dispatch({
					type: RECEIVE_GROUPS,
					groups: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchGroups(skip, limit)));
			});
	};
}

export const DELETE_GROUP = "DELETE_GROUP";

export function deleteGroup(groupId) {
	return (dispatch) => {
		return V2.GroupsService.deleteGroupApiV2GroupsGroupIdDelete(groupId)
			.then((json) => {
				dispatch({
					type: DELETE_GROUP,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, deleteGroup(groupId)));
			});
	};
}

export const SEARCH_GROUPS = "SEARCH_GROUPS";

export function searchGroups(searchTerm, skip = 0, limit = 21) {
	return (dispatch) => {
		return V2.GroupsService.searchGroupApiV2GroupsSearchSearchTermGet(
			searchTerm,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: SEARCH_GROUPS,
					groups: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, searchGroups(searchTerm, skip, limit)));
			});
	};
}

export const RECEIVE_GROUP_ABOUT = "RECEIVE_GROUP_ABOUT";

export function fetchGroupAbout(id) {
	return (dispatch) => {
		return V2.GroupsService.getGroupApiV2GroupsGroupIdGet(id)
			.then((json) => {
				dispatch({
					type: RECEIVE_GROUP_ABOUT,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchGroupAbout(id)));
			});
	};
}

export const DELETE_GROUP_MEMBER = "DELETE_GROUP_MEMBER";

export function deleteGroupMember(groupId, username) {
	return (dispatch) => {
		return V2.GroupsService.removeMemberApiV2GroupsGroupIdRemoveUsernamePost(
			groupId,
			username
		)
			.then((json) => {
				dispatch({
					type: DELETE_GROUP_MEMBER,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, deleteGroupMember(groupId, username)));
			});
	};
}

export const ADD_GROUP_MEMBER = "ADD_GROUP_MEMBER";

export function addGroupMember(groupId, username, role = "viewer") {
	return (dispatch) => {
		return V2.GroupsService.addMemberApiV2GroupsGroupIdAddUsernamePost(
			groupId,
			username,
			role
		)
			.then((json) => {
				dispatch({
					type: ADD_GROUP_MEMBER,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrorsInline(reason, addGroupMember(groupId, username, role))
				);
			});
	};
}

export const ASSIGN_GROUP_MEMBER_ROLE = "ASSIGN_GROUP_MEMBER_ROLE";

export function assignGroupMemberRole(groupId, username, role = "viewer") {
	return (dispatch) => {
		return V2.GroupsService.updateMemberApiV2GroupsGroupIdUpdateUsernamePut(
			groupId,
			username,
			role
		)
			.then((json) => {
				dispatch({
					type: ASSIGN_GROUP_MEMBER_ROLE,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, assignGroupMemberRole(groupId, username, role))
				);
			});
	};
}

export const UPDATE_GROUP = "UPDATE_GROUP";

export function updateGroup(groupId, formData) {
	return (dispatch) => {
		return V2.GroupsService.editGroupApiV2GroupsGroupIdPut(groupId, formData)
			.then((json) => {
				dispatch({
					type: UPDATE_GROUP,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, updateGroup(groupId, formData)));
			});
	};
}
