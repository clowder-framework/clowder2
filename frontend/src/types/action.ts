import {ExtractedMetadata, FilePreview, Folder, MetadataJsonld} from "./data";
import {
	AuthorizationBase,
	DatasetFreezeOut,
	DatasetOut,
	DatasetOut as Dataset,
	DatasetRoles,
	EventListenerJobOut,
	EventListenerJobUpdateOut,
	EventListenerOut,
	FeedOut,
	FileOut,
	FileOut as FileSummary,
	FileVersion,
	FolderOut,
	GroupOut as Group,
	LicenseOut,
	MetadataDefinitionOut as MetadataDefinition,
	MetadataOut as Metadata,
	Paged,
	ProjectOut as Project,
	RoleType,
	UserAPIKeyOut,
	UserOut,
	VisualizationConfigOut,
	VisualizationDataOut,
} from "../openapi/v2";
import {LIST_USERS, PREFIX_SEARCH_USERS, RECEIVE_USER_PROFILE,} from "../actions/user";

interface RECEIVE_FILES_IN_DATASET {
	type: "RECEIVE_FILES_IN_DATASET";
	files: Paged;
}

interface UPDATE_FILE {
	type: "UPDATE_FILE";
	file: FileOut;
}

interface DELETE_FILE {
	type: "DELETE_FILE";
	file: FileSummary;
}

interface RECEIVE_DATASET_ABOUT {
	type: "RECEIVE_DATASET_ABOUT";
	about: DatasetOut;
}

interface INCREMENT_DATASET_DOWNLOADS {
	type: "INCREMENT_DATASET_DOWNLOADS";
}

interface RECEIVE_DATASET_LICENSE {
	type: "RECEIVE_DATASET_LICENSE";
	license: LicenseOut;
}

interface UPDATE_DATASET_LICENSE {
	type: "UPDATE_DATASET_LICENSE";
	license: LicenseOut;
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
	datasets: Paged;
}

interface RECEIVE_MY_DATASETS {
	type: "RECEIVE_MY_DATASETS";
	myDatasets: Paged;
}

interface RECEIVE_PUBLIC_DATASETS {
	type: "RECEIVE_PUBLIC_DATASETS";
	publicDatasets: Dataset[];
}

interface RECEIVE_PUBLIC_DATASET_ABOUT {
	type: "RECEIVE_PUBLIC_DATASET_ABOUT";
	publicAbout: Dataset;
}

interface INCREMENT_PUBLIC_DATASET_DOWNLOADS {
	type: "INCREMENT_PUBLIC_DATASET_DOWNLOADS";
}

interface RECEIVE_FILES_IN_PUBLIC_DATASET {
	type: "RECEIVE_FILES_IN_PUBLIC_DATASET";
	publicFiles: FileSummary[];
}

interface DELETE_DATASET {
	type: "DELETE_DATASET";
	dataset: Paged;
}

interface RECEIVE_FILE_EXTRACTED_METADATA {
	type: "RECEIVE_FILE_EXTRACTED_METADATA";
	extractedMetadata: ExtractedMetadata[];
}

interface RECEIVE_PUBLIC_FILE_EXTRACTED_METADATA {
	type: "RECEIVE_PUBLIC_FILE_EXTRACTED_METADATA";
	publicExtractedMetadata: ExtractedMetadata[];
}

interface RECEIVE_FILE_METADATA_JSONLD {
	type: "RECEIVE_FILE_METADATA_JSONLD";
	metadataJsonld: MetadataJsonld[];
}

interface RECEIVE_PUBLIC_FILE_METADATA_JSONLD {
	type: "RECEIVE_PUBLIC_FILE_METADATA_JSONLD";
	publicMetadataJsonld: MetadataJsonld[];
}

interface RECEIVE_PREVIEWS {
	type: "RECEIVE_PREVIEWS";
	previews: FilePreview[];
}

interface RECEIVE_PUBLIC_PREVIEWS {
	type: "RECEIVE_PUBLIC_PREVIEWS";
	publicPreviews: FilePreview[];
}

interface RECEIVE_VERSIONS {
	type: "RECEIVE_VERSIONS";
	fileVersions: FileVersion[];
}

interface RECEIVE_PUBLIC_VERSIONS {
	type: "RECEIVE_PUBLIC_VERSIONS";
	publicFileVersions: FileVersion[];
}

