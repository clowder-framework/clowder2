import React, { useEffect, useState } from "react";
import {
	generateFileDownloadUrl,
	generateVisDataDownloadUrl,
	generatePublicVisDataDownloadUrl,
	generatePublicFileDownloadUrl,
} from "../../../utils/visualization";

type ImageProps = {
	fileId?: string;
	visualizationId?: string;
	publicView?: boolean | false;
};

export default function Image(props: ImageProps) {
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
				<img
					className="rubberbandimage"
					src={url}
					alt="img"
					id={`rubberbandCanvas-${fileId}`}
					style={{ width: "100%" }}
				/>
			);
		} else {
			return <></>;
		}
	})();
}
