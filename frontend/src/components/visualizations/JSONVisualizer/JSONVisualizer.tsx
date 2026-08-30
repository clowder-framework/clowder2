import React, { useEffect, useState } from "react";
import {
	Button,
	Card,
	CardContent,
	CardActions,
	CircularProgress,
} from "@mui/material";
import CodeMirror from "@uiw/react-codemirror"; // CodeMirror editor
import { json } from "@codemirror/lang-json"; // JSON language support for CodeMirror

import { downloadVisData, fileDownloaded } from "../../../utils/visualization";
import { updateFile as updateFileAction } from "../../../actions/file";
import { readTextFromFile } from "../../../utils/common";
import { downloadPublicVisData } from "../../../actions/public_visualization";
import { filePublicDownloaded } from "../../../actions/public_file";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../types/data";

type jsonProps = {
	fileId?: string;
	visualizationId?: string;
	publicView?: boolean;
};

export default function JSONVisualizer(props: jsonProps) {
	const { fileId, visualizationId, publicView } = props;
	const selectedFileVersion = useSelector(
		(state: RootState) => state.file.selected_version_num
	);
	const fileSummary = useSelector((state: RootState) => state.file.fileSummary);

	// State to store the original content of the file and the displayed JSON content that can be edited
	const [originalContent, setOriginalContent] = useState<string | undefined>();
	const [jsonContent, setJsonContent] = useState<string | undefined>();

	// Utility state to help with saving the file, displaying loading spinner and validating JSON
	const [fileName, setFileName] = useState<string | undefined>();
	const [loading, setLoading] = useState<boolean>(false);
	const [validJson, setValidJson] = useState<boolean>(true);

	// use useDispatch to update file
	const dispatch = useDispatch();
	const updateFile = async (file: File, fileId: string | undefined) =>
		dispatch(updateFileAction(file, fileId));

	useEffect(() => {
		if (fileSummary) {
			setFileName(fileSummary.name);
		}
	}, [fileSummary]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				let blob;
				if (visualizationId) {
					blob = publicView
						? await downloadPublicVisData(visualizationId)
						: await downloadVisData(visualizationId);
				} else {
					blob = publicView
						? await filePublicDownloaded(fileId)
						: await fileDownloaded(fileId, selectedFileVersion);
				}

				const file = new File([blob], fileName);
				const text = await readTextFromFile(file);
				setOriginalContent(text);
				setJsonContent(text);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};
		fetchData();
	}, [visualizationId, fileId, publicView, selectedFileVersion]);

	const validateJson = (jsonString: string) => {
		try {
			JSON.parse(jsonString);
			return true;
		} catch (error) {
			return false;
		}
	};

	const handleChange = (value: string) => {
		setJsonContent(value);
		setValidJson(validateJson(value));
	};

	const handleSave = async () => {
		try {
			if (jsonContent !== undefined && fileName && fileSummary?.content_type) {
				const textBlob = new Blob([jsonContent], { type: "text/plain" });
				const file = new File([textBlob], fileName, {
					type: fileSummary.content_type.content_type,
				});

				setLoading(true);
				await updateFile(file, fileId);
				setLoading(false);

				// Refreshing the page to reflect the changes. TODO: Find a better way to update the version
				window.location.reload();
			}
		} catch (error) {
			console.error("Error updating file:", error);
		}
	};

	const disableSaveButton = () => {
		return originalContent === jsonContent || !validJson;
	};

	// Flag for previous versions
	const isPreviousVersion = () => {
		return selectedFileVersion !== fileSummary?.version_num;
	};
	return (
		<Card>
			<CardContent>
				{loading ? (
					<CircularProgress />
				) : (
					<CodeMirror
						value={jsonContent}
						extensions={[json()]}
						onChange={(value) => handleChange(value)}
						theme="dark"
					/>
				)}
			</CardContent>
			<CardActions>
				{!isPreviousVersion() && (
					<Button
						variant="contained"
						color="primary"
						onClick={handleSave}
						disabled={disableSaveButton()}
					>
						Save Changes
					</Button>
				)}
			</CardActions>
		</Card>
	);
}
