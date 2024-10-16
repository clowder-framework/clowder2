import React, { useEffect, useState } from "react";
import { Button, Card, CardContent, CardActions } from "@mui/material";
import CodeMirror from "@uiw/react-codemirror"; // CodeMirror editor
import { json } from "@codemirror/lang-json"; // JSON language support for CodeMirror
import {
	downloadVisData,
	fileDownloaded,
	updateFile,
} from "../../../utils/visualization";
import { readTextFromFile } from "../../../utils/common";
import { downloadPublicVisData } from "../../../actions/public_visualization";
import { filePublicDownloaded } from "../../../actions/public_file";

type jsonProps = {
	fileId?: string;
	visualizationId?: string;
	publicView?: boolean;
};

export default function JSON(props: jsonProps) {
	const { fileId, visualizationId, publicView } = props;
	const [jsonContent, setJsonContent] = useState<string | undefined>();

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

				const file = new File([blob], "data.json");
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
			await updateFile(fileId, jsonContent);
		} catch (error) {
			console.error("Error updating file:", error);
		}
	};

	return (
		<Card>
			<CardContent>
				<CodeMirror
					value={jsonContent}
					extensions={[json()]}
					onChange={(value) => setJsonContent(value)}
					theme="dark"
				/>
			</CardContent>
			<CardActions>
				<Button variant="contained" color="primary" onClick={handleSave}>
					Save Changes
				</Button>
			</CardActions>
		</Card>
	);
}
