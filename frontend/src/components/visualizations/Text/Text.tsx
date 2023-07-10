import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
	DOWNLOAD_FILE,
	fileDownloaded as fileDownloadedAction,
} from "../../../actions/file";

import {
	DOWNLOAD_VIS_DATA,
	downloadVisData as downloadVisDataAction,
} from "../../../actions/visualization";
import ShowMoreText from "react-show-more-text";
import { RootState } from "../../../types/data";
import { readTextFromFile } from "../../../utils/common";

type TextProps = {
	fileId?: string;
	visualizationId?: string;
};

export default function Text(props: TextProps) {
	const { fileId, visualizationId } = props;

	const dispatch = useDispatch();

	const downloadFile = (
		fileId: string | undefined,
		filename: string | undefined,
		fileVersionNum: number | undefined,
		autoSave: boolean
	) =>
		dispatch(fileDownloadedAction(fileId, filename, fileVersionNum, autoSave));
	const downloadVisData = (
		visualizationId: string | undefined,
		filename: string | undefined,
		autoSave: boolean
	) => dispatch(downloadVisDataAction(visualizationId, filename, autoSave));

	const rawFileBlob = useSelector((state: RootState) => state.file.blob);
	const visFileBlob = useSelector(
		(state: RootState) => state.visualization.blob
	);

	const [text, setText] = useState("");

	useEffect(() => {
		return () => {
			dispatch({
				type: DOWNLOAD_FILE,
				blob: new Blob([]),
				receivedAt: Date.now(),
			});
			dispatch({
				type: DOWNLOAD_VIS_DATA,
				blob: new Blob([]),
				receivedAt: Date.now(),
			});
		};
	}, []);

	useEffect(() => {
		if (visualizationId) downloadVisData(visualizationId, "text.tmp", false);
		else downloadFile(fileId, "text.tmp", 0, false);
	}, [visualizationId, fileId]);

	useEffect(() => {
		let blob = new Blob([]);
		if (visFileBlob.size > 0) blob = visFileBlob;
		else if (rawFileBlob.size > 0) blob = rawFileBlob;

		const processBlob = async () => {
			const file = new File([blob], "text.tmp");
			const text = await readTextFromFile(file);
			setText(text);
		};

		processBlob();
	}, [visFileBlob, rawFileBlob]);

	return (
		<ShowMoreText
			/* Default options */
			lines={10}
			more="Show more"
			less="Show less"
			className="content-css"
			anchorClass="show-more-less-clickable"
			expanded={false}
			truncatedEndingComponent={"... "}
		>
			{text}
		</ShowMoreText>
	);
}
