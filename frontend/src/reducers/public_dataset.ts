import {
	RECEIVE_PUBLIC_DATASET_ABOUT,
	RECEIVE_PUBLIC_DATASETS,
	RECEIVE_FILES_IN_PUBLIC_DATASET,
	RECEIVE_FOLDERS_IN_PUBLIC_DATASET
} from "../actions/public_dataset";
import { DataAction } from "../types/action";
import { PublicDatasetState } from "../types/data";
import {
	AuthorizationBase,
	DatasetOut as Dataset,
	DatasetRoles,
	FileOut as File,
	UserOut,
} from "../openapi/v2";

const defaultState: PublicDatasetState = {
	public_files: <File[]>[],
	public_about: <Dataset>{ creator: <UserOut>{} },
	public_datasetRole: <AuthorizationBase>{},
	public_datasets: [],
	public_newDataset: <Dataset>{},
	public_newFile: <File>{},
	public_newFiles: <File[]>[],
	public_roles: <DatasetRoles>{},
};

const public_dataset = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_FILES_IN_PUBLIC_DATASET:
			return Object.assign({}, state, { public_files: action.public_files });
		case RECEIVE_PUBLIC_DATASET_ABOUT:
			return Object.assign({}, state, { public_about: action.public_about });
		case RECEIVE_PUBLIC_DATASETS:
			return Object.assign({}, state, { public_datasets: action.public_datasets });
		default:
			return state;
	}
};

export default public_dataset;
