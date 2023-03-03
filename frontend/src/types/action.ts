import {Dataset, ExtractedMetadata, MetadataJsonld, FilePreview, Folder} from "./data";
import {MetadataOut as Metadata, FileOut as FileSummary, FileVersion, AuthorizationBase} from "../openapi/v2";
import {MetadataDefinitionOut as MetadataDefinition} from "../openapi/v2";
import {
	DELETE_DATASET_METADATA,
	DELETE_FILE_METADATA,
	POST_DATASET_METADATA,
	UPDATE_DATASET_METADATA
} from "../actions/metadata";
import {RESET_CREATE_FILE} from "../actions/file";
import {GET_FOLDER_PATH} from "../actions/folder";
import {RECEIVE_LISTENER_CATEGORIES, RECEIVE_LISTENER_JOBS, SEARCH_LISTENERS} from "../actions/listeners";
import {RECEIVE_DATASET_ROLE} from "../actions/authorization";

interface RECEIVE_FILES_IN_DATASET {
	type: "RECEIVE_FILES_IN_DATASET";
	files: FileSummary[];
}

interface DELETE_FILE {
	type: "DELETE_FILE";
	file: FileSummary;
}

interface RECEIVE_DATASET_ABOUT{
	type: "RECEIVE_DATASET_ABOUT";
	about: Dataset;
}

interface RECEIVE_DATASET_ROLE{
	role: AuthorizationBase;
	type: "RECEIVE_DATASET_ROLE";
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
interface RESET_CREATE_DATASET{
	type: "RESET_CREATE_DATASET",
	newDataset: Dataset
}

interface CREATE_FILE{
	type: "CREATE_FILE",
	newFile: File
}

interface RESET_CREATE_FILE{
	type: "RESET_CREATE_FILE",
	newFile: File
	file: FileSummary
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

interface RECEIVE_FILE_SUMMARY{
	type: "RECEIVE_FILE_SUMMARY",
	fileSummary: FileSummary
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

interface SAVE_METADATA_DEFINITIONS{
	type:"SAVE_METADATA_DEFINITIONS",
	metadataDefinitionList: MetadataDefinition[]
}

interface DOWNLOAD_FILE{
	type:"DOWNLOAD_FILE"
}

interface DELETE_DATASET_METADATA{
	type: "DELETE_DATASET_METADATA"
	metadata: Metadata
}

interface DELETE_FILE_METADATA{
	type: "DELETE_FILE_METADATA"
	metadata: Metadata
}

interface FOLDER_DELETED{
	type: "FOLDER_DELETED"
	folder: Folder
}

interface GET_FOLDER_PATH{
	type: "GET_FOLDER_PATH"
	folderPath: String[]
}

interface RECEIVE_LISTENERS{
	type: "RECEIVE_LISTENERS"
	listeners: []
}

interface SEARCH_LISTENERS{
	type: "SEARCH_LISTENERS"
	listeners: []
}

interface RECEIVE_LISTENER_CATEGORIES{
	type: "RECEIVE_LISTENER_CATEGORIES"
	categories: []
}

interface RECEIVE_LISTENER_LABELS{
	type: "RECEIVE_LISTENER_LABELS"
	labels: []
}

interface RECEIVE_LISTENER_JOBS{
	type: "RECEIVE_LISTENER_JOBS"
	jobs: []
}

export type DataAction =
	| RECEIVE_FILES_IN_DATASET
	| RECEIVE_FOLDERS_IN_DATASET
	| DELETE_FILE
	| RECEIVE_DATASET_ABOUT
	| RECEIVE_DATASET_ROLE
	| RECEIVE_DATASETS
	| DELETE_DATASET
	| RECEIVE_FILE_SUMMARY
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
	| RESET_CREATE_DATASET
	| CREATE_FILE
	| RESET_CREATE_FILE
	| FAILED
	| RESET_FAILED
	| RESET_LOGOUT
	| FOLDER_ADDED
	| UPDATE_DATASET_METADATA
	| UPDATE_FILE_METADATA
	| POST_DATASET_METADATA
	| POST_FILE_METADATA
	| RECEIVE_METADATA_DEFINITIONS
	| SAVE_METADATA_DEFINITIONS
	| RECEIVE_DATASET_METADATA
	| RECEIVE_FILE_METADATA
	| DELETE_DATASET_METADATA
	| DELETE_FILE_METADATA
	| DOWNLOAD_FILE
	| FOLDER_DELETED
	| GET_FOLDER_PATH
	| RECEIVE_LISTENERS
	| SEARCH_LISTENERS
	| RECEIVE_LISTENER_CATEGORIES
	| RECEIVE_LISTENER_LABELS
	| RECEIVE_LISTENER_JOBS
	;
