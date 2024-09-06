import {RECEIVE_PROJECT, RECEIVE_PROJECTS} from "../actions/project";
import {DataAction} from "../types/action";
import {DatasetState} from "../types/data";

// @ts-ignore
const defaultState: DatasetState = {
	projects: {
		metadata: {},
		data: [],
	},
	project: {},
};

const dataset = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_PROJECT:
			return Object.assign({}, state, {
				project: action.project,
			});
		case RECEIVE_PROJECTS:
			return Object.assign({}, state, {
				projects: action.projects,
			});
		default:
			return state;
	}
};

export default dataset;
