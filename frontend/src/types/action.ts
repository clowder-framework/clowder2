import {Dataset, ExtractedMetadata, File, MetadataJsonld, FilePreview, FileVersion, Folder} from "./data";
import {MetadataOut as Metadata} from "../openapi/v2";
import {MetadataDefinitionOut as MetadataDefinition} from "../openapi/v2";
import {POST_DATASET_METADATA, UPDATE_DATASET_METADATA} from "../actions/metadata";

interface RECEIVE_FILES_IN_DATASET {
	type: "RECEIVE_FILES_IN_DATASET";
	files: File[];
}

interface DELETE_FILE {
	type: "DELETE_FILE";
	file: File;
}

interface RECEIVE_DATASET_ABOUT{
	type: "RECEIVE_DATASET_ABOUT";
	about: Dataset;
}

interface RECEIVE_DATASETS{
	type: "RECEIVE_DATASETS";
	datasets: Dataset[];
}

interface DELETE_DATASET{
	type: "DELETE_DATASET";
	dataset: Dataset;
}

interface RECEIVE_FILE_EXTRACTED_METADATA{
	type: "RECEIVE_FILE_EXTRACTED_METADATA";
	extractedMetadata: ExtractedMetadata;
}

interface RECEIVE_FILE_METADATA_JSONLD{
	type:"RECEIVE_FILE_METADATA_JSONLD";
	metadataJsonld: MetadataJsonld[];
}

interface RECEIVE_PREVIEWS{
	type:"RECEIVE_PREVIEWS";
	previews: FilePreview[];
}

interface RECEIVE_VERSIONS{
	type: "RECEIVE_VERSIONS";
	fileVersions: FileVersion[];
}

interface SET_USER{
	type: "SET_USER",
	Authorization: string,
}

interface LOGIN_ERROR{
	errorMsg: string,
	type: "LOGIN_ERROR",
}

interface LOGOUT{
	type: "LOGOUT",
	loggedOut: boolean,
}

interface RESET_LOGOUT{
	type: "RESET_LOGOUT",
	loggedOut: boolean
}

interface REGISTER_ERROR{
	errorMsg: string,
	type: "REGISTER_ERROR"
}

interface REGISTER_USER{
	type: "REGISTER_USER"
}

interface CREATE_DATASET{
	type: "CREATE_DATASET",
	dataset: Dataset
}

interface CREATE_FILE{
	type: "CREATE_FILE",
	file: File
}

interface FAILED{
	stack: "string";
	type: "FAILED",
	reason: string
}

interface RESET_FAILED{
	type: "RESET_FAILED",
	reason: string
}

interface FOLDER_ADDED{
	type: "FOLDER_ADDED",
	folder: Folder
}

interface RECEIVE_DATASET_METADATA{
	type: "RECEIVE_DATASET_METADATA",
	metadataList: Metadata[]
}

interface RECEIVE_FILE_METADATA{
	type:"RECEIVE_FILE_METADATA";
	metadataList: Metadata[];
}

interface RECEIVE_FOLDERS_IN_DATASET{
	type: "RECEIVE_FOLDERS_IN_DATASET",
	folders: Folder[]
}

interface UPDATE_DATASET_METADATA{
	type:"UPDATE_DATASET_METADATA",
	metadata: Metadata
}

interface UPDATE_FILE_METADATA{
	type:"UPDATE_FILE_METADATA",
	metadata: Metadata
}

interface POST_DATASET_METADATA{
	type:"POST_DATASET_METADATA",
	metadata: Metadata
}

interface POST_FILE_METADATA{
	type:"POST_FILE_METADATA",
	metadata: Metadata
}

interface RECEIVE_METADATA_DEFINITIONS{
	type:"RECEIVE_METADATA_DEFINITIONS",
	metadataDefinitionList: MetadataDefinition[]
}

export type DataAction =
	| RECEIVE_FILES_IN_DATASET
	| RECEIVE_FOLDERS_IN_DATASET
	| DELETE_FILE
	| RECEIVE_DATASET_ABOUT
	| RECEIVE_DATASETS
	| DELETE_DATASET
	| RECEIVE_FILE_EXTRACTED_METADATA
	| RECEIVE_FILE_METADATA_JSONLD
	| RECEIVE_PREVIEWS
	| RECEIVE_VERSIONS
	| SET_USER
	| LOGIN_ERROR
	| LOGOUT
	| REGISTER_ERROR
	| REGISTER_USER
	| CREATE_DATASET
	| CREATE_FILE
	| FAILED
	| RESET_FAILED
	| RESET_LOGOUT
	| FOLDER_ADDED
	| UPDATE_DATASET_METADATA
	| UPDATE_FILE_METADATA
	| POST_DATASET_METADATA
	| POST_FILE_METADATA
	| RECEIVE_METADATA_DEFINITIONS
	| RECEIVE_DATASET_METADATA
	| RECEIVE_FILE_METADATA

	;
