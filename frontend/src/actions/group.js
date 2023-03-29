import {V2} from "../openapi";
import {handleErrors} from "./common";

export const RECEIVE_GROUPS = "RECEIVE_GROUPS";
export function fetchGroups(skip=0, limit=21){
	return (dispatch) => {
		return V2.GroupsService.getGroupsApiV2GroupsGet(skip, limit)
			.then(json => {
				dispatch({
					type: RECEIVE_GROUPS,
					groups: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchGroups(skip, limit)));
			});

	};
}

export const RECEIVE_GROUP_ABOUT = "RECEIVE_GROUP_ABOUT";
export function fetchGroupAbout(id){
	return (dispatch) => {
		return V2.GroupsService.getGroupApiV2GroupsGroupIdGet(id)
			.then(json => {
				dispatch({
					type: RECEIVE_GROUP_ABOUT,
					about: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchGroupAbout(id)));
			});
	};
}


export const DELETE_GROUP_MEMBER = "DELETE_GROUP_MEMBER";
export function deleteGroupMember(groupId, username){
	return (dispatch) => {
		return V2.GroupsService.removeMemberApiV2GroupsGroupIdRemoveUsernamePost(groupId, username)
			.then(json => {
				dispatch({
					type: DELETE_GROUP_MEMBER,
					member: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, deleteGroupMember(groupId, username)));
			});
	};
}
