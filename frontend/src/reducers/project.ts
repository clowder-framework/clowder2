import {CREATE_PROJECT, RECEIVE_PROJECT, RECEIVE_PROJECTS, RESET_CREATE_PROJECT} from "../actions/project";
import {DataAction} from "../types/action";
import {ProjectState} from "../types/data";
import {DatasetOut, DatasetRoles, Paged, PageMetadata, ProjectOut, UserOut} from "../openapi/v2";

// @ts-ignore
const defaultState: ProjectState = {
	projects: <Paged>{metadata: <PageMetadata>{}, data: <ProjectOut[]>[]},
	newProject: <ProjectOut>{},
	datasets: [],
	members: <DatasetRoles>{},
	selectDatasets: <Paged>{metadata: <PageMetadata>{}, data: <DatasetOut[]>[]},
	selectUsers: <Paged>{metadata: <PageMetadata>{}, data: <UserOut[]>[]},
};

const project = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case CREATE_PROJECT:
			return Object.assign({}, state, {newProject: action.project});
		case RESET_CREATE_PROJECT:
			return Object.assign({}, state, {newProject: {}});
		case RECEIVE_PROJECT:
			return Object.assign({}, state, {
				about: action.project,
			});
		case RECEIVE_PROJECTS:
			return Object.assign({}, state, {
				projects: action.projects,
			});
		default:
			return state;
	}
};

export default project;
