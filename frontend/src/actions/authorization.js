import {V2} from "../openapi";
import {handleErrorsAuthorization, resetFailedReason} from "./common";

export const RECEIVE_DATASET_ROLE = "RECEIVE_DATASET_ROLE";
export function fetchDatasetRole(datasetId){
	return (dispatch) => {
		return V2.AuthorizationService.getDatasetRoleApiV2AuthorizationsDatasetsDatasetIdRoleGet(datasetId)
			.then(json => {
				dispatch({
					type: RECEIVE_DATASET_ROLE,
					role: json,
					receivedAt: Date.now(),
				});
			})
			.then(() => {
				dispatch(resetFailedReason());
			})
			.catch(reason => {
				dispatch(handleErrorsAuthorization(reason, fetchDatasetRole(datasetId)));
			});
	};
}

export const RECEIVE_FILE_ROLE = "RECEIVE_FILE_ROLE";
export function fetchFileRole(fileId){
	return (dispatch) => {
		return V2.AuthorizationService.getFileRoleApiV2AuthorizationsFilesFileIdRoleGet(fileId)
			.then(json => {
				dispatch({
					type: RECEIVE_FILE_ROLE,
					role: json,
					receivedAt: Date.now(),
				});
			})
			.then(() => {
				dispatch(resetFailedReason());
			})
			.catch(reason => {
				dispatch(handleErrorsAuthorization(reason, fetchFileRole(fileId)));
			});
	};
}

export const RECEIVE_GROUP_ROLE = "RECEIVE_GROUP_ROLE";
export function fetchGroupRole(groupId){
	return (dispatch) => {
		return V2.AuthorizationService.getGroupRoleApiV2AuthorizationsGroupsGroupIdRoleGet(groupId)
			.then(json => {
				dispatch({
					type: RECEIVE_GROUP_ROLE,
					role: json,
					receivedAt: Date.now(),
				});
			})
			.then(() => {
				dispatch(resetFailedReason());
			})
			.catch(reason => {
				dispatch(handleErrorsAuthorization(reason, fetchGroupRole(groupId)));
			});
	};
}
