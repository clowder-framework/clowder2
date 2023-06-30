import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../types/data";
import {
	GENERATE_FILE_URL,
	generateFileDownloadUrl as generateFileDownloadUrlAction,
} from "../../../actions/file";

import {
	GENERATE_VIZ_URL,
	generateVizDataDownloadUrl as generateVizDataDownloadUrlAction,
} from "../../../actions/visualization";

type AudioProps = {
	fileId?: string;
	visualizationId?: string;
};

export default function Audio(props: AudioProps) {
	const { fileId, visualizationId } = props;

	const dispatch = useDispatch();

	const generateFileDownloadUrl = (
		fileId: string | undefined,
		fileVersionNum: number | undefined
	) => dispatch(generateFileDownloadUrlAction(fileId, fileVersionNum));

	const generateVizDataDownloadUrl = (visualizationId: string | undefined) =>
		dispatch(generateVizDataDownloadUrlAction(visualizationId));

	const rawFileURL = useSelector((state: RootState) => state.file.url);
	const vizFileURL = useSelector((state: RootState) => state.visualization.url);

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
				type: GENERATE_VIZ_URL,
				url: "",
				receivedAt: Date.now(),
			});
		};
	}, []);

	useEffect(() => {
		if (visualizationId) generateVizDataDownloadUrl(visualizationId);
		else generateFileDownloadUrl(fileId, 0);
	}, [visualizationId, fileId]);

	useEffect(() => {
		if (vizFileURL && vizFileURL !== "") setUrl(vizFileURL);
		else setUrl(rawFileURL);
	}, [vizFileURL, rawFileURL]);

	return (() => {
		if (url && url !== "") {
			return (
				<audio controls style={{ maxWidth: "100%", maxHeight: "100%" }}>
					<source id={fileId} src={url} />
				</audio>
			);
		} else {
			return <></>;
		}
	})();
}
