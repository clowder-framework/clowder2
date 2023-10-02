import {
	AuthorizationBase,
	DatasetOut as Dataset,
	DatasetRoles,
	EventListenerJobDB,
	FileOut as FileSummary,
	FileVersion,
	FolderOut,
	GroupOut,
	MetadataDefinitionOut,
	MetadataOut as Metadata,
	RoleType,
	UserAPIKeyOut,
	UserOut,
	VisualizationConfigOut,
	VisualizationDataOut,
} from "../openapi/v2";

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

export interface Profile {
	id: string;
	email: string;
	first_name: string | null;
	last_name: string | null;
}

export interface Profile {
	id: string;
	email: string;
	first_name: string | null;
	last_name: string | null;
}

export interface Folder {
	id: string;
	name: string;
	creator: UserOut;
	parent_folder: string | null;
}

export interface FileMetadata {
	id: string;
	"content-type": string;
	size: number;
	created: string | Date;
	name: string;
	creator: UserOut;
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

export interface ResourceReference {
	collection: string;
	resource_id: string;
	version: number;
}

export interface ExtractedMetadata {
	id: string;
	context: (Context | string)[];
	agent: Agent;
	resource: ResourceReference;
	content: Record<string, unknown>;
	created_at: string | Date;
}

export interface MetadataJsonld {
	id: string;
	"@context": (Context | string)[];
	agent: Agent;
	attached_to: AttatchTo;
	content: Record<string, unknown>;
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
	roles: DatasetRoles;
}

export interface ListenerState {
	listeners: Listener[];
	categories: string[];
	labels: string[];
	jobs: EventListenerJobDB[];
	currJobUpdates: EventListenerJobDB[];
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
	metadataDefinition: MetadataDefinitionOut;
	datasetMetadataList: Metadata[];
	fileMetadataList: Metadata[];
}

export interface FileState {
	url: string;
	blob: Blob;
	fileSummary: FileSummary;
	extractedMetadata: ExtractedMetadata[];
	metadataJsonld: MetadataJsonld[];
	previews: FilePreview[];
	fileVersions: FileVersion[];
	fileRole: AuthorizationBase;
	presignedUrl: string;
	selected_version_num: number;
}

export interface UserState {
	Authorization: string | null;
	loginError: boolean;
	registerSucceeded: boolean;
	errorMsg: string;
	hashedKey: string;
	apiKeys: UserAPIKeyOut[];
	profile: UserOut;
}

export interface ErrorState {
	reasonInline: string;
	stacknline: string;
	origin: string;
	stack: string;
	reason: string;
	loggedOut: boolean;
}

export interface FolderState {
	folders: FolderOut[];
	folderPath: string[];
}

export interface JobSummary {
	id?: string;
	job_id: string;
	status: string;
	timestamp: string;
}

export interface VisualizationState {
	visData: VisualizationDataOut;
	visConfig: VisualizationConfigOut[];
	presignedUrl: string;
	blob: Blob;
}

export interface EventListenerJobStatus {
	created: string;
	started: string;
	processing: string;
	succeeded: string;
	error: string;
	skipped: string;
	resubmitted: string;
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
	visualization: VisualizationState;
}
