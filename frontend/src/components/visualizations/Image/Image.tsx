import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { generateFileDownloadUrl as generateFileDownloadUrlAction } from "../../../actions/file";
// import {
// 	GENERATE_VIS_URL,
// 	generateVisDataDownloadUrl as generateVisDataDownloadUrlAction,
// } from "../../../actions/visualization";
import { generateVisDataDownloadUrl } from "../../../utils/thumbnail";

type ImageProps = {
	fileId?: string;
	visualizationId?: string;
};

export default function Image(props: ImageProps) {
	const { fileId, visualizationId } = props;

	const dispatch = useDispatch();

	const generateFileDownloadUrl = (
		fileId: string | undefined,
		fileVersionNum: number | undefined
	) => dispatch(generateFileDownloadUrlAction(fileId, fileVersionNum));

	// const generateVisDataDownloadUrl = (visualizationId: string | undefined) =>
	// 	dispatch(generateVisDataDownloadUrlAction(visualizationId));

	// const rawFileURL = useSelector((state: RootState) => state.file.url);
	// const visFileURL = useSelector((state: RootState) => state.visualization.url);

	const [url, setUrl] = useState("");

	// useEffect(() => {
	// 	// reset
	// 	return () => {
	// 		dispatch({
	// 			type: GENERATE_FILE_URL,
	// 			url: "",
	// 			receivedAt: Date.now(),
	// 		});
	// 		dispatch({
	// 			type: GENERATE_VIS_URL,
	// 			url: "",
	// 			receivedAt: Date.now(),
	// 		});
	// 	};
	// }, []);

	useEffect(() => {
		if (visualizationId) {
			setUrl(await generateVisDataDownloadUrl(visualizationId));
		} else {
			generateFileDownloadUrl(fileId, 0);
		}
	}, [visualizationId, fileId]);

	// useEffect(() => {
	// 	if (visFileURL && visFileURL !== "") setUrl(visFileURL);
	// 	else setUrl(rawFileURL);
	// }, [visFileURL, rawFileURL]);

	return (() => {
		if (url && url !== "") {
			return (
				<img
					className="rubberbandimage"
					src={url}
					alt="img"
					id={`rubberbandCanvas-${fileId}`}
					style={{ maxWidth: "100%", maxHeight: "100%" }}
				/>
			);
		} else {
			return <></>;
		}
	})();
}
