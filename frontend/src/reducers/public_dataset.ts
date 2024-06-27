import {
	INCREMENT_PUBLIC_DATASET_DOWNLOADS,
	RECEIVE_FILES_IN_PUBLIC_DATASET,
	RECEIVE_PUBLIC_DATASET_ABOUT,
	RECEIVE_PUBLIC_DATASETS,
	RECEIVE_PUBLIC_FOLDERS_FILES_IN_DATASET,
} from "../actions/public_dataset";
import { DataAction } from "../types/action";
import { PublicDatasetState } from "../types/data";
import {
	AuthorizationBase,
	DatasetOut as Dataset,
	DatasetRoles,
	FileOut,
	FileOut as File,
	FolderOut,
	Paged,
	PageMetadata,
	UserOut,
} from "../openapi/v2";

const defaultState: PublicDatasetState = {
	publicFiles: <File[]>[],
	publicAbout: <Dataset>{ creator: <UserOut>{} },
	publicDatasetRole: <AuthorizationBase>{},
	publicDatasets: <Paged>{ metadata: <PageMetadata>{}, data: <Dataset[]>[] },
	publicNewDataset: <Dataset>{},
	publicNewFile: <File>{},
	publicNewFiles: <File[]>[],
	publicRoles: <DatasetRoles>{},
	publicFoldersAndFiles: <Paged>{
		metadata: <PageMetadata>{},
		data: <FileOut | FolderOut[]>[],
	},
};

const publicDataset = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_PUBLIC_FOLDERS_FILES_IN_DATASET:
			return Object.assign({}, state, {
				publicFoldersAndFiles: action.publicFoldersAndFiles,
			});
		case RECEIVE_FILES_IN_PUBLIC_DATASET:
			return Object.assign({}, state, { publicFiles: action.publicFiles });
		case RECEIVE_PUBLIC_DATASET_ABOUT:
			return Object.assign({}, state, { publicAbout: action.publicAbout });
		case INCREMENT_PUBLIC_DATASET_DOWNLOADS:
			return Object.assign({}, state, {
				publicAbout: {
					...state.publicAbout,
					downloads: state.publicAbout.downloads + 1,
				},
			});
		case RECEIVE_PUBLIC_DATASETS:
			return Object.assign({}, state, {
				publicDatasets: action.publicDatasets,
			});
		default:
			return state;
	}
};

export default publicDataset;
