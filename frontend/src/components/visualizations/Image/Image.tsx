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