interface CHANGE_SELECTED_VERSION {
	type: "CHANGE_SELECTED_VERSION";
	selected_version: number;
}

interface CHANGE_PUBLIC_SELECTED_VERSION {
	type: "CHANGE_PUBLIC_SELECTED_VERSION";
	publicSelected_version_num: number;
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
	profile: UserOut;
}

interface CREATE_PROJECT {
	type: "CREATE_PROJECT";
	project: Project;
}

interface RESET_CREATE_PROJECT {
	type: "RESET_CREATE_PROJECT";
}

interface RECEIVE_PROJECT {
	type: "RECEIVE_PROJECT";
	project: Project;
}

interface RECEIVE_PROJECTS {
	type: "RECEIVE_PROJECTS";
	projects: Paged;
}

interface CREATE_DATASET {
	type: "CREATE_DATASET";
	dataset: Dataset;
}

interface UPDATE_DATASET {
	type: "UPDATE_DATASET";
	about: Dataset;
}

interface RESET_CREATE_DATASET {
	type: "RESET_CREATE_DATASET";
}

interface CREATE_FILE {
	file: FileOut;
	type: "CREATE_FILE";
}

interface CREATE_FILES {
	files: FileOut[];
	type: "CREATE_FILES";
}

interface RESET_CREATE_FILE {
	type: "RESET_CREATE_FILE";
}

