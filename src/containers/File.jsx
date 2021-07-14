import {connect} from "react-redux";
import FileComponent from "../components/File";
import {fetchFile} from "../actions/file";


const mapStateToProps = (state) => {
	return {
		file: state.file.file
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		listFile: (limit, offset, type) => {
			dispatch(fetchFile(limit, offset, type));
		}
	};
};

const BuiltEnvironment = connect(mapStateToProps, mapDispatchToProps)(FileComponent);

export default FileComponent;
