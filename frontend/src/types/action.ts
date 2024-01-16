import {
	ExtractedMetadata,
	FilePreview,
	Folder,
	MetadataJsonld,
	Profile,
} from "./data";
import {
	AuthorizationBase,
	DatasetOut as Dataset,
	DatasetRoles,
	EventListenerJobOut,
	EventListenerJobUpdateOut,
	FileOut as FileSummary,
	FileVersion,
	GroupOut as Group,
	MetadataDefinitionOut as MetadataDefinition,
	MetadataOut as Metadata,
	RoleType,
	UserAPIKeyOut,
	UserOut,
	VisualizationConfigOut,
	VisualizationDataOut,
} from "../openapi/v2";

interface RECEIVE_FILES_IN_DATASET {
	type: "RECEIVE_FILES_IN_DATASET";
	files: FileSummary[];
}

interface DELETE_FILE {
	type: "DELETE_FILE";
	file: FileSummary;
}

interface RECEIVE_DATASET_ABOUT {
	type: "RECEIVE_DATASET_ABOUT";
	about: Dataset;
}

interface RECEIVE_DATASET_ROLE {
	role: AuthorizationBase;
	type: "RECEIVE_DATASET_ROLE";
}

interface RECEIVE_DATASET_ROLES {
	roles: DatasetRoles;
	type: "RECEIVE_DATASET_ROLES";
}

interface RECEIVE_FILE_ROLE {
	role: AuthorizationBase;
	type: "RECEIVE_FILE_ROLE";
}

interface RECEIVE_DATASETS {
	type: "RECEIVE_DATASETS";
	datasets: Dataset[];
}

interface DELETE_DATASET {
	type: "DELETE_DATASET";
	dataset: Dataset;
}

interface RECEIVE_FILE_EXTRACTED_METADATA {
	type: "RECEIVE_FILE_EXTRACTED_METADATA";
	extractedMetadata: ExtractedMetadata[];
}

interface RECEIVE_FILE_METADATA_JSONLD {
	type: "RECEIVE_FILE_METADATA_JSONLD";
	metadataJsonld: MetadataJsonld[];
}

interface RECEIVE_PREVIEWS {
	type: "RECEIVE_PREVIEWS";
	previews: FilePreview[];
}

interface RECEIVE_VERSIONS {
	type: "RECEIVE_VERSIONS";
	fileVersions: FileVersion[];
}

interface CHANGE_SELECTED_VERSION {
	type: "CHANGE_SELECTED_VERSION";
	selected_version: number;
}

interface SET_USER {
	type: "SET_USER";
	Authorization: string;
}

interface TOGGLE_ADMIN_MODE {
	adminMode: boolean;
	type: "TOGGLE_ADMIN_MODE";
}

interface GET_ADMIN_MODE_STATUS {
	adminMode: boolean;
	type: "GET_ADMIN_MODE_STATUS";
}

interface LOGIN_ERROR {
	errorMsg: string;
	type: "LOGIN_ERROR";
}

interface LOGOUT {
	type: "LOGOUT";
	loggedOut: boolean;
}

interface RESET_LOGOUT {
	type: "RESET_LOGOUT";
	loggedOut: boolean;
}

interface REGISTER_ERROR {
	errorMsg: string;
	type: "REGISTER_ERROR";
}

interface REGISTER_USER {
	type: "REGISTER_USER";
}

interface LIST_API_KEYS {
	type: "LIST_API_KEYS";
	apiKeys: UserAPIKeyOut[];
}

interface DELETE_API_KEY {
	type: "DELETE_API_KEY";
	apiKey: UserAPIKeyOut;
}

interface GENERATE_API_KEY {
	type: "GENERATE_API_KEY";
	hashedKey: string;
}

interface RESET_API_KEY {
	type: "RESET_API_KEY";
	apiKey: string;
}

interface RECEIVE_USER_PROFILE {
	type: "RECEIVE_USER_PROFILE";
	profile: Profile;
}

interface CREATE_DATASET {
	type: "CREATE_DATASET";
	dataset: Dataset;
}

interface RESET_CREATE_DATASET {
	type: "RESET_CREATE_DATASET";
	newDataset: Dataset;
}

interface CREATE_FILE {
	type: "CREATE_FILE";
	newFile: File;
}

interface RESET_CREATE_FILE {
	type: "RESET_CREATE_FILE";
	newFile: File;
	file: FileSummary;
}

interface GENERATE_API_KEY {
	type: "GENERATE_API_KEY";
	apiKey: string;
}

interface RESET_API_KEY {
	type: "RESET_API_KEY";
	apiKey: string;
}

interface FAILED {
	stack: string;
	type: "FAILED";
	reason: string;
}

interface FAILED_INLINE {
	stack: string;
	type: "FAILED_INLINE";
	reason: string;
}

interface NOT_FOUND {
	stack: string;
	type: "NOT_FOUND";
	reason: string;
}

interface NOT_FOUND_INLINE {
	stack: string;
	type: "NOT_FOUND_INLINE";
	reason: string;
}

interface RESET_FAILED {
	type: "RESET_FAILED";
	reason: string;
}

