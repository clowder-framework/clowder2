import {V2} from "../openapi";
import {handleErrors} from "./common";

export const RECEIVE_GROUPS = "RECEIVE_GROUPS";

export function fetchGroups(skip=0, limit=21){
	return (dispatch) => {
		console.log("FETCH")
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
