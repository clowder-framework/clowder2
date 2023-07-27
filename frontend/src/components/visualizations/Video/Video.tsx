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
		const fetchUrl = async () => {
			try {
				let downloadUrl;
				if (visualizationId) {
					downloadUrl = await generateVisDataDownloadUrl(visualizationId);
				} else {
					downloadUrl = await generateFileDownloadUrl(fileId, 0);
				}
				setUrl(downloadUrl);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchUrl();
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
