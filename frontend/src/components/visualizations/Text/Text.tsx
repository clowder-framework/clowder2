import React, { useEffect, useState } from "react";
import ShowMoreText from "react-show-more-text";
import { readTextFromFile } from "../../../utils/common";

import { downloadVisData, fileDownloaded } from "../../../utils/visualization";

type TextProps = {
	fileId?: string;
	visualizationId?: string;
};

export default function Text(props: TextProps) {
	const { fileId, visualizationId } = props;
	const [text, setText] = useState("");

	useEffect(() => {
		const processBlob = async () => {
			try {
				let blob;
				if (visualizationId) {
					blob = await downloadVisData(visualizationId);
				} else {
					blob = await fileDownloaded(fileId, 0);
				}
				const file = new File([blob], "text.tmp");
				const text = await readTextFromFile(file);
				setText(text);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		processBlob();
	}, [visualizationId, fileId]);

	return (
		<ShowMoreText
			/* Default options */
			lines={10}
			more="Show more"
			less="Show less"
			className="content-css"
			anchorClass="show-more-less-clickable"
			expanded={false}
			truncatedEndingComponent={"... "}
		>
			{text}
		</ShowMoreText>
	);
}
