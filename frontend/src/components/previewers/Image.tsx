import React, { useEffect } from "react";
import { Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { generateFileDownloadUrl as generateFileDownloadUrlAction } from "../../actions/file";
import { RootState } from "../../types/data";

type ImageProps = {
	fileId: string;
};

export default function Image(props: ImageProps) {
	const { fileId } = props;

	const dispatch = useDispatch();

	const generateFileDownloadUrl = (
		fileId: string | undefined,
		filename: string,
		fileVersionNum: number
	) =>
		dispatch(generateFileDownloadUrlAction(fileId, filename, fileVersionNum));

	const url = useSelector((state: RootState) => state.file.url);

	useEffect(() => {
		generateFileDownloadUrl(fileId);
	}, [fileId]);

	return (() => {
		if (url) {
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
			return <Typography>ERROR: Unable to render image.</Typography>;
		}
	})();
}
