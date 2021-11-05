export interface Dataset {
	id:string;
	name: string;
	description: string;
	created: string;
	status: string;
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

export interface MetadataJsonld {
	id: string;
	"content-type": string;
	size:number;
	"date-created": string;
	filename: string;
	authorId: string;
	status: string;
}

export interface Preview{
	previews: filePreview[];
}

export interface filePreview{
	"p_id": string;
	"pv_route": string;
	"pv_id": string;
	"p_path": string;
	"pv_contenttype": string;
}

export interface ExtractedMetadata{

}

export interface DataState {
	metadataJsonld: MetadataJsonld[];
	previews: Preview[];
	about: About;
	files: File[];
	datasets: Dataset[];
	status: string;
}
