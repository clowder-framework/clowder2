import { RECEIVE_FILES_IN_DATASET, RECEIVE_DATASET_ABOUT, RECEIVE_DATASETS} from "../actions/dataset";

const defaultState = {files: [], about: {}, datasets: []};

const dataset = (state=defaultState, action) => {
	switch(action.type) {
		case RECEIVE_FILES_IN_DATASET:
			return Object.assign({}, state, {files: action.files});
		case RECEIVE_DATASET_ABOUT:
			return Object.assign({}, state, {about: action.about});
		case RECEIVE_DATASETS:
			return Object.assign({}, state, {datasets:action.datasets});
		default:
			return state;
	}
};

export default dataset;
