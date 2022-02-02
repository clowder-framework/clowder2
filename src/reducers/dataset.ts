import {
	RECEIVE_FILES_IN_DATASET,
	RECEIVE_DATASET_ABOUT,
	RECEIVE_DATASETS,
	DELETE_DATASET,
	CREATE_DATASET,
} from "../actions/dataset";
import {CREATE_FILE, DELETE_FILE} from "../actions/file";
import {DataAction} from "../types/action";
import {DatasetState} from "../types/data";

const defaultState: DatasetState = {
	files: [],
	about: {name: "", id: "", authorId: "", description: "", created: "", thumbnail: ""},
	datasets: [],
};

const dataset = (state = defaultState, action: DataAction) => {
	switch (action.type) {
	case RECEIVE_FILES_IN_DATASET:
		return Object.assign({}, state, {files: action.files});
	case DELETE_FILE:
		return Object.assign({}, state, {
			files: state.files.filter(file => file.id !== action.file.id),
		});
	case CREATE_FILE:
		return Object.assign({}, state, {
			files: [...state.files, action.file]
		});
	case RECEIVE_DATASET_ABOUT:
		return Object.assign({}, state, {about: action.about});
	case RECEIVE_DATASETS:
		return Object.assign({}, state, {datasets: action.datasets});
	case DELETE_DATASET:
		return Object.assign({}, state, {
			datasets: state.datasets.filter(dataset => dataset.id !== action.dataset.id),
		});
	case CREATE_DATASET:
		return Object.assign({}, state, {
			datasets: [...state.datasets, action.dataset]
		});
	default:
		return state;
	}
};

export default dataset;
