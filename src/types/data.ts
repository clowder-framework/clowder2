export interface Dataset {
	name: string;
	description: string;
	id:string;
	author: Author;
	created: string | Date;
	modified: string | Date;
	files: string[];
	folders: string[];
	status: string;
	views: string;
	downloads: string;
	thumbnail: string;
}

export interface Author {
	id: string;
	email: string;
	"full_name": string|null;
}

export interface File {
	version: string;
	creator: string;
	created: string | Date;
	id: string;
	name: string;
	size: number;
	"date-created": string;
	contentType:string;
}

export interface About {
	name: string;
	id: string;
	authorId: string;
	description: string;
	created: string | Date;
	thumbnail: string;
}

export interface FileMetadata {
	id: string;
	"content-type": string;
	size:number;
	created: string | Date;
	name: string;
	creator: string;
	status: string;
	filedescription: string;
	thumbnail:string;
	downloads:number;
	views:number;
	version: string;
}

export interface FileVersion {
	id: string;
	"version_id": string;
	"file_id": string;
	"creator": string;
	"created": string | Date;
}

export interface FileMetadataList{
	id: string;
	metadata: FileMetadata;
}

export interface Preview{
	"p_id": string;
	"pv_route": string;
	"pv_id": string;
	"p_path": string;
	"pv_contenttype": string;
}

export interface FilePreview{
	"file_id": string;
	previews: Preview[];
}

export interface PreviewConfiguration{
	previewType: string;
	url:string;
	fileid:string;
	previewer:string;
	fileType:string;
	resource:string | null;
}

export interface Path{
	name: string;
	id: string;
	type:string
}

export interface ExtractedMetadata{
	filename:string;
}

export interface MetadataJsonld{
	"id":string;
	"@context": (Context|string)[];
	agent:Agent;
	"attached_to": AttatchTo;
	content: any;
	"created_at": string | Date;
}

interface Context{
	database:string;
	scan:string;
}

interface Agent{
	"@type": string;
	"extractor_id": string;
	name: string
}

interface AttatchTo{
	"resource_type": string;
	url: string;
}

export interface Thumbnail{
	id: string;
	thumbnail: string;
}

export interface DatasetState{
	files: File[];
	datasets: Dataset[];
	about: About;
}

export interface FileState{
	fileMetadata: FileMetadata;
	extractedMetadata: ExtractedMetadata;
	metadataJsonld: MetadataJsonld[];
	previews: FilePreview[];
	fileVersions: FileVersion[];
}

export interface UserState{
	Authorization: string | null;
	loginError: boolean;
	registerSucceeded: boolean;
	errorMsg: string;
}

export interface ErrorState{
	stack: string;
	reason: string;
	loggedOut: boolean;
}

export interface RootState {
	error: ErrorState;
	file:FileState;
	dataset:DatasetState;
	user: UserState;
}

