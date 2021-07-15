import {connect} from "react-redux";
import FileComponent from "../components/File";
import {fetchFileExtractedMetadata, fetchFileMetadata, fetchFileMetadataJsonld} from "../actions/file";


const mapStateToProps = (state) => {
	return {
		fileMetadata: state.file.metadata,
		fileExtractedMetadata: state.file.extractedMetadata,
		fileMetadataJsonld: state.file.metadataJsonld
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		listFileMetadata: (id) => {
			dispatch(fetchFileMetadata(id));
		},
		listFileExtractedMetadata: (id) => {
			dispatch(fetchFileExtractedMetadata(id));
		},
		listFileMetadataJsonld: (id) => {
			dispatch(fetchFileMetadataJsonld(id));
		}
	};
};

const File = connect(mapStateToProps, mapDispatchToProps)(FileComponent);

export default File;
