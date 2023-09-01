import React, { useEffect, useState } from "react";
import {
	generateFileDownloadUrl,
	generateVisDataDownloadUrl,
} from "../../../utils/visualization";

type AudioProps = {
	fileId?: string;
	visualizationId?: string;
};

export default function Audio(props: AudioProps) {
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
				<audio controls style={{ maxWidth: "100%", maxHeight: "100%" }}>
					<source id={fileId} src={url} />
				</audio>
			);
		} else {
			return <></>;
		}
	})();
}
