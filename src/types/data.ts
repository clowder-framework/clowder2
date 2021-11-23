export interface Dataset {
	id:string;
	name: string;
	description: string;
	created: string;
	status: string;
	thumbnail: string;
}

export interface File {
	id: string;
	filename: string;
	size: number;
	"date-created": string;
	contentType:string;
	status:string;
}

export interface About {
	name: string;
	id: string;
	authorId: string;
	description: string;
	created: string;
	thumbnail: string;
}

export interface FileMetadata {
	id: string;
	"content-type": string;
	size:number;
	"date-created": string;
	filename: string;
	authorId: string;
	status: string;
	filedescription: string;
	thumbnail:string;
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
	"created_at": string
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
	status:string;
}

export interface FileState{
	fileMetadata: FileMetadata;
	extractedMetadata: ExtractedMetadata;
	metadataJsonld: MetadataJsonld[];
	previews: FilePreview[];
}

export interface RootState {
	file:FileState;
	dataset:DatasetState;
}

