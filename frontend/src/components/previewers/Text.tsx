import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
	DOWNLOAD_FILE,
	fileDownloaded as fileDownloadedAction,
} from "../../actions/file";
import ShowMoreText from "react-show-more-text";
import { RootState } from "../../types/data";
import { readTextFromFile } from "../../utils/common";

type TextProps = {
	fileId: string;
};

export default function Text(props: TextProps) {
	const { fileId } = props;

	const dispatch = useDispatch();

	const downloadFile = (
		fileId: string | undefined,
		filename: string | undefined,
		fileVersionNum: number | undefined,
		autoSave: boolean
	) =>
		dispatch(fileDownloadedAction(fileId, filename, fileVersionNum, autoSave));
	const blob = useSelector((state: RootState) => state.file.blob);

	const [text, setText] = useState("");

	useEffect(() => {
		downloadFile(fileId, "text.tmp", 0, false);
	}, [fileId]);

	useEffect(() => {
		return () => {
			dispatch({
				type: DOWNLOAD_FILE,
				blob: new Blob([]),
				receivedAt: Date.now(),
			});
		};
	}, []);

	useEffect(() => {
		const processBlob = async () => {
			const file = new File([blob], "text.tmp");
			const text = await readTextFromFile(file);
			setText(text);
		};

		processBlob();
	}, [blob]);

	return (() => {
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
	})();
}