interface RESET_FAILED_INLINE {
	type: "RESET_FAILED_INLINE";
	reason: string;
}

interface FOLDER_ADDED {
	type: "FOLDER_ADDED";
	folder: Folder;
}

interface RECEIVE_FILE_SUMMARY {
	type: "RECEIVE_FILE_SUMMARY";
	fileSummary: FileSummary;
}

interface RECEIVE_DATASET_METADATA {
	type: "RECEIVE_DATASET_METADATA";
	metadataList: Metadata[];
}

interface RECEIVE_FILE_METADATA {
	type: "RECEIVE_FILE_METADATA";
	metadataList: Metadata[];
}

interface RECEIVE_FOLDERS_IN_DATASET {
	type: "RECEIVE_FOLDERS_IN_DATASET";
	folders: Folder[];
}

interface UPDATE_DATASET_METADATA {
	type: "UPDATE_DATASET_METADATA";
	metadata: Metadata;
}

interface UPDATE_FILE_METADATA {
	type: "UPDATE_FILE_METADATA";
	metadata: Metadata;
}

interface POST_DATASET_METADATA {
	type: "POST_DATASET_METADATA";
	metadata: Metadata;
}

interface POST_FILE_METADATA {
	type: "POST_FILE_METADATA";
	metadata: Metadata;
}

interface RECEIVE_METADATA_DEFINITIONS {
	type: "RECEIVE_METADATA_DEFINITIONS";
	metadataDefinitionList: MetadataDefinition[];
}

interface RECEIVE_METADATA_DEFINITION {
	type: "RECEIVE_METADATA_DEFINITION";
	metadataDefinition: MetadataDefinition;
}

interface SEARCH_METADATA_DEFINITIONS {
	type: "SEARCH_METADATA_DEFINITIONS";
	metadataDefinitionList: MetadataDefinition[];
}

interface DELETE_METADATA_DEFINITION {
	type: "DELETE_METADATA_DEFINITION";
	metadataDefinition: MetadataDefinition;
}

interface SAVE_METADATA_DEFINITIONS {
	type: "SAVE_METADATA_DEFINITIONS";
	metadataDefinitionList: MetadataDefinition[];
}

interface DOWNLOAD_FILE {
	type: "DOWNLOAD_FILE";
	blob: Blob;
}

interface RECEIVE_FILE_PRESIGNED_URL {
	type: "RECEIVE_FILE_PRESIGNED_URL";
	presignedUrl: string;
}

interface RESET_FILE_PRESIGNED_URL {
	type: "RESET_FILE_PRESIGNED_URL";
	preSignedUrl: string;
}

interface DELETE_DATASET_METADATA {
	type: "DELETE_DATASET_METADATA";
	metadata: Metadata;
}

interface DELETE_FILE_METADATA {
	type: "DELETE_FILE_METADATA";
	metadata: Metadata;
}

interface FOLDER_DELETED {
	type: "FOLDER_DELETED";
	folder: Folder;
}

interface GET_FOLDER_PATH {
	type: "GET_FOLDER_PATH";
	folderPath: string[];
}

interface RECEIVE_LISTENERS {
	type: "RECEIVE_LISTENERS";
	listeners: [];
}

interface SEARCH_LISTENERS {
	type: "SEARCH_LISTENERS";
	listeners: [];
}

interface RECEIVE_LISTENER_CATEGORIES {
	type: "RECEIVE_LISTENER_CATEGORIES";
	categories: [];
}

interface RECEIVE_LISTENER_LABELS {
	type: "RECEIVE_LISTENER_LABELS";
	labels: [];
}

interface RECEIVE_LISTENER_JOBS {
	type: "RECEIVE_LISTENER_JOBS";
	jobs: EventListenerJobUpdateOut[];
}

interface SUBMIT_FILE_EXTRACTION {
	type: "SUBMIT_FILE_EXTRACTION";
	job_id: string;
}

interface SUBMIT_DATASET_EXTRACTION {
	type: "SUBMIT_DATASET_EXTRACTION";
	job_id: string;
}

interface FETCH_JOB_SUMMARY {
	type: "FETCH_JOB_SUMMARY";
	currJobSummary: EventListenerJobOut;
}

interface RESET_JOB_SUMMARY {
	type: "RESET_JOB_SUMMARY";
	currJobSummary: EventListenerJobOut;
}

interface FETCH_JOB_UPDATES {
	type: "FETCH_JOB_UPDATES";
	currJobUpdates: EventListenerJobUpdateOut[];
}

interface RESET_JOB_UPDATES {
	type: "RESET_JOB_UPDATES";
	currJobUpdates: EventListenerJobUpdateOut[];
}

interface CREATE_GROUP {
	type: "CREATE_GROUP";
	about: Group;
}

interface RECEIVE_GROUPS {
	type: "RECEIVE_GROUPS";
	groups: Group[];
}

interface SEARCH_GROUPS {
	type: "SEARCH_GROUPS";
	groups: Group[];
}

interface DELETE_GROUP {
	type: "DELETE_GROUP";
	about: Group;
}

