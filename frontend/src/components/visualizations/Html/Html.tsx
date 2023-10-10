import React, {useEffect, useRef, useState} from "react";
import {downloadVisData, fileDownloaded,} from "../../../utils/visualization";
import {readTextFromFile} from "../../../utils/common";

type htmlProps = {
	fileId?: string;
	visualizationId?: string;
};

export default function Html(props: htmlProps) {
	const {fileId, visualizationId} = props;
	const divRef = useRef(null);
	const isFirstRender = useRef(true);

	const [html, setHtml] = useState();

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
				setHtml(text);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		processBlob();
	}, [visualizationId, fileId]);

	useEffect(() => {
		if (html && divRef.current) {
			const slotHtml = document.createRange().createContextualFragment(html);
			divRef.current.innerHTML = ""; // Clear the container
			divRef.current.appendChild(slotHtml); // Append the new content
		}

		if (!isFirstRender.current) return;
		isFirstRender.current = false;
	}, [html, divRef])

	return (<div ref={divRef} style={{width: "auto", maxHeight: "100vh", overflow: "auto"}}/>);
}
