import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
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

	const dispatch = useDispatch();

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
				<audio controls style={{ maxWidth: "100%", maxHeight: "100%" }}>
					<source id={fileId} src={url} />
				</audio>
			);
		} else {
			return <></>;
		}
	})();
}
