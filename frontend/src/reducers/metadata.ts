import {
	POST_DATASET_METADATA,
	SAVE_METADATA_DEFINITIONS,
	POST_FILE_METADATA,
	RECEIVE_DATASET_METADATA,
	RECEIVE_METADATA_DEFINITIONS,
	RECEIVE_FILE_METADATA,
	UPDATE_DATASET_METADATA,
	UPDATE_FILE_METADATA,
	DELETE_DATASET_METADATA, DELETE_FILE_METADATA
} from "../actions/metadata";
import {DataAction} from "../types/action";
import {MetadataState} from "../types/data";

const defaultState: MetadataState = {
	datasetMetadataList: [],
	fileMetadataList: [],
	metadataDefinitionList: []
};

const metadata = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_METADATA_DEFINITIONS:
			return Object.assign({}, state, {metadataDefinitionList: action.metadataDefinitionList});
		case SAVE_METADATA_DEFINITIONS:
			return Object.assign({}, state, {metadataDefinitionList: action.metadataDefinitionList});
		case RECEIVE_DATASET_METADATA:
			return Object.assign({}, state, {datasetMetadataList: action.metadataList});
		case RECEIVE_FILE_METADATA:
			return Object.assign({}, state, {fileMetadataList: action.metadataList});
		case UPDATE_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: state.datasetMetadataList.map(dm => {
					if (dm.id === action.metadata.id){
						return action.metadata
					}
					return dm
				} ),
			});
		case DELETE_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: state.datasetMetadataList.filter(metadata => metadata.id !== action.metadata.id),
			});
		case DELETE_FILE_METADATA:
			return Object.assign({}, state, {
				fileMetadataList: state.fileMetadataList.filter(metadata => metadata.id !== action.metadata.id),
			});
		case UPDATE_FILE_METADATA:
			return Object.assign({}, state, {
				fileMetadataList: state.fileMetadataList.map(fm => {
					if (fm.id === action.metadata.id){
						return action.metadata
					}
					return fm
				} ),
			});
		case POST_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: [...state.datasetMetadataList, action.metadata]
			});
		case POST_FILE_METADATA:
			return Object.assign({}, state, {
				fileMetadataList: [...state.fileMetadataList, action.metadata]
			});
		default:
			return state;
	}
};

export default metadata;
