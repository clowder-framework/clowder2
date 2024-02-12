import React, { useEffect, useState } from "react";
import {
	generateFileDownloadUrl,
	generatePublicFileDownloadUrl,
	generatePublicVisDataDownloadUrl,
	generateVisDataDownloadUrl,
} from "../../../utils/visualization";

type AudioProps = {
	fileId?: string;
	visualizationId?: string;
	publicView?: boolean | false;
};

export default function Audio(props: AudioProps) {
	const { fileId, visualizationId, publicView } = props;

	const [url, setUrl] = useState("");

	useEffect(() => {
		let downloadUrl;
		if (visualizationId) {
			if (publicView) {
				downloadUrl = generatePublicVisDataDownloadUrl(visualizationId);
			} else {
				downloadUrl = generateVisDataDownloadUrl(visualizationId);
			}
		} else {
			if (publicView) {
				downloadUrl = generatePublicFileDownloadUrl(fileId, 0);
			} else {
				downloadUrl = generateFileDownloadUrl(fileId, 0);
			}
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