interface RESET_CREATE_FILES {
	type: "RESET_CREATE_FILES";
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

interface INCREMENT_FILE_DOWNLOADS {
	type: "INCREMENT_FILE_DOWNLOADS";
}

interface RECEIVE_PUBLIC_FILE_SUMMARY {
	type: "RECEIVE_PUBLIC_FILE_SUMMARY";
	publicFileSummary: FileSummary;
}

interface INCREMENT_PUBLIC_FILE_DOWNLOADS {
	type: "INCREMENT_PUBLIC_FILE_DOWNLOADS";
}

interface RECEIVE_DATASET_METADATA {
	type: "RECEIVE_DATASET_METADATA";
	metadataList: Metadata[];
}

interface RECEIVE_PUBLIC_DATASET_METADATA {
	type: "RECEIVE_PUBLIC_DATASET_METADATA";
	publicDatasetMetadataList: Metadata[];
}

interface RECEIVE_FILE_METADATA {
	type: "RECEIVE_FILE_METADATA";
	metadataList: Metadata[];
}

interface RECEIVE_PUBLIC_FILE_METADATA {
	type: "RECEIVE_PUBLIC_FILE_METADATA";
	publicFileMetadataList: Metadata[];
}

interface RECEIVE_FOLDERS_IN_DATASET {
	type: "RECEIVE_FOLDERS_IN_DATASET";
	folders: Folder[];
}

interface RECEIVE_FOLDERS_IN_PUBLIC_DATASET {
	type: "RECEIVE_FOLDERS_IN_PUBLIC_DATASET";
	publicFolders: Folder[];
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

interface RECEIVE_PUBLIC_METADATA_DEFINITIONS {
	type: "RECEIVE_PUBLIC_METADATA_DEFINITIONS";
	publicMetadataDefinitionList: MetadataDefinition[];
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

interface EDIT_METADATA_DEFINITION {
	type: "EDIT_METADATA_DEFINITION";
	metadataDefinition: MetadataDefinition;
}

interface SAVE_METADATA_DEFINITION {
	type: "SAVE_METADATA_DEFINITION";
	metadataDefinition: MetadataDefinition;
}

interface RESET_SAVE_METADATA_DEFINITIONS {
	type: "RESET_SAVE_METADATA_DEFINITIONS";
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

interface GET_PUBLIC_FOLDER_PATH {
	type: "GET_PUBLIC_FOLDER_PATH";
	publicFolderPath: string[];
}

interface RECEIVE_LISTENERS {
	type: "RECEIVE_LISTENERS";
	listeners: [];
}

interface TOGGLE_ACTIVE_FLAG_LISTENER {
	type: "TOGGLE_ACTIVE_FLAG_LISTENER";
	listener: EventListenerOut;
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

interface RESET_CREATE_GROUP {
	type: "RESET_CREATE_GROUP";
}

interface UPDATE_GROUP {
	type: "UPDATE_GROUP";
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
	users: Paged;
}

interface PREFIX_SEARCH_USERS {
	type: "PREFIX_SEARCH_USERS";
	users: Paged;
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

interface SET_ADMIN {
	type: "SET_ADMIN";
	profile: UserOut;
}

interface REVOKE_ADMIN {
	type: "REVOKE_ADMIN";
	profile: UserOut;
}

interface SET_READONLY {
	type: "SET_READONLY";
	profile: UserOut;
}

interface ENABLE_READONLY {
	type: "ENABLE_READONLY";
	profile: UserOut;
}

interface DISABLE_READONLY {
	type: "DISABLE_READONLY";
	profile: UserOut;
}

interface GET_PUBLIC_VIS_DATA {
	type: "GET_PUBLIC_VIS_DATA";
	publicVisData: VisualizationDataOut;
}

interface GET_PUBLIC_VIS_CONFIG {
	type: "GET_PUBLIC_VIS_CONFIG";
	publicVisConfig: VisualizationConfigOut;
}

interface DOWNLOAD_PUBLIC_VIS_DATA {
	type: "DOWNLOAD_PUBLIC_VIS_DATA";
	publicBlob: Blob;
}

interface GET_PUBLIC_VIS_DATA_PRESIGNED_URL {
	type: "GET_PUBLIC_VIS_DATA_PRESIGNED_URL";
	publicPresignedUrl: string;
}

interface RESET_PUBLIC_VIS_DATA_PRESIGNED_URL {
	type: "RESET_PUBLIC_VIS_DATA_PRESIGNED_URL";
	publicPreSignedUrl: string;
}

interface RECEIVE_FOLDERS_FILES_IN_DATASET {
	type: "RECEIVE_FOLDERS_FILES_IN_DATASET";
	foldersAndFiles: Paged;
}

interface RECEIVE_PUBLIC_FOLDERS_FILES_IN_DATASET {
	type: "RECEIVE_PUBLIC_FOLDERS_FILES_IN_DATASET";
	publicFoldersAndFiles: Paged;
}

interface FOLDER_UPDATED {
	type: "FOLDER_UPDATED";
	folder: FolderOut;
}

interface FREEZE_DATASET {
	type: "FREEZE_DATASET";
	newFrozenDataset: any;
}

interface GET_FREEZE_DATASET_LATEST_VERSION_NUM {
	type: "GET_FREEZE_DATASET_LATEST";
	latestFrozenVersionNum: number;
}

interface GET_FREEZE_DATASET {
	type: "GET_FREEZE_DATASET";
	frozenDataset: DatasetFreezeOut;
}

interface DELETE_FREEZE_DATASET {
	type: "DELETE_FREEZE_DATASET";
	frozenDataset: DatasetFreezeOut;
}

interface GET_FREEZE_DATASETS {
	type: "GET_FREEZE_DATASETS";
	frozenDatasets: Paged;
}

interface GET_PUBLIC_FREEZE_DATASETS {
	type: "GET_PUBLIC_FREEZE_DATASETS";
	publicFrozenDatasets: Paged;
}

interface CREATE_FEED {
	type: "CREATE_FEED";
	feed: FeedOut;
}

interface EDIT_FEED {
	type: "EDIT_FEED";
	feed: FeedOut;
}

interface RECEIVE_FEEDS {
	type: "RECEIVE_FEEDS";
	feeds: Paged;
}

interface RECEIVE_FEED {
	type: "RECEIVE_FEED";
	feed: FeedOut;
}

interface DELETE_FEED {
	type: "DELETE_FEED";
	feed: FeedOut;
}

export type DataAction =
	| GET_ADMIN_MODE_STATUS
	| TOGGLE_ADMIN_MODE
	| RECEIVE_FILES_IN_DATASET
	| RECEIVE_FOLDERS_IN_DATASET
	| RECEIVE_FOLDERS_IN_PUBLIC_DATASET
	| DELETE_FILE
	| RECEIVE_DATASET_ABOUT
	| INCREMENT_DATASET_DOWNLOADS
	| RECEIVE_DATASET_ROLE
	| RECEIVE_DATASETS
	| RECEIVE_MY_DATASETS
	| RECEIVE_PUBLIC_DATASETS
	| RECEIVE_PUBLIC_DATASET_ABOUT
	| INCREMENT_PUBLIC_DATASET_DOWNLOADS
	| RECEIVE_FILES_IN_PUBLIC_DATASET
	| DELETE_DATASET
	| UPDATE_DATASET
	| RECEIVE_FILE_SUMMARY
	| INCREMENT_FILE_DOWNLOADS
	| INCREMENT_FILE_DOWNLOADS
	| RECEIVE_FILE_ROLE
	| RECEIVE_FILE_EXTRACTED_METADATA
	| RECEIVE_FILE_METADATA_JSONLD
	| RECEIVE_PREVIEWS
	| RECEIVE_VERSIONS
	| CHANGE_SELECTED_VERSION
	| RECEIVE_PUBLIC_FILE_SUMMARY
	| INCREMENT_PUBLIC_FILE_DOWNLOADS
	| INCREMENT_PUBLIC_FILE_DOWNLOADS
	| RECEIVE_PUBLIC_FILE_EXTRACTED_METADATA
	| RECEIVE_PUBLIC_FILE_METADATA_JSONLD
	| RECEIVE_PUBLIC_PREVIEWS
	| RECEIVE_PUBLIC_VERSIONS
	| CHANGE_PUBLIC_SELECTED_VERSION
	| SET_USER
	| LOGIN_ERROR
	| LOGOUT
	| REGISTER_ERROR
	| REGISTER_USER
	| LIST_API_KEYS
	| DELETE_API_KEY
	| GENERATE_API_KEY
	| RESET_API_KEY
	| CREATE_PROJECT
	| RESET_CREATE_PROJECT
	| RECEIVE_PROJECT
	| RECEIVE_PROJECTS
	| CREATE_DATASET
	| RESET_CREATE_DATASET
	| CREATE_FILE
	| CREATE_FILES
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
	| RECEIVE_PUBLIC_METADATA_DEFINITIONS
	| RECEIVE_METADATA_DEFINITION
	| SEARCH_METADATA_DEFINITIONS
	| DELETE_METADATA_DEFINITION
	| SAVE_METADATA_DEFINITION
	| EDIT_METADATA_DEFINITION
	| RESET_SAVE_METADATA_DEFINITIONS
	| RECEIVE_DATASET_METADATA
	| RECEIVE_PUBLIC_DATASET_METADATA
	| RECEIVE_FILE_METADATA
	| RECEIVE_PUBLIC_FILE_METADATA
	| DELETE_DATASET_METADATA
	| DELETE_FILE_METADATA
	| DOWNLOAD_FILE
	| RECEIVE_FILE_PRESIGNED_URL
	| RESET_FILE_PRESIGNED_URL
	| FOLDER_DELETED
	| GET_FOLDER_PATH
	| GET_PUBLIC_FOLDER_PATH
	| RECEIVE_LISTENERS
	| TOGGLE_ACTIVE_FLAG_LISTENER
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
	| RESET_CREATE_GROUP
	| UPDATE_GROUP
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
	| RESET_VIS_DATA_PRESIGNED_URL
	| RESET_CREATE_FILES
	| UPDATE_FILE
	| SET_ADMIN
	| REVOKE_ADMIN
	| SET_READONLY
	| ENABLE_READONLY
	| DISABLE_READONLY
	| GET_PUBLIC_VIS_DATA
	| GET_PUBLIC_VIS_CONFIG
	| DOWNLOAD_PUBLIC_VIS_DATA
	| GET_PUBLIC_VIS_DATA_PRESIGNED_URL
	| RESET_PUBLIC_VIS_DATA_PRESIGNED_URL
	| RECEIVE_FOLDERS_FILES_IN_DATASET
	| RECEIVE_PUBLIC_FOLDERS_FILES_IN_DATASET
	| FOLDER_UPDATED
	| FREEZE_DATASET
	| GET_FREEZE_DATASET_LATEST_VERSION_NUM
	| GET_FREEZE_DATASET
	| DELETE_FREEZE_DATASET
	| GET_FREEZE_DATASETS
	| GET_PUBLIC_FREEZE_DATASETS
	| RECEIVE_DATASET_LICENSE
	| UPDATE_DATASET_LICENSE
	| CREATE_FEED
	| EDIT_FEED
	| RECEIVE_FEEDS
	| RECEIVE_FEED
	| DELETE_FEED;
