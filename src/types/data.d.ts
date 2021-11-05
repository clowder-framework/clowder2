interface Dataset {
	id:string;
	name: string;
	description: string;
	created: string;
	status: string;
}

interface File {
	id: string;
	filename: string;
	size: number;
	"date-created": string;
	contentType:string;
	status:string;
}

interface about {
	name: string;
	id: string;
	authorId: string;
	description: string;
	created: string;
	thumbnail: string;
}

interface MetadataJsonld {
	id: string;
	"content-type": string;
	size:number;
	"date-created": string;
	filename: string;
	authorId: string;
	status: string;
}

interface Preview{
	previews: filePreview[];
}

interface filePreview{
	"p_id": string;
	"pv_route": string;
	"pv_id": string;
	"p_path": string;
	"pv_contenttype": string;
}

interface DataState {
	metadataJsonld: MetadataJsonld[];
	previews: Preview[];
	about: about;
	files: File[];
	datasets: Dataset[];
	status: string;
}
