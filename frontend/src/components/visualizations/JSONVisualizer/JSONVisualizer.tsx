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
	const [jsonContent, setJsonContent] = useState<string | undefined>();
	const [fileName, setFileName] = useState<string | undefined>();
	const [loading, setLoading] = useState<boolean>(false);

	// use useSelector to get fileSummary to get filename.
	const fileData = useSelector((state: RootState) => state.file);

	// use useDispatch to update file
	const dispatch = useDispatch();
	const updateFile = async (file: File, fileId: string | undefined) =>
		dispatch(updateFileAction(file, fileId));

	useEffect(() => {
		if (fileData.fileSummary) {
			setFileName(fileData.fileSummary.name);
		}
	}, [fileData.fileSummary]);

	useEffect(() => {
		console.log("fileData", fileData.fileSummary.content_type);
	}, [fileName]);

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
						: await fileDownloaded(fileId, 0);
				}

				const file = new File([blob], fileName);
				const text = await readTextFromFile(file);
				setJsonContent(text);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};
		fetchData();
	}, [visualizationId, fileId, publicView]);

	const handleSave = async () => {
		try {
			if (
				jsonContent !== undefined &&
				fileName &&
				fileData.fileSummary?.content_type
			) {
				// Parse the jsonContent to ensure it's valid JSON
				const textBlob = new Blob([jsonContent], { type: "text/plain" });
				const file = new File([textBlob], fileName, {
					type: fileData.fileSummary.content_type.content_type,
				});

				setLoading(true);
				await updateFile(file, fileId);
				setLoading(false);
			}
		} catch (error) {
			console.error("Error updating file:", error);
		}
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
						onChange={(value) => setJsonContent(value)}
						theme="dark"
					/>
				)}
			</CardContent>
			<CardActions>
				<Button variant="contained" color="primary" onClick={handleSave}>
					Save Changes
				</Button>
			</CardActions>
		</Card>
	);
}