interface RECEIVE_GROUP_ABOUT {
	type: "RECEIVE_GROUP_ABOUT";
	about: Group;
}

interface RECEIVE_GROUP_ROLE {
	type: "RECEIVE_GROUP_ROLE";
	role: RoleType;
}

interface DELETE_GROUP_MEMBER {
	about: Group;
	type: "DELETE_GROUP_MEMBER";
}

interface ADD_GROUP_MEMBER {
	about: Group;
	type: "ADD_GROUP_MEMBER";
}

interface LIST_USERS {
	type: "LIST_USERS";
	users: UserOut[];
}

interface PREFIX_SEARCH_USERS {
	type: "PREFIX_SEARCH_USERS";
	users: UserOut[];
}

interface ASSIGN_GROUP_MEMBER_ROLE {
	type: "ASSIGN_GROUP_MEMBER_ROLE";
	about: Group;
}

interface GET_VIS_DATA {
	type: "GET_VIS_DATA";
	visData: VisualizationDataOut;
}

interface GET_VIS_CONFIG {
	type: "GET_VIS_CONFIG";
	visConfig: VisualizationConfigOut;
}

interface DOWNLOAD_VIS_DATA {
	type: "DOWNLOAD_VIS_DATA";
	blob: Blob;
}

interface GET_VIS_DATA_PRESIGNED_URL {
	type: "GET_VIS_DATA_PRESIGNED_URL";
	presignedUrl: string;
}

interface RESET_VIS_DATA_PRESIGNED_URL {
	type: "RESET_VIS_DATA_PRESIGNED_URL";
	preSignedUrl: string;
}

export type DataAction =
	| GET_ADMIN_MODE_STATUS
	| TOGGLE_ADMIN_MODE
	| RECEIVE_FILES_IN_DATASET
	| RECEIVE_FOLDERS_IN_DATASET
	| DELETE_FILE
	| RECEIVE_DATASET_ABOUT
	| RECEIVE_DATASET_ROLE
	| RECEIVE_DATASETS
	| DELETE_DATASET
	| RECEIVE_FILE_SUMMARY
	| RECEIVE_FILE_ROLE
	| RECEIVE_FILE_EXTRACTED_METADATA
	| RECEIVE_FILE_METADATA_JSONLD
	| RECEIVE_PREVIEWS
	| RECEIVE_VERSIONS
	| CHANGE_SELECTED_VERSION
	| SET_USER
	| LOGIN_ERROR
	| LOGOUT
	| REGISTER_ERROR
	| REGISTER_USER
	| LIST_API_KEYS
	| DELETE_API_KEY
	| GENERATE_API_KEY
	| RESET_API_KEY
	| CREATE_DATASET
	| RESET_CREATE_DATASET
	| CREATE_FILE
	| RESET_CREATE_FILE
	| FAILED
	| FAILED_INLINE
	| NOT_FOUND
	| NOT_FOUND_INLINE
	| RESET_FAILED
	| RESET_FAILED_INLINE
	| RESET_LOGOUT
	| FOLDER_ADDED
	| UPDATE_DATASET_METADATA
	| UPDATE_FILE_METADATA
	| POST_DATASET_METADATA
	| POST_FILE_METADATA
	| RECEIVE_METADATA_DEFINITIONS
	| RECEIVE_METADATA_DEFINITION
	| SEARCH_METADATA_DEFINITIONS
	| DELETE_METADATA_DEFINITION
	| SAVE_METADATA_DEFINITIONS
	| RECEIVE_DATASET_METADATA
	| RECEIVE_FILE_METADATA
	| DELETE_DATASET_METADATA
	| DELETE_FILE_METADATA
	| DOWNLOAD_FILE
	| RECEIVE_FILE_PRESIGNED_URL
	| RESET_FILE_PRESIGNED_URL
	| FOLDER_DELETED
	| GET_FOLDER_PATH
	| RECEIVE_LISTENERS
	| SEARCH_LISTENERS
	| RECEIVE_LISTENER_CATEGORIES
	| RECEIVE_LISTENER_LABELS
	| RECEIVE_LISTENER_JOBS
	| SUBMIT_FILE_EXTRACTION
	| SUBMIT_DATASET_EXTRACTION
	| FETCH_JOB_SUMMARY
	| RESET_JOB_SUMMARY
	| FETCH_JOB_UPDATES
	| RESET_JOB_UPDATES
	| CREATE_GROUP
	| RECEIVE_GROUPS
	| SEARCH_GROUPS
	| DELETE_GROUP
	| RECEIVE_GROUP_ABOUT
	| RECEIVE_GROUP_ROLE
	| DELETE_GROUP_MEMBER
	| ADD_GROUP_MEMBER
	| ASSIGN_GROUP_MEMBER_ROLE
	| LIST_USERS
	| PREFIX_SEARCH_USERS
	| RECEIVE_DATASET_ROLES
	| RECEIVE_USER_PROFILE
	| GET_VIS_DATA
	| GET_VIS_CONFIG
	| DOWNLOAD_VIS_DATA
	| GET_VIS_DATA_PRESIGNED_URL
	| RESET_VIS_DATA_PRESIGNED_URL;
