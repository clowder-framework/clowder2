import {About, Dataset, ExtractedMetadata, File, MetadataJsonld, FilePreview, FileMetadata} from "./data";

interface RECEIVE_FILES_IN_DATASET {
	type: "RECEIVE_FILES_IN_DATASET";
	files: File[];
}

interface DELETE_FILE {
	type: "DELETE_FILE";
	file: File;
}

interface RECEIVE_DATASET_ABOUT{
	type: "RECEIVE_DATASET_ABOUT";
	about: About;
}

interface RECEIVE_DATASETS{
	type: "RECEIVE_DATASETS";
	datasets: Dataset[];
}

interface DELETE_DATASET{
	type: "DELETE_DATASET";
	dataset: Dataset;
}
interface RECEIVE_FILE_METADATA{
	type:"RECEIVE_FILE_METADATA";
	fileMetadata: FileMetadata;
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

export type DataAction =
	| RECEIVE_FILES_IN_DATASET
	| DELETE_FILE
	| RECEIVE_DATASET_ABOUT
	| RECEIVE_DATASETS
	| DELETE_DATASET
	| RECEIVE_FILE_METADATA
	| RECEIVE_FILE_EXTRACTED_METADATA
	| RECEIVE_FILE_METADATA_JSONLD
	| RECEIVE_PREVIEWS
	;
