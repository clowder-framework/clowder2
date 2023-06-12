import React, { useState } from "react";
import { Typography } from "@mui/material";
import { generateFileDownloadUrl } from "../../utils/file";

type ImageProps = {
	fileId: string;
	imgSrc: string | null;
	fileType: string | null;
};

export default function Image(props: ImageProps) {
	const { fileId, imgSrc, fileType } = props;

	const [src, setSrc] = useState(imgSrc ?? undefined);

	// if imgSrc doesn't exist, stream from raw bytes
	if (!imgSrc) {
		setSrc(await generateFileDownloadUrl(fileId));
	}

	return (() => {
		if (fileType?.toLowerCase().includes("image/")) {
			return (
				<img
					className="rubberbandimage"
					src={src}
					alt="img"
					id={`rubberbandCanvas-${fileId}`}
				/>
			);
		} else {
			return <Typography>ERROR: Unrecognised image format.</Typography>;
		}
	})();
}
