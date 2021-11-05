import {connect} from "react-redux";
import {App as AppComponent} from "../components/App";
import {
	deleteFile,
	fetchFileExtractedMetadata,
	fetchFileMetadataJsonld,
	fetchFilePreviews
} from "../actions/file";

import {
	fetchFilesInDataset,
	fetchDatasetAbout,
	fetchDatasets,
	deleteDataset
} from "../actions/dataset";
import {AppDispatch, RootState} from "../index";

const mapStateToProps = (state: RootState) => {
	return {
		fileExtractedMetadata: state.file.extractedMetadata,
		fileMetadataJsonld: state.file.metadataJsonld,
		filePreviews: state.file.previews,
		filesInDataset: state.dataset.files,
		datasetAbout: state.dataset.about,
		datasets: state.dataset.datasets,
		status: state.dataset.status,
	};
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
	return {
		listFileExtractedMetadata: (fileId:string) => {
			dispatch(fetchFileExtractedMetadata(fileId));
		},
		listFileMetadataJsonld: (fileId:string) => {
			dispatch(fetchFileMetadataJsonld(fileId));
		},
		listFilePreviews: (fileId:string) => {
			dispatch(fetchFilePreviews(fileId));
		},
		listFilesInDataset: (datasetId:string) => {
			dispatch(fetchFilesInDataset(datasetId));
		},
		deleteFile: (fileId:string) => {
			dispatch(deleteFile(fileId));
		},
		listDatasetAbout: (datasetId:string) => {
			dispatch(fetchDatasetAbout(datasetId));
		},
		listDatasets: (when:string, date:string, limit:string) =>{
			dispatch(fetchDatasets(when, date, limit));
		},
		deleteDataset: (datasetId:string) => {
			dispatch(deleteDataset(datasetId));
		}
	};
};

const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);

// export type PropsFromRedux = ConnectedProps<typeof App>;

export default App;
