import { RECEIVE_FILES_IN_DATASET, RECEIVE_DATASET_ABOUT } from "../actions/dataset";

const defaultState = {files: []};

const dataset = (state=defaultState, action) => {
	switch(action.type) {
		case RECEIVE_FILES_IN_DATASET:
			return Object.assign({}, state, {files: action.files});
		case RECEIVE_DATASET_ABOUT:
			return Object.assign({}, state, {about: action.about});
		default:
			return state;
	}
};

export default dataset;
