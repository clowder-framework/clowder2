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
