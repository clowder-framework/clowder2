import {
	AuthorizationBase,
	EventListenerJob,
	FileOut as FileSummary,
	FileVersion,
	FolderOut,
	GroupAndRole,
	GroupOut,
	MetadataDefinitionOut,
	MetadataOut as Metadata,
	RoleType,
	UserAndRole,
	UserOut,
} from "../openapi/v2";

export interface Dataset {
	name: string;
	description: string;
	id: string;
	author: Author;
	created: string | Date;
	modified: string | Date;
	files: string[];
	status: string;
	views: string;
	downloads: string;
	thumbnail: string;
}

export interface Extractor {
	name: string;
	description: string;
	id: string;
	parameters: any;
}

export interface Listener {
	name: string;
	description: string;
	id: string;
	parameters: any;
}

export interface Author {
	id: string;
	email: string;
	first_name: string | null;
	last_name: string | null;
}

export interface Folder {
	id: string;
	name: string;
	author: Author;
	parent_folder: string | null;
}

export interface FileMetadata {
	id: string;
	"content-type": string;
	size: number;
	created: string | Date;
	name: string;
	creator: Author;
	status: string;
	filedescription: string;
	thumbnail: string;
	downloads: number;
	views: number;
	version: string;
}

export interface FileMetadataList {
	id: string;
	metadata: FileMetadata;
}

export interface Preview {
	p_id: string;
	pv_route: string;
	pv_id: string;
	p_path: string;
	pv_contenttype: string;
}

export interface FilePreview {
	file_id: string;
	previews: Preview[];
}

export interface PreviewConfiguration {
	previewType: string;
	url: string;
	fileid: string;
	previewer: string;
	fileType: string;
	resource: string | null;
}

export interface Path {
	name: string;
	id: string;
	type: string;
}

export interface ExtractedMetadata {
	filename: string;
}

export interface MetadataJsonld {
	id: string;
	"@context": (Context | string)[];
	agent: Agent;
	attached_to: AttatchTo;
	content: any;
	created_at: string | Date;
}

interface Context {
	database: string;
	scan: string;
}

interface Agent {
	"@type": string;
	extractor_id: string;
	name: string;
}

interface AttatchTo {
	resource_type: string;
	url: string;
}

export interface Thumbnail {
	id: string;
	thumbnail: string;
}

export interface DatasetState {
	files: FileSummary[];
	datasets: Dataset[];
	newDataset: Dataset;
	newFile: FileSummary;
	about: Dataset;
	datasetRole: AuthorizationBase;
	groupsAndRoles: GroupAndRole[];
	usersAndRoles: UserAndRole[];
}

export interface ListenerState {
	listeners: Listener[];
	categories: string[];
	labels: string[];
	jobs: EventListenerJob[];
	currJobUpdates: EventListenerJob[];
	currJobSummary: JobSummary[];
	currJobId: string;
}

export interface GroupState {
	groups: GroupOut[];
	about: GroupOut;
	role: RoleType;
	users: UserOut[];
}

export interface MetadataState {
	metadataDefinitionList: MetadataDefinitionOut[];
	datasetMetadataList: Metadata[];
	fileMetadataList: Metadata[];
}

export interface FileState {
	fileSummary: FileSummary;
	extractedMetadata: ExtractedMetadata;
	metadataJsonld: MetadataJsonld[];
	previews: FilePreview[];
	fileVersions: FileVersion[];
	fileRole: AuthorizationBase;
}

export interface UserState {
	Authorization: string | null;
	loginError: boolean;
	registerSucceeded: boolean;
	errorMsg: string;
	apiKey: string;
}

export interface ErrorState {
	stack: string;
	reason: string;
	loggedOut: boolean;
}

export interface FolderState {
	folders: FolderOut[];
	folderPath: String[];
}

export interface JobSummary {
	id?: string;
	job_id: string;
	status: string;
	timestamp: string;
}

export interface RootState {
	metadata: MetadataState;
	error: ErrorState;
	file: FileState;
	dataset: DatasetState;
	listener: ListenerState;
	group: GroupState;
	user: UserState;
	folder: FolderState;
}
