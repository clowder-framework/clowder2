import {
	DELETE_DATASET_METADATA,
	DELETE_FILE_METADATA,
	DELETE_METADATA_DEFINITION,
	POST_DATASET_METADATA,
	POST_FILE_METADATA,
	RECEIVE_DATASET_METADATA,
	RECEIVE_FILE_METADATA,
	RECEIVE_METADATA_DEFINITION,
	RECEIVE_METADATA_DEFINITIONS,
	RECEIVE_PUBLIC_DATASET_METADATA,
	RECEIVE_PUBLIC_FILE_METADATA,
	RECEIVE_PUBLIC_METADATA_DEFINITIONS,
	RESET_SAVE_METADATA_DEFINITIONS,
	SAVE_METADATA_DEFINITION,
	SEARCH_METADATA_DEFINITIONS,
	UPDATE_DATASET_METADATA,
	UPDATE_FILE_METADATA,
	EDIT_METADATA_DEFINITION,
} from "../actions/metadata";
import { DataAction } from "../types/action";
import { MetadataState } from "../types/data";
import { MetadataDefinitionOut, Paged, PageMetadata } from "../openapi/v2/";

const defaultState: MetadataState = {
	datasetMetadataList: [],
	publicDatasetMetadataList: [],
	fileMetadataList: [],
	metadataDefinitionList: <Paged>{
		metadata: <PageMetadata>{},
		data: <MetadataDefinitionOut[]>[],
	},
	publicFileMetadataList: [],
	publicMetadataDefinitionList: [],
	metadataDefinition: <MetadataDefinitionOut>{},
	newMetadataDefinition: <MetadataDefinitionOut>{},
	deletedMetadataDefinition: <MetadataDefinitionOut>{},
};

const metadata = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_METADATA_DEFINITIONS:
			return Object.assign({}, state, {
				metadataDefinitionList: action.metadataDefinitionList,
			});
		case RECEIVE_PUBLIC_METADATA_DEFINITIONS:
			return Object.assign({}, state, {
				publicMetadataDefinitionList: action.publicMetadataDefinitionList,
			});
		case RECEIVE_METADATA_DEFINITION:
			return Object.assign({}, state, {
				metadataDefinition: action.metadataDefinition,
			});
		case SEARCH_METADATA_DEFINITIONS:
			return Object.assign({}, state, {
				metadataDefinitionList: action.metadataDefinitionList,
			});
		case DELETE_METADATA_DEFINITION:
			return Object.assign({}, state, {
				deletedMetadataDefinition: action.metadataDefinition,
			});
		case SAVE_METADATA_DEFINITION:
			return Object.assign({}, state, {
				newMetadataDefinition: action.metadataDefinition,
			});
		case EDIT_METADATA_DEFINITION:
			return Object.assign({}, state, {
				metadataDefinition: action.metadataDefinition,
			});
		case RESET_SAVE_METADATA_DEFINITIONS:
			return Object.assign({}, state, {
				newMetadataDefinition: {},
			});
		case RECEIVE_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: action.metadataList,
			});
		case RECEIVE_PUBLIC_DATASET_METADATA:
			return Object.assign({}, state, {
				publicDatasetMetadataList: action.publicDatasetMetadataList,
			});
		case RECEIVE_FILE_METADATA:
			return Object.assign({}, state, {
				fileMetadataList: action.metadataList,
			});
		case RECEIVE_PUBLIC_FILE_METADATA:
			return Object.assign({}, state, {
				publicFileMetadataList: action.publicFileMetadataList,
			});
		case UPDATE_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: state.datasetMetadataList.map((dm) => {
					if (dm.id === action.metadata.id) {
						return action.metadata;
					}
					return dm;
				}),
			});
		case DELETE_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: state.datasetMetadataList.filter(
					(metadata) => metadata.id !== action.metadata.id
				),
			});
		case DELETE_FILE_METADATA:
			return Object.assign({}, state, {
				fileMetadataList: state.fileMetadataList.filter(
					(metadata) => metadata.id !== action.metadata.id
				),
			});
		case UPDATE_FILE_METADATA:
			return Object.assign({}, state, {
				fileMetadataList: state.fileMetadataList.map((fm) => {
					if (fm.id === action.metadata.id) {
						return action.metadata;
					}
					return fm;
				}),
			});
		case POST_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: [...state.datasetMetadataList, action.metadata],
			});
		case POST_FILE_METADATA:
			return Object.assign({}, state, {
				fileMetadataList: [...state.fileMetadataList, action.metadata],
			});
		default:
			return state;
	}
};

export default metadata;
