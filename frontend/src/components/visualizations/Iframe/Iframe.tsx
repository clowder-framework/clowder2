import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	GENERATE_FILE_URL,
	generateFileDownloadUrl as generateFileDownloadUrlAction,
} from "../../../actions/file";

import { RootState } from "../../../types/data";
import {
	GENERATE_VIS_URL,
	generateVisDataDownloadUrl as generateVisDataDownloadUrlAction,
} from "../../../actions/visualization";

type IframeProps = {
	fileId?: string;
	visualizationId?: string;
};

export default function string(props: IframeProps) {
	const { fileId, visualizationId } = props;

	const dispatch = useDispatch();

	const generateFileDownloadUrl = (
		fileId: string | undefined,
		fileVersionNum: number | undefined
	) => dispatch(generateFileDownloadUrlAction(fileId, fileVersionNum));

	const generateVisDataDownloadUrl = (visualizationId: string | undefined) =>
		dispatch(generateVisDataDownloadUrlAction(visualizationId));

	const rawFileURL = useSelector((state: RootState) => state.file.url);
	const visFileURL = useSelector((state: RootState) => state.visualization.url);

	const [url, setUrl] = useState("");

	useEffect(() => {
		// reset
		return () => {
			dispatch({
				type: GENERATE_FILE_URL,
				url: "",
				receivedAt: Date.now(),
			});
			dispatch({
				type: GENERATE_VIS_URL,
				url: "",
				receivedAt: Date.now(),
			});
		};
	}, []);

	useEffect(() => {
		if (visualizationId) generateVisDataDownloadUrl(visualizationId);
		else generateFileDownloadUrl(fileId, 0);
	}, [visualizationId, fileId]);

	useEffect(() => {
		if (visFileURL && visFileURL !== "") setUrl(visFileURL);
		else setUrl(rawFileURL);
	}, [visFileURL, rawFileURL]);

	return (() => {
		if (url && url !== "") {
			return (
				<iframe
					id={fileId}
					src={url}
					style={{ width: "100%", height: "50em" }}
				></iframe>
			);
		} else {
			return <></>;
		}
	})();
}
