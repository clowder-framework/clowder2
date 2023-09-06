import React, { useEffect, useState } from "react";
import {
	generateFileDownloadUrl,
	generateVisDataDownloadUrl,
} from "../../../utils/visualization";

type IframeProps = {
	fileId?: string;
	visualizationId?: string;
};

export default function string(props: IframeProps) {
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
