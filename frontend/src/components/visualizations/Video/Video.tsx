import React, { useEffect, useState } from "react";
import {
	generateFileDownloadUrl,
	generateVisDataDownloadUrl,
} from "../../../utils/visualization";

type VideoProps = {
	fileId?: string;
	visualizationId?: string;
};

export default function Video(props: VideoProps) {
	const { fileId, visualizationId } = props;

	const [url, setUrl] = useState("");

	useEffect(() => {
		let downloadUrl;
		if (visualizationId) {
			downloadUrl = generateVisDataDownloadUrl(visualizationId);
		} else {
			downloadUrl = generateFileDownloadUrl(fileId, 0);
		}
		setUrl(downloadUrl);
	}, [visualizationId, fileId]);

	return (() => {
		if (url && url !== "") {
			return (
				<video
					width="100%"
					id={`video-${fileId}`}
					controls
					style={{ maxWidth: "100%", maxHeight: "100%" }}
				>
					<source id={fileId} src={url} />
				</video>
			);
		} else {
			return <></>;
		}
	})();
}
