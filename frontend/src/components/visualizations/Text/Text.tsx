import React, { useEffect, useState } from "react";
import ShowMoreText from "react-show-more-text";
import { readTextFromFile } from "../../../utils/common";

import { downloadVisData,  publicFileDownloaded, fileDownloaded } from "../../../utils/visualization";
import {downloadPublicVisData} from "../../../actions/public_visualization";

type TextProps = {
	fileId?: string;
	visualizationId?: string;
	publicView?: boolean;
};

export default function Text(props: TextProps) {
	const { fileId, visualizationId, publicView } = props;
	const [text, setText] = useState("");
	useEffect(() => {
		const processBlob = async () => {
			try {
				let blob;
				if (visualizationId) {
					if (publicView){
						blob = await downloadPublicVisData(visualizationId);
					} else {
						blob = await downloadVisData(visualizationId);
					}
				} else {
					if (publicView){
						console.log('public file download blob');
						blob = await publicFileDownloaded(fileId);
						console.log(blob);
					} else {
						console.log('downloading blob here');
						blob = await fileDownloaded(fileId);
						console.log(blob);
					}
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
