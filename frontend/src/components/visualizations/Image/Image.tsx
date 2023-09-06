import React, { useEffect, useState } from "react";
import {
	generateFileDownloadUrl,
	generateVisDataDownloadUrl,
} from "../../../utils/visualization";

type ImageProps = {
	fileId?: string;
	visualizationId?: string;
};

export default function Image(props: ImageProps) {
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
