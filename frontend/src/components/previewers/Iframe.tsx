import React, { useEffect } from "react";
import { Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { generateFileDownloadUrl as generateFileDownloadUrlAction } from "../../actions/file";

import { RootState } from "../../types/data";

type IframeProps = {
	fileId: string;
};

export default function Iframe(props: IframeProps) {
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
				<iframe
					id={fileId}
					src={url}
					style={{ width: "100%", height: "50em" }}
				></iframe>
			);
		} else {
			return <Typography>ERROR: Unable to render html.</Typography>;
		}
	})();
}
