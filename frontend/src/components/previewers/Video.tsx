import React, { useEffect } from "react";
import { Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { generateFileDownloadUrl as generateFileDownloadUrlAction } from "../../actions/file";

import { RootState } from "../../types/data";

type VideoProps = {
	fileId: string;
};

export default function Video(props: VideoProps) {
	const { fileId } = props;

	const dispatch = useDispatch();

	const generateFileDownloadUrl = (
		fileId: string | undefined,
		fileVersionNum: number | null
	) => dispatch(generateFileDownloadUrlAction(fileId, fileVersionNum));

	const url = useSelector((state: RootState) => state.file.url);

	useEffect(() => {
		generateFileDownloadUrl(fileId, 0);
	}, [fileId]);

	return (() => {
		if (url) {
			return (
				<video
					width="100%"
					id={`video-${fileId}`}
					controls
					style={{ maxWidth: "100%", maxHeight: "100%" }}
				>
					<source id={fileId} src={url} />
				</video>
			);
		} else {
			return <Typography>ERROR: Unable to render video.</Typography>;
		}
	})();
}
