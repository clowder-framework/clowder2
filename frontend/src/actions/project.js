import {V2} from "../openapi";
import {handleErrors} from "./common";

export const RECEIVE_PROJECTS = "RECEIVE_PROJECTS";

export function fetchProjects(skip = 0, limit = 12) {
	return (dispatch) => {
		return V2.ProjectsService.getProjectsApiV2ProjectsGet(skip, limit)
			.then((json) => {
				dispatch({
					type: RECEIVE_PROJECTS,
					projects: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						fetchProjects(skip, limit)
					)
				);
			});
	};
}

export const RECEIVE_PROJECT = "RECEIVE_PROJECT";

export function fetchProject(id) {
	return (dispatch) => {
		return V2.ProjectsService.getProjectApiV2ProjectsProjectIdGet(id)
			.then((json) => {
				dispatch({
					type: RECEIVE_PROJECT,
					project: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchProject(id)));
			});
	};
}

export const CREATE_PROJECT = "CREATE_PROJECT";

export function projectCreated(formData) {
	return (dispatch) => {
		// If licenseFormData is not present, directly save the dataset
		return V2.ProjectsService.saveProjectApiV2ProjectsPost(
			formData
		)
			.then((project) => {
				dispatch({
					type: CREATE_PROJECT,
					project: project,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						projectCreated(formData)
					)
				);
			});
	};
}

export const RESET_CREATE_PROJECT = "RESET_CREATE_PROJECT";

export function resetProjectCreated() {
	return (dispatch) => {
		dispatch({
			type: RESET_CREATE_PROJECT,
			receivedAt: Date.now(),
		});
	};
}
