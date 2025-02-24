import {
	AuthorizationBase,
	DatasetFreezeOut,
	DatasetOut,
	DatasetRoles,
	EventListenerJobDB,
	FeedOut,
	FileOut,
	FileVersion,
	FolderOut,
	GroupOut,
	LicenseOut,
	MetadataDefinitionOut,
	MetadataOut as Metadata,
	Paged,
	ProjectOut,
	RoleType,
	UserAPIKeyOut,
	UserOut,
	VisualizationConfigOut,
	VisualizationDataOut,
} from "../openapi/v2";

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

export interface ProjectState {
	newProject: ProjectOut;
	datasets: DatasetOut[];
	members: DatasetRoles;
}

export interface DatasetState {
	foldersAndFiles: Paged;
	files: Paged;
	folders: Paged;
	datasets: Paged;
	myDatasets: Paged;
	deletedDataset: DatasetOut;
	deletedFolder: FolderOut;
	deletedFile: FileOut;
	newDataset: DatasetOut;
	newFile: FileOut;
	newFolder: FolderOut;
	newFiles: FileOut[];
	about: DatasetOut;
	frozenDataset: DatasetFreezeOut;
	deletedFrozenDataset: DatasetFreezeOut;
	newFrozenDataset: DatasetFreezeOut;
	frozenDatasets: Paged;
	latestFrozenVersionNum: number;
	datasetRole: AuthorizationBase;
	roles: DatasetRoles;
	license: LicenseOut;
}

export interface PublicDatasetState {
	publicFiles: FileOut[];
	publicDatasets: Paged;
	publicFrozenDatasets: Paged;
	publicNewDataset: DatasetOut;
	publicNewFile: FileOut;
	publicNewFiles: FileOut[];
	publicAbout: DatasetOut;
	publicDatasetRole: AuthorizationBase;
	publicRoles: DatasetRoles;
	publicFoldersAndFiles: Paged;
	license: LicenseOut;
}

export interface ListenerState {
	listeners: Paged;
	categories: string[];
	labels: string[];
	jobs: Paged;
	currJobUpdates: EventListenerJobDB[];
	currJobSummary: JobSummary[];
	currJobId: string;
}

export interface GroupState {
	groups: Paged;
	newGroup: GroupOut;
	deletedGroup: GroupOut;
	about: GroupOut;
	role: RoleType;
	users: Paged;
}

export interface MetadataState {
	metadataDefinitionList: Paged;
	publicMetadataDefinitionList: MetadataDefinitionOut[];
	metadataDefinition: MetadataDefinitionOut;
	datasetMetadataList: Metadata[];
	publicDatasetMetadataList: Metadata[];
	fileMetadataList: Metadata[];
	newMetadataDefinition: MetadataDefinitionOut;
	deletedMetadataDefinition: MetadataDefinitionOut;
	publicFileMetadataList: Metadata[];
}

export interface FileState {
	blob: Blob;
	fileSummary: FileOut;
	extractedMetadata: ExtractedMetadata[];
	metadataJsonld: MetadataJsonld[];
	previews: FilePreview[];
	fileVersions: FileVersion[];
	fileRole: RoleType;
	presignedUrl: string;
	selected_version_num: number;
}

export interface PublicFileState {
	publicUrl: string;
	publicBlob: Blob;
	publicFileSummary: FileOut;
	publicExtractedMetadata: ExtractedMetadata[];
	publicMetadataJsonld: MetadataJsonld[];
	publicPreviews: FilePreview[];
	publicFileVersions: FileVersion[];
	publicSelected_version_num: number;
}

export interface UserState {
	Authorization: string | null;
	loginError: boolean;
	registerSucceeded: boolean;
	errorMsg: string;
	hashedKey: string;
	apiKeys: Paged;
	deletedApiKey: UserAPIKeyOut;
	profile: UserOut;
	adminMode: boolean;
	read_only_user: boolean;
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
	folders: Paged;
	newFolder: FolderOut;
	folderPath: string[];
	publicFolders: FolderOut[];
	publicFolderPath: string[];
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

export interface PublicVisualizationState {
	publicVisData: VisualizationDataOut;
	publicVisConfig: VisualizationConfigOut[];
	publicPresignedUrl: string;
	publicBlob: Blob;
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

export interface FeedState {
	feeds: Paged;
	feed: FeedOut;
	deletedFeed: FeedOut;
}

export interface RootState {
	metadata: MetadataState;
	error: ErrorState;
	file: FileState;
	publicFile: PublicFileState;
	dataset: DatasetState;
	project: ProjectState;
	publicDataset: PublicDatasetState;
	listener: ListenerState;
	group: GroupState;
	user: UserState;
	folder: FolderState;
	visualization: VisualizationState;
	publicVisualization: PublicVisualizationState;
	feed: FeedState;
}
